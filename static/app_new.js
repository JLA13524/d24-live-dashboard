/*
 * Front‑end logic for the D24 live timing dashboard.
 *
 * This script periodically fetches the latest live timing data from the
 * backend API and displays the raw text. It has been updated to more
 * robustly handle invalid timestamps and API errors.
 *
 * When the API returns a valid ISO8601 timestamp in the ``timestamp`` field,
 * the script formats it for display using the browser's locale. If the
 * timestamp is missing or invalid, it falls back to showing the raw value
 * or ``N/A`` instead of "Invalid Date". If the API returns an ``error``
 * field, the error message is shown in place of the raw text. If both
 * ``raw_text`` and ``error`` are absent, the output is cleared.
 */

async function refresh() {
  try {
    const response = await fetch("/api/live");
    const data = await response.json();

    const statusEl = document.getElementById("status");
    const outputEl = document.getElementById("output");

    // Determine how to display the timestamp: parse it if valid, otherwise fall back
    let timestampDisplay;
    if (data.timestamp && !isNaN(Date.parse(data.timestamp))) {
      timestampDisplay = new Date(data.timestamp).toLocaleString();
    } else {
      timestampDisplay = data.timestamp ? String(data.timestamp) : "N/A";
    }
    statusEl.textContent = "Last update: " + timestampDisplay;

    // Show raw text if present; otherwise display any error message returned by the API
    if (data.raw_text && data.raw_text.length > 0) {
      outputEl.textContent = data.raw_text;
    } else if (data.error) {
      outputEl.textContent = "Error: " + data.error;
    } else {
      outputEl.textContent = "";
    }
  } catch (error) {
    // Network or parsing error: show a generic error message
    document.getElementById("status").textContent =
      "Error fetching data: " + error.message;
  }
}

// Refresh every 10 seconds
refresh();
setInterval(refresh, 10000);