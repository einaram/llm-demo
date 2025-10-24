Halden Weather Demo

A tiny static page that fetches weather for Halden using the MET Norway Locationforecast API.

Notes
- The MET API requires requests to include a valid User-Agent header that identifies your application and provides contact information. Replace the placeholder in `app.js` with your app name and email before deploying.

Browser note (static-only)

This project is intentionally static and uses vanilla JavaScript in the browser. The MET API's policy requests that clients include a valid User-Agent identifying the application and contact info. Browsers disallow setting the `User-Agent` header from client-side JS. In many cases the MET API will still respond to browser requests without a custom UA, but if it rejects requests (403/401) you'll see a helpful message in the page explaining the issue.

How to run locally

How to run locally

Use a static server (recommended) to avoid CORS issues. Examples:

Python 3:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Files
- `index.html` — The page
- `style.css` — Styles
- `app.js` — Fetch + render logic

License: MIT
# llm-demo
