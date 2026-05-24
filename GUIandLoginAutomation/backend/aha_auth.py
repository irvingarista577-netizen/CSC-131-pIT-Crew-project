from pathlib import Path
import re
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

#saves AHA login session so we do not have to log in again every time
SESSION_FILE = Path("app/sessions/aha_session.json")
AHA_HOME_URL = "https://atlas.heart.org/" #link to main AHA website
AHA_DASHBOARD_URL = "https://atlas.heart.org/dashboard"

#logs into AHA website and saves the session if it works
def login_to_aha_sync(username: str, password: str) -> dict:
    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=False,
            slow_mo=300
        )

        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto(AHA_HOME_URL, wait_until="domcontentloaded", timeout=60000)

            page.get_by_test_id("login-logout-button1").click(timeout=15000)

            page.get_by_role("textbox", name="Username / Email").click(timeout=15000)
            page.get_by_role("textbox", name="Username / Email").fill(username)

            page.get_by_role("textbox", name="Password").click(timeout=15000)
            page.get_by_role("textbox", name="Password").fill(password)

            try:
                page.get_by_text("Remember me").click(timeout=5000)
            except Exception:
                pass

            page.get_by_role("button", name="Sign In").click(timeout=15000)

            page.wait_for_timeout(8000)

            page.goto(AHA_DASHBOARD_URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(5000)

            current_url = page.url
            page_content = page.content()

            signed_in = (
                "dashboard" in current_url.lower()
                or "Classes" in page_content
                or "Training Site Classes" in page_content
            )

        #saves login session if the sign in worked
            if signed_in:
                context.storage_state(path=str(SESSION_FILE))

            browser.close()

            return {
                "signedIn": signed_in,
                "currentUrl": current_url,
                "message": "Signed in successfully and AHA session saved"
                if signed_in
                else "Login may have failed. Check app/sessions/aha_after_login.png"
            }

        except PlaywrightTimeoutError as e:
            browser.close()
            raise Exception(f"Playwright timeout during AHA login: {repr(e)}")

        except Exception as e:
            browser.close()
            raise Exception(f"AHA login failed: {repr(e)}")


def check_aha_session_sync() -> dict:
    if not SESSION_FILE.exists():
        return {
            "signedIn": False,
            "message": "No saved AHA session found"
        }

    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=False,
            slow_mo=200
        )

        context = browser.new_context(storage_state=str(SESSION_FILE))
        page = context.new_page()

        try:
            page.goto(AHA_DASHBOARD_URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(5000)

            current_url = page.url
            page_content = page.content()

            signed_in = (
                "dashboard" in current_url.lower()
                or "Classes" in page_content
                or "Training Site Classes" in page_content
            )

            browser.close()

            return {
                "signedIn": signed_in,
                "currentUrl": current_url,
                "message": "AHA session is active" if signed_in else "AHA session expired"
            }

        except Exception as e:
            browser.close()

            return {
                "signedIn": False,
                "message": f"Could not check AHA session: {repr(e)}"
            }


def open_training_site_classes_sync() -> dict:
    if not SESSION_FILE.exists():
        return {
            "success": False,
            "message": "No saved AHA session found. Please sign in first."
        }

    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=False,
            slow_mo=300
        )

        context = browser.new_context(storage_state=str(SESSION_FILE))
        page = context.new_page()

        try:
            page.goto(AHA_DASHBOARD_URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(5000)

            page.locator("[data-test=\"header-ele\"] div").filter(
                has_text=re.compile(r"^Classes$")
            ).click(timeout=15000)

            page.get_by_role("button", name="Training Site Classes").click(timeout=15000)

            page.wait_for_timeout(5000)

            current_url = page.url

            browser.close()

            return {
                "success": True,
                "currentUrl": current_url,
                "message": "Opened Training Site Classes successfully"
            }

        except Exception as e:
            browser.close()
            raise Exception(f"Could not open Training Site Classes: {repr(e)}")

#deletes saved session file to sign out
def sign_out_aha_sync() -> dict:
    if SESSION_FILE.exists():
        SESSION_FILE.unlink()

    return {
        "signedIn": False,
        "message": "Saved AHA session cleared"
    }