# Symptom Logger

A deliberately small, local-first symptom event logger.

## What it does

1. Choose a symptom.
2. If that symptom has details, choose one or more details or skip.
3. Choose severity from 1–4.
4. Optionally add a note.
5. Save.

Each entry gets an automatic timestamp.

Data is stored in the browser's `localStorage` on the device. There is no account, server, database, or external API.

Use **Settings → Export CSV** to export the data.

## Editing symptoms

The symptom and detail choices live at the top of `app.js` in the `symptoms` object.

For example:

```js
pain: {
  label: "Pain",
  details: [
    "Back",
    "Hips",
    "Legs"
  ]
}
```

Add or remove strings from `details` to change the buttons.

## Running locally

Because this is a PWA, it should be served over HTTP/HTTPS rather than opened directly as a `file://` URL.

For example, from this directory:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

For phone installation, the site needs to be hosted over HTTPS. A private GitHub repository does not automatically provide a publicly accessible GitHub Pages site; if the repository remains private, use another private hosting option or run it locally on your own network.

## Deliberate non-features

This project does not currently include:

- symptom scoring
- dashboards
- reminders
- notifications
- wearable integrations
- cloud syncing
- accounts
- AI
- automatic interpretation
