# Health Logger

A small static health and food logger. The app runs in the browser and writes data to two tabs in a Google Sheet using Google's browser OAuth flow.

## 1. Create the Google Sheet

Create a Google Sheet with two tabs named exactly:

- `Symptoms`
- `Food`

Put these headers in row 1 of `Symptoms`:

```text
timestamp | symptom | details | severity | note
```

Put these headers in row 1 of `Food`:

```text
timestamp | wheat_grains | onion_garlic | legumes | high_fodmap_fruit | high_fodmap_vegetables | high_fodmap_sweeteners | dairy | high_fat | spicy | caffeine | alcohol | carbonated | fermented_aged | cured_processed | leftovers | note
```

## 2. Create Google OAuth credentials

In Google Cloud:

1. Create or select a project.
2. Enable the Google Sheets API.
3. Configure the Google Auth Platform / OAuth consent screen.
4. Create an OAuth client with application type **Web application**.
5. Add your local development origin, for example:
   `http://localhost:8000`
6. Add your GitHub Pages origin once you know it, for example:
   `https://YOUR-USERNAME.github.io`
7. Copy the OAuth client ID.

For this personal app, the Google Sheet itself remains protected by your Google account. The client ID is not a password or secret; Google expects browser applications to use it.

## 3. Configure the app

Open `app.js` and replace:

```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com";
const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";
```

with your OAuth client ID and the ID of your Google Sheet.

The spreadsheet ID is the long string in the Google Sheets URL between `/d/` and `/edit`.

## 4. Run locally

From this directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Go to **Settings → Connect Google Sheets** and authorize the app.

## Data behavior

Every symptom and food event gets an ISO timestamp when it is saved.

Successfully synced entries live in Google Sheets. If an entry cannot be synced immediately, the app keeps that unsynced entry in a small local queue and tries again when the connection is available.

The local queue is not the permanent data store. Google Sheets is the source of truth after an entry has synced.

## Food categories

The food tracker records concrete exposures rather than asking for a general "high FODMAP" or "other" category. The categories can be mapped to whatever FODMAP or other food-exposure taxonomy you want during later analysis.
