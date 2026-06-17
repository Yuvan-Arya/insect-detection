"""
config.py — Central configuration for the Forest Wildlife Camera Trap.

All tunables live here. Hardware-specific values (serial port, camera index)
should be adjusted to match your Raspberry Pi wiring.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# ── Load .env ───────────────────────────────────────────────────────────────
load_dotenv()

# ── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
CAPTURE_DIR = BASE_DIR / "captures"
LOG_FILE = BASE_DIR / "forest_trap.log"

# ── Serial (Arduino via USB-TTL) ────────────────────────────────────────────
SERIAL_PORT = "/dev/ttyUSB0"      # Change to /dev/ttyACM0 if needed
BAUD_RATE = 9600
SERIAL_TIMEOUT = 1                # seconds

# ── Camera (USB Webcam) ─────────────────────────────────────────────────────
CAMERA_INDEX = 0                  # /dev/video0
CAMERA_WARMUP_SEC = 2.0           # let auto-exposure settle
JPEG_QUALITY = 85                 # 0-100, higher = bigger files

# ── Capture Logic ───────────────────────────────────────────────────────────
COOLDOWN_SEC = 10                 # min seconds between consecutive captures

# ── Uploader ────────────────────────────────────────────────────────────────
WIFI_CHECK_INTERVAL_SEC = 60      # how often to try uploading
PING_HOST = "8.8.8.8"             # used for connectivity check
PING_TIMEOUT_SEC = 3

# ── Supabase ────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_BUCKET = "wildlife-captures"
SUPABASE_TABLE = "captures"
BOX_ID = os.getenv("BOX_ID", "ENT-DEFAULT")
