"""
capture_manager.py — Orchestrator for the camera trap.

Consumes sensor readings from the queue, checks if ALL four sensors are
triggered (IR1=1, IR2=1, RCWL1=1, RCWL2=1), enforces a cooldown period,
and saves the photo + metadata locally when conditions are met.

Each capture is stored in its own timestamped subfolder under captures/:
    captures/
    └── 2026-04-26_12-30-45/
        ├── image.jpg
        └── metadata.json
"""

import json
import logging
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import config
from camera import capture_photo

logger = logging.getLogger(__name__)

# IST offset for timestamps
IST = timezone(timedelta(hours=5, minutes=30))


def is_all_sensors_triggered(data: dict) -> bool:
    """Check if ALL four sensors read 1."""
    return (
        data.get("IR1") == 1
        and data.get("IR2") == 1
        and data.get("RCWL1") == 1
        and data.get("RCWL2") == 1
    )


def save_metadata(folder: Path, data: dict, timestamp: str):
    """Save capture metadata as JSON alongside the image."""
    metadata = {
        "timestamp": timestamp,
        "box_id": config.BOX_ID,
        "lat": data.get("lat"),
        "lng": data.get("lng"),
        "sensors": {
            "IR1": data.get("IR1"),
            "IR2": data.get("IR2"),
            "RCWL1": data.get("RCWL1"),
            "RCWL2": data.get("RCWL2"),
        },
        "uploaded": False,
    }
    meta_path = folder / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Metadata saved: {meta_path}")


def capture_loop(sensor_queue):
    """
    Main capture loop — runs in the main thread.

    Blocks on the sensor queue, checks trigger + cooldown conditions,
    captures a photo and saves metadata when conditions are met.

    Args:
        sensor_queue: queue.Queue providing parsed sensor dicts from the reader.
    """
    last_capture_time = 0.0

    # Ensure the captures directory exists
    config.CAPTURE_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Capture directory: {config.CAPTURE_DIR}")
    logger.info(f"Cooldown: {config.COOLDOWN_SEC}s | Trigger: ALL sensors = 1")

    while True:
        try:
            # Block until a sensor reading arrives
            data = sensor_queue.get()

            # ── Check trigger condition ─────────────────────────────────
            if not is_all_sensors_triggered(data):
                continue

            # ── Check cooldown ──────────────────────────────────────────
            now = time.monotonic()
            elapsed = now - last_capture_time
            if elapsed < config.COOLDOWN_SEC:
                remaining = config.COOLDOWN_SEC - elapsed
                logger.debug(f"Cooldown active, {remaining:.1f}s remaining. Skipped.")
                continue

            # ── Capture! ────────────────────────────────────────────────
            timestamp = datetime.now(IST)
            folder_name = timestamp.strftime("%Y-%m-%d_%H-%M-%S")
            capture_folder = config.CAPTURE_DIR / folder_name
            capture_folder.mkdir(parents=True, exist_ok=True)

            image_path = capture_folder / "image.jpg"
            logger.info(f"ALL SENSORS TRIGGERED — capturing to {capture_folder}")

            success = capture_photo(str(image_path))

            if success:
                save_metadata(capture_folder, data, timestamp.isoformat())
                last_capture_time = now
                logger.info(f"Capture #{folder_name} complete.")
            else:
                logger.error("Photo capture failed. Metadata not saved.")
                # Clean up empty folder
                try:
                    capture_folder.rmdir()
                except OSError:
                    pass

        except Exception as e:
            logger.error(f"Error in capture loop: {e}", exc_info=True)
            time.sleep(1)
