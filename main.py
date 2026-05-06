"""
FastAPI backend for the D24 live timing dashboard.

This app proxies live timing information from the provided Speedhive session URL
into a lightweight JSON API. It also serves a simple front‑end dashboard from the
`static` directory.

The backend scrapes the live timing page using Playwright. It launches
a headless Chromium instance on demand to load the page and extract raw text.

If you want to parse the text into structured data, implement a parser
in the `parse_raw_text` function. The initial implementation simply returns
the raw page text along with a timestamp.

To run the development server locally:

    pip install -r requirements.txt
    playwright install chromium
    uvicorn main:app --reload

When deployed to a hosting platform such as Render, the container will install
Chromium during the build step and launch the server automatically using
the command defined in ``render.yaml``.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Import Playwright lazily to avoid overhead when not scraping
from playwright.async_api import async_playwright

# URL of the live Speedhive session to scrape.
# Replace this with the session you want to monitor.
SPEEDHIVE_URL: str = (
    "https://speedhive.mylaps.com/livetiming/8F45142664A39BAD-2147483702/sessions/"
    "8F45142664A39BAD-2147483702-1073742018"
)


app = FastAPI()

# Enable CORS so the front‑end can access the API from any origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory to serve index.html, JS and CSS files.
app.mount("/static", StaticFiles(directory="static"), name="static")


async def scrape_speedhive() -> Dict[str, Any]:
    """Scrape the live timing page using Playwright and return raw text.

    Launches a headless Chromium instance, navigates to the session URL,
    waits for the network to be idle, then extracts the full text of the
    page. If scraping fails, an HTTPException is raised.

    Returns:
        dict containing ``timestamp`` (ISO8601) and ``raw_text``
    """
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page()
            # Navigate to the live timing page
            await page.goto(SPEEDHIVE_URL, wait_until="networkidle", timeout=60000)
            # Extract all inner text from the body element
            raw_text: str = await page.locator("body").inner_text()
            await browser.close()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "raw_text": raw_text,
    }


def parse_raw_text(raw_text: str) -> Dict[str, Any]:
    """Parse the raw text into structured race data.

    This function is currently a placeholder. Depending on the format of the
    Speedhive page, you can implement a parser that extracts the leaderboard
    table, lap times, gaps, etc., from the raw text or by using BeautifulSoup
    on the page's HTML instead of plain text.

    Args:
        raw_text: The raw text scraped from the page body.

    Returns:
        A dictionary representing structured race data.
    """
    # TODO: Implement proper parsing logic here.
    return {"raw_text": raw_text}


@app.get("/")
async def serve_index() -> FileResponse:
    """Serve the main dashboard page."""
    return FileResponse("static/index.html")


@app.get("/api/live")
async def api_live() -> Dict[str, Any]:
    """Return the latest live timing snapshot as raw text and timestamp."""
    data = await scrape_speedhive()
    return data


@app.get("/api/data")
async def api_data() -> Dict[str, Any]:
    """Return structured race data extracted from the live timing page."""
    data = await scrape_speedhive()
    return {
        "timestamp": data["timestamp"],
        "data": parse_raw_text(data["raw_text"]),
    }