import time
import json
import pyautogui
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

USERNAME   = "Sounak"
PASSWORD   = "sounak@1435"
TOKEN_FILE = "token.json"

def fetch_token():
    print("Fetching token...")
    options = Options()
    options.add_argument("--window-size=1280,800")
    driver = webdriver.Chrome(options=options)

    try:
        driver.get("https://www.inaturalist.org/login")
        time.sleep(4)  # wait for React to render

        # Click the username field using JS
        driver.execute_script("""
            const inputs = document.querySelectorAll('input');
            for (let inp of inputs) {
                if (inp.type === 'text' || inp.type === 'email' || inp.autocomplete === 'username') {
                    inp.click();
                    inp.focus();
                    break;
                }
            }
        """)
        time.sleep(1)
        pyautogui.write(USERNAME, interval=0.05)
        pyautogui.press('tab')
        time.sleep(0.5)
        pyautogui.write(PASSWORD, interval=0.05)
        pyautogui.press('tab')
        time.sleep(0.5)
        pyautogui.press('enter')
        time.sleep(4)

        # Check if login succeeded
        if "/login" in driver.current_url:
            print("Login may have failed, waiting 10 more seconds...")
            time.sleep(10)

        driver.get("https://www.inaturalist.org/users/api_token")
        time.sleep(2)

        body = driver.find_element(By.TAG_NAME, "body").text
        token_data = json.loads(body)
        token = token_data["api_token"]

        with open(TOKEN_FILE, "w") as f:
            json.dump({"token": token, "fetched_at": time.time()}, f)

        print(f"Token saved: {token[:40]}...")
        return token

    finally:
        driver.quit()

def get_token():
    try:
        with open(TOKEN_FILE) as f:
            data = json.load(f)
        age_hours = (time.time() - data["fetched_at"]) / 3600
        if age_hours < 11.5:
            print(f"Using cached token (age: {age_hours:.1f} hrs)")
            return data["token"]
        else:
            print("Token expiring, refreshing...")
    except FileNotFoundError:
        print("No token file, fetching fresh...")
    return fetch_token()

if __name__ == "__main__":
    while True:
        token = get_token()
        if token:
            print(f"Active token: {token[:40]}...")
            print("Next refresh in 11.5 hours...")
            time.sleep(11.5 * 3600)
        else:
            print("Failed, retrying in 60 seconds...")
            time.sleep(60)