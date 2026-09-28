# Switch on the class leaderboard (about 5 minutes, free)

The leaderboard stores nicknames and dedication points in a Google Sheet that **you** own. Nothing else is collected.

1. Go to **sheets.new** to create a new Google Sheet. Name it "Chiikawa Bio Leaderboard".
2. In the sheet, click **Extensions → Apps Script**.
3. Delete the sample code, then paste in everything from **`Code.gs`** in this folder. Click 💾 **Save**.
4. Click **Deploy → New deployment**, then the ⚙️ gear icon → **Web app**.
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
5. Click **Deploy**, allow the permissions, and **copy the Web app URL** (it ends in `/exec`).
6. Send that URL to Claude. It goes into `LEADERBOARD_URL` in `index.html`, and the board goes live.

**Moderation:** open the sheet any time to rename or delete a row (e.g. an unsuitable nickname).
