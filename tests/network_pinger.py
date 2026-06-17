import requests

def check_internet():
    try:
        # Try to connect to a reliable website
        requests.get("http://www.google.com", timeout=3)
        return True
    except requests.ConnectionError:
        return False

# Usage
if check_internet():
    print("Internet is connected")
else:
    print("Internet is not connected")
