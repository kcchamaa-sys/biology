# Class sign-in setup (about 15 minutes, once)

Class sign-in needs three things: your **Google Sheet** (name list + records), a **Google Apps Script** (checks sign-ins, saves records) and a **Google OAuth Client ID** (shows the "Sign in with Google" button).

> 🔒 Student names and emails stay in **your private Google Sheet**. They are never put in the public website or this GitHub repo.
>
> 👤 **Guest mode needs none of this.** Students without a Google account tap **Play as guest**: progress stays on their own device, with no leaderboard and no class records.

---

## Step 1 · The Google Sheet
- Use the spreadsheet that already has your **`使用者 Users`** tab (the one the S1 Science game uses). Columns: Email · Role · Chinese Name · English Name · Class · Class No.
- **Add your S4–S6 biology students** to that tab (Role e.g. `學生 Student`, Class e.g. `5B`).
- Copy its **Sheet ID** from the address bar: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
- The game creates two new tabs by itself: **`Biology Records`** and **`Biology Progress`**. Your other tabs are not touched.

## Step 2 · The Google Client ID
- The game already uses the **same Client ID as the S1 Science game** (both live on `https://kcchamaa-sys.github.io`), so there is usually nothing to do here.
- Using a different one? In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) open the Web OAuth client, check that **Authorised JavaScript origins** has `https://kcchamaa-sys.github.io`, and copy the **Client ID**.

## Step 3 · The Apps Script (a new one, separate from the S1 game)
- Go to [script.google.com](https://script.google.com) → **New project** → name it `Mochi Bio Escape server`.
- Delete the sample code and paste everything from **`server/Code.gs`**.
- **Project Settings (⚙️) → Script properties → Add**:
  | Property | Value |
  |---|---|
  | `SHEET_ID` | the Sheet ID from Step 1 |
  | `CLIENT_ID` | the Client ID from Step 2 |
  | `USERS_SHEET` | *(optional)* only if your users tab has a different name |

## Step 4 · Deploy it
- **Deploy → New deployment → ⚙️ Web app**
  - Execute as: **Me**
  - Who has access: **Anyone**
- Click **Deploy**, allow the permissions and copy the **Web app URL** (ends with `/exec`).

## Step 5 · Connect the game
- Send the **/exec URL** to Claude, or edit `BIO_CONFIG` at the top of `src/auth.js` yourself and rebuild (`python3 tools/build.py`):
  ```js
  const BIO_CONFIG = { GOOGLE_CLIENT_ID: "…apps.googleusercontent.com", API_URL: "https://script.google.com/macros/s/…/exec" };
  ```
- Until `API_URL` is filled in, the game runs in **guest mode only** (the sign-in screen says so).

## Step 6 · Test
- Open the game → **Sign in with Google** with a student test account → finish one study series → check that a row appears in `Biology Records` and `Biology Progress`.

---

### What gets recorded
- **Biology Records**: one row per finished (or stopped) activity: escape stage, study series, Cell Rush round, dictation round, Mistake Notebook round. Columns include the topic, stage, questions answered, correct, accuracy, stars, time and the IDs of wrong questions.
- **Biology Progress**: one row per student (streak, stars, stages cleared, chestnuts, pets, mistakes, trophies, last study day, dedication points) plus the saved game, so students can continue on any device.
- **Class leaderboard** (signed-in students only): top 20 for 🌟 effort, 🔥 current streak and 🐾 collection, for "My class" or "Everyone".

### Good to know
- **Adding students later:** add rows to `使用者 Users`. Changes apply within 5 minutes.
- **"Access blocked" for students:** your school's Google Workspace may block new apps. Ask IT to mark the Client ID as **Trusted** in Admin console → Security → API controls.
- **Not on the list:** the game says so and offers guest mode.
- **Updating Code.gs:** Deploy → **Manage deployments** → ✏️ → Version: **New version**. The /exec URL stays the same.
- **The claude.ai preview copy** can't show Google sign-in, so it is always guest mode.
