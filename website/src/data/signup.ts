// Where waitlist and newsletter emails go: a Google Sheet, through a tiny Google Apps Script web app.
// Setup steps are in google-sheet/README.md. Paste the web app URL (it ends in /exec) below.
export const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw5dcrIdUmwBjB0N-QvmkRmsQjuXl_dRA11OhbdrspCG7ynDakRdYZaT6JpVUy9otEJ/exec';

/**
 * Send one email to the sheet. `list` says which form it came from ('waitlist', 'newsletter', 'shop', …).
 * Google doesn't let the page read its reply (no-cors), so a network failure is the only thing we can catch.
 */
export async function saveEmail(email: string, list: string): Promise<boolean> {
  if (!SHEET_URL) { console.warn('[ọjịugo] SHEET_URL is empty — email not saved:', list); return true; }
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({ email: email.trim(), list, page: location.pathname }),
    });
    return true;
  } catch {
    return false;
  }
}
