"""
uploader.py — Syncs pending captures to Supabase when WiFi is available.

Runs as a daemon thread. Periodically checks internet connectivity by
pinging Google DNS. When online, scans the captures/ directory for folders
where metadata.json has "uploaded": false, uploads the image to Supabase
Storage and inserts the metadata row into the captures table.

On success, marks "uploaded": true in the local metadata.json so the
capture is not re-uploaded on subsequent cycles.
"""

import json
import logging
import platform
import subprocess
import time
from pathlib import Path

import config

logger = logging.getLogger(__name__)

# Lazy-init Supabase client (only when actually needed)
_supabase_client = None


def _get_supabase():
    """Lazy-initialize and return the Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        if not config.SUPABASE_URL or not config.SUPABASE_KEY:
            logger.error("SUPABASE_URL or SUPABASE_KEY not set in .env")
            return None
        from supabase import create_client
        _supabase_client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        logger.info("Supabase client initialized.")
    return _supabase_client


def is_online() -> bool:
    """Check internet connectivity by pinging a known host."""
    try:
        # Build ping command (platform-aware)
        param = "-n" if platform.system().lower() == "windows" else "-c"
        timeout_param = "-w" if platform.system().lower() == "windows" else "-W"
        cmd = [
            "ping", param, "1",
            timeout_param, str(config.PING_TIMEOUT_SEC),
            config.PING_HOST,
        ]
        result = subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=config.PING_TIMEOUT_SEC + 2,
        )
        return result.returncode == 0
    except Exception:
        return False


def get_pending_captures() -> list[Path]:
    """Return list of capture folders that haven't been uploaded yet."""
    pending = []
    if not config.CAPTURE_DIR.exists():
        return pending

    for folder in sorted(config.CAPTURE_DIR.iterdir()):
        if not folder.is_dir():
            continue
        meta_path = folder / "metadata.json"
        image_path = folder / "image.jpg"
        if not meta_path.exists() or not image_path.exists():
            continue
        try:
            with open(meta_path, "r") as f:
                meta = json.load(f)
            if not meta.get("uploaded", False):
                pending.append(folder)
        except (json.JSONDecodeError, OSError) as e:
            logger.warning(f"Skipping {folder.name}: {e}")
    return pending


def upload_capture(folder: Path) -> bool:
    """
    Upload a single capture (image + metadata) to Supabase.

    Args:
        folder: Path to the capture folder containing image.jpg and metadata.json.

    Returns:
        True if both the file upload and DB insert succeeded.
    """
    supabase = _get_supabase()
    if supabase is None:
        return False

    meta_path = folder / "metadata.json"
    image_path = folder / "image.jpg"

    try:
        with open(meta_path, "r") as f:
            meta = json.load(f)
    except Exception as e:
        logger.error(f"Cannot read metadata for {folder.name}: {e}")
        return False

    storage_path = f"{folder.name}.jpg"

    # ── Upload image to Storage bucket ──────────────────────────────────
    try:
        with open(image_path, "rb") as img_file:
            supabase.storage.from_(config.SUPABASE_BUCKET).upload(
                path=storage_path,
                file=img_file,
                file_options={"content-type": "image/jpeg"},
            )
        logger.info(f"Image uploaded: {storage_path}")
    except Exception as e:
        # If it's a duplicate (already uploaded), treat as success
        error_str = str(e).lower()
        if "duplicate" in error_str or "already exists" in error_str:
            logger.warning(f"Image already exists in storage: {storage_path}")
        else:
            logger.error(f"Storage upload failed for {folder.name}: {e}")
            return False

    # ── Insert metadata row into DB ─────────────────────────────────────
    try:
        row = {
            "captured_at": meta["timestamp"],
            "latitude": meta["lat"],
            "longitude": meta["lng"],
            "image_path": storage_path,
            "ir1": meta["sensors"]["IR1"],
            "ir2": meta["sensors"]["IR2"],
            "rcwl1": meta["sensors"]["RCWL1"],
            "rcwl2": meta["sensors"]["RCWL2"],
            "box_id": meta.get("box_id", config.BOX_ID),
        }
        supabase.table(config.SUPABASE_TABLE).insert(row).execute()
        logger.info(f"DB row inserted for: {folder.name}")
    except Exception as e:
        error_str = str(e).lower()
        if "duplicate" in error_str or "unique" in error_str:
            logger.warning(f"DB row already exists for: {folder.name}")
        else:
            logger.error(f"DB insert failed for {folder.name}: {e}")
            return False

    # ── Mark as uploaded locally ────────────────────────────────────────
    try:
        meta["uploaded"] = True
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)
    except Exception as e:
        logger.warning(f"Could not update metadata flag for {folder.name}: {e}")

    return True


def upload_loop():
    """
    Main upload loop — runs as a daemon thread.

    Periodically checks connectivity and uploads all pending captures
    when the device is online.
    """
    logger.info(
        f"Uploader started. Checking every {config.WIFI_CHECK_INTERVAL_SEC}s."
    )

    while True:
        try:
            time.sleep(config.WIFI_CHECK_INTERVAL_SEC)

            if not is_online():
                logger.debug("Offline. Will retry later.")
                continue

            logger.info("ONLINE — checking for pending uploads...")
            pending = get_pending_captures()

            if not pending:
                logger.info("No pending captures to upload.")
                continue

            logger.info(f"Found {len(pending)} pending capture(s). Uploading...")

            uploaded = 0
            failed = 0
            for folder in pending:
                if upload_capture(folder):
                    uploaded += 1
                else:
                    failed += 1

            logger.info(
                f"Upload cycle complete: {uploaded} uploaded, {failed} failed."
            )

        except Exception as e:
            logger.error(f"Error in upload loop: {e}", exc_info=True)
            time.sleep(10)
