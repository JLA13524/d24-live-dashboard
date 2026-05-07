/*
 * Front‑end logic for the D24 live timing dashboard.
 *
 * This script periodically fetches the latest live timing data from the
 * backend API and displays the raw text. You can extend this script to
 * present structured data, charts, and alerts based on your parsing logic.
 */

async function refresh() {
  try {
    const response = await fetch("/api/live");
    const data = await response.json();

    document.getElementById("status").textContent =
      "Last update: " + new Date(data.timestamp).toLocaleString();

    document.getElementById("output").textContent = data.raw_text;
  } catch (error) {
    document.getElementById("status").textContent =
      "Error fetching data: " + error.message;
  }
}

// Refresh every 10 seconds
refresh();
setInterval(refresh, 10000);