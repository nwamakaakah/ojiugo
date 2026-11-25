# Waitlist & newsletter emails → Google Sheet

1. Create a Google Sheet (e.g. "ọjịugo sign-ups").
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste everything from `Code.gs`, click **Save**.
3. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**, then **Authorize access** and allow it (Google warns because it's your own unverified script — choose *Advanced → Go to … (unsafe)*; it only writes to this sheet).
4. Copy the **Web app URL** (ends in `/exec`) and paste it into `website/src/data/signup.ts` as `SHEET_URL`.

Every sign-up adds a row to the `signups` tab: when · email · list (waitlist / newsletter / blog / shop / leaderboard) · page.
The same email on the same list is only saved once.
If you change `Code.gs` later: **Deploy → Manage deployments → edit → Version: New version** (the URL stays the same).
