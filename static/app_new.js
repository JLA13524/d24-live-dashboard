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

/*
 * Dashboard front‑end with session selection support.
 *
 * The user can specify a Speedhive live timing session URL in the input
 * provided on the page. When a session is loaded, the dashboard appends
 * the session as a query parameter to the API requests. This allows a
 * single backend endpoint to handle multiple live events.
 */

// Currently selected session URL. If null, the default session configured on
// the server is used.
let sessionUrl = null;

/**
 * Fetches live timing data from the backend and updates the page.
 */
async function refresh() {
  try {
    // Construct API URL: include session parameter if one has been set
    const apiUrl = sessionUrl
      ? `/api/live?session=${encodeURIComponent(sessionUrl)}`
      : "/api/live";

    const response = await fetch(apiUrl);
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

    // Update status: include session info if available
    if (sessionUrl) {
      statusEl.textContent = `Session: ${sessionUrl} | Last update: ${timestampDisplay}`;
    } else {
      statusEl.textContent = `Last update: ${timestampDisplay}`;
    }

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

/**
 * Reads the session URL from the input field and triggers a refresh.
 */
function loadSession() {
  const inputEl = document.getElementById("session-input");
  const value = inputEl.value.trim();
  // Update global sessionUrl: empty string resets to null (default session)
  sessionUrl = value.length > 0 ? value : null;
  // Immediately fetch data for the selected session
  refresh();
}

// Set up event listeners on page load and kick off periodic refreshes
document.addEventListener("DOMContentLoaded", () => {
  const buttonEl = document.getElementById("session-btn");
  if (buttonEl) {
    buttonEl.addEventListener("click", loadSession);
  }
  // Trigger initial refresh once page has loaded; this uses the default session
  refresh();
  // Poll for updates every 10 seconds
  setInterval(refresh, 10000);
});