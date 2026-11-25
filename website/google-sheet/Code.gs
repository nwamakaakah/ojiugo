/**
 * ọjịugo — waitlist & newsletter sign-ups into this Google Sheet.
 * Paste into Extensions → Apps Script (replacing what's there), then Deploy → New deployment → Web app.
 * Columns: when · email · list (waitlist / newsletter / shop / …) · page it came from.
 */
const SHEET_NAME = 'signups';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);                       // two people joining at the same moment both get saved
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(['when', 'email', 'list', 'page']);

    const p = (e && e.parameter) || {};
    const email = String(p.email || '').trim().toLowerCase().slice(0, 254);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply({ ok: false, reason: 'bad email' });
    const list = clean(p.list || 'waitlist').slice(0, 40);
    const page = clean(p.page || '').slice(0, 200);

    // same email on the same list only once
    const n = sh.getLastRow() - 1;
    if (n > 0) {
      const rows = sh.getRange(2, 2, n, 2).getValues();
      if (rows.some(function (r) { return String(r[0]).replace(/^'/, '') === email && r[1] === list; })) return reply({ ok: true, already: true });
    }
    sh.appendRow([new Date(), clean(email), list, page]);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// stop anything that looks like a spreadsheet formula from running
function clean(s) { s = String(s); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function reply(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
