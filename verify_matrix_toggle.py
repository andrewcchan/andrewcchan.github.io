from playwright.sync_api import sync_playwright, expect
import os
import re

def verify_themes(page):
    # Load the page
    # Using absolute path for local file
    page.goto(f"file://{os.getcwd()}/index.html")

    # 1. Verify "System Time" is present
    system_clock = page.locator("#system-clock")
    expect(system_clock).to_be_visible()
    print("System clock is visible.")

    # 2. Verify "Theme Switcher" buttons are GONE
    theme_switcher = page.locator(".theme-switcher")
    if theme_switcher.count() > 0:
        print("FAIL: Theme switcher is still visible.")
    else:
        print("PASS: Theme switcher is not found.")

    # 3. Initial State
    page.evaluate("localStorage.clear(); location.reload();")
    page.wait_for_timeout(500) # Wait for reload

    # Check body class
    body = page.locator("body")
    # Use regex to match the class string
    expect(body).to_have_class(re.compile(r"theme-amber"))
    print("Initial state is Amber.")

    # Take screenshot 1: Initial Amber
    page.screenshot(path="/home/jules/verification/matrix_toggle_1_amber.png")

    # 4. Trigger Konami Code
    konami_code = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ]
    for key in konami_code:
        page.keyboard.press(key)

    # 5. Wait for Animation and Change
    print("Triggered Konami Code (Amber -> Green).")
    page.wait_for_timeout(500) # Wait for canvas to appear
    canvas = page.locator("#matrix-canvas")
    expect(canvas).to_be_visible()

    # Wait for theme switch (2.5s)
    page.wait_for_timeout(2500)

    # Verify Theme is now Green
    expect(body).to_have_class(re.compile(r"theme-green"))
    print("Theme switched to Green.")

    # Take screenshot 2: Green Theme
    page.wait_for_timeout(2000) # Wait for full cleanup
    page.screenshot(path="/home/jules/verification/matrix_toggle_2_green.png")

    # 6. Trigger Konami Code AGAIN (Green -> Amber)
    print("Triggering Konami Code again (Green -> Amber).")
    for key in konami_code:
        page.keyboard.press(key)

    # 7. Verify Theme is back to Amber
    page.wait_for_timeout(2500)
    expect(body).to_have_class(re.compile(r"theme-amber"))
    print("Theme switched back to Amber.")

    page.screenshot(path="/home/jules/verification/matrix_toggle_3_amber_again.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_themes(page)
        except Exception as e:
            print(f"Error: {e}")
            # Take error screenshot
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
