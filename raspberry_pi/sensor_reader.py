"""
sensor_reader.py — Reads JSON sensor data from Arduino via USB-TTL serial.

Runs as a daemon thread. Continuously reads lines from the serial port,
parses JSON, and pushes valid readings into a thread-safe queue for the
capture manager to consume.

Expected Arduino JSON format (one line per reading):
    {"IR1":0,"IR2":1,"RCWL1":0,"RCWL2":1,"lat":20.2961,"lng":85.8245}
"""

import json
import logging
import time
import serial

import config

logger = logging.getLogger(__name__)


def open_serial():
    """Open and return the serial connection, retrying on failure."""
    while True:
        try:
            ser = serial.Serial(
                port=config.SERIAL_PORT,
                baudrate=config.BAUD_RATE,
                timeout=config.SERIAL_TIMEOUT,
            )
            ser.reset_input_buffer()
            logger.info(f"Serial connected on {config.SERIAL_PORT} @ {config.BAUD_RATE} baud")
            return ser
        except serial.SerialException as e:
            logger.warning(f"Serial open failed ({e}). Retrying in 5s...")
            time.sleep(5)


def sensor_loop(sensor_queue):
    """
    Main loop — reads serial lines, parses JSON, pushes to queue.

    This function is designed to be run as a daemon thread target.
    It will auto-reconnect if the serial port drops.

    Args:
        sensor_queue: queue.Queue to push parsed sensor dicts into.
    """
    ser = open_serial()

    while True:
        try:
            raw = ser.readline()
            if not raw:
                continue  # timeout, no data

            line = raw.decode("utf-8", errors="replace").strip()
            if not line:
                continue

            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                logger.debug(f"Malformed JSON skipped: {line[:100]}")
                continue

            # Validate required keys exist
            required_keys = {"IR1", "IR2", "RCWL1", "RCWL2", "lat", "lng"}
            if not required_keys.issubset(data.keys()):
                logger.debug(f"Missing keys in reading: {data}")
                continue

            sensor_queue.put(data)
            logger.debug(f"Sensor reading queued: {data}")

        except serial.SerialException as e:
            logger.error(f"Serial error: {e}. Reconnecting...")
            try:
                ser.close()
            except Exception:
                pass
            time.sleep(2)
            ser = open_serial()

        except Exception as e:
            logger.error(f"Unexpected error in sensor loop: {e}", exc_info=True)
            time.sleep(1)
