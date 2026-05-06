# D24 Live Timing Dashboard

This project provides a basic web application that proxies live timing
information from a **Speedhive** session into a simple JSON API and serves
a lightweight front‑end dashboard.

## Overview

- **Backend:** A [FastAPI](https://fastapi.tiangolo.com/) server written in Python.
  It scrapes the Speedhive live timing page using Playwright and exposes
  API endpoints for raw and parsed data.
- **Frontend:** A minimal HTML/JavaScript page that polls the backend and
  displays the raw timing data. You can extend this to present more
  sophisticated visualisations and alerts.
- **Deployment:** Example configuration for [Render](https://render.com) is
  provided in `render.yaml`, but you can deploy to any environment that
  supports Python and headless Chromium (e.g. Railway, Heroku with a
  buildpack for Playwright).

## Files

- `main.py`: The FastAPI application.
- `requirements.txt`: Python dependencies.
- `static/index.html`: Dashboard HTML page.
- `static/app.js`: Front‑end JavaScript that polls the backend.
- `static/styles.css`: Basic styling.
- `render.yaml`: Sample Render configuration for deployment.

## Running locally

1. Install Python 3.8+.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```
3. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```
4. Visit `http://localhost:8000/` in your browser.

The default configuration scrapes a specific Speedhive session. To scrape a
different session, change the `SPEEDHIVE_URL` constant in `main.py` to the
URL of your target session.

## Deploying to Render

1. Push this directory to a Git repository (e.g. on GitHub).
2. Create a new **Web Service** on Render and connect your repo.
3. Render will detect the `render.yaml` file and automatically configure
   the build and start commands. During the build step, it will install
   dependencies and Playwright.
4. Once deployed, your dashboard will be available at a public URL. You
   can open this URL from your iPad’s browser to monitor the live race.

## Customising the dashboard

The current implementation simply displays the raw text of the live timing
page. To turn this into a more useful race‑engineering tool, you can:

1. **Parse the raw timing data** in `parse_raw_text` and extract structured
   fields such as position, team name, laps, last lap, best lap, and gaps.
2. **Extend the API** with additional endpoints (e.g. `/api/leaderboard`,
   `/api/team/{name}`, `/api/projected`) that serve processed data.
3. **Build custom front‑end components** in `static/app.js` to display
   leaderboards, graphs, pit detection, projected finish, and alerts.

Because this project is built with modern, async‑capable Python and a static
front‑end, you can iterate quickly and deploy updates seamlessly without
taking down your service.