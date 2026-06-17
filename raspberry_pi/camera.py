"""
camera.py — USB webcam capture utility.

Opens the webcam, waits for auto-exposure to settle, captures a single
frame, saves it as JPEG, and immediately releases the camera resource.

Designed for headless Raspberry Pi operation — no display windows are opened.
"""

import logging
import time
import cv2

import config

logger = logging.getLogger(__name__)


def capture_photo(save_path: str) -> bool:
    """
    Capture a single photo from the USB webcam and save as JPEG.

    Args:
        save_path: Full file path where the JPEG image will be saved.

    Returns:
        True if the image was captured and saved successfully, False otherwise.
    """
    cam = None
    try:
        cam = cv2.VideoCapture(config.CAMERA_INDEX)

        if not cam.isOpened():
            logger.error(f"Cannot open camera at index {config.CAMERA_INDEX}")
            return False

        # Let the camera auto-expose / auto-focus
        logger.debug(f"Camera warming up for {config.CAMERA_WARMUP_SEC}s...")
        time.sleep(config.CAMERA_WARMUP_SEC)

        # Discard a few frames to get a fresh one (buffers can be stale)
        for _ in range(5):
            cam.read()

        ret, frame = cam.read()

        if not ret or frame is None:
            logger.error("Failed to read frame from camera")
            return False

        # Encode and save as JPEG
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, config.JPEG_QUALITY]
        success = cv2.imwrite(save_path, frame, encode_params)

        if success:
            logger.info(f"Photo saved: {save_path}")
        else:
            logger.error(f"cv2.imwrite failed for: {save_path}")

        return success

    except Exception as e:
        logger.error(f"Camera capture error: {e}", exc_info=True)
        return False

    finally:
        if cam is not None:
            cam.release()
