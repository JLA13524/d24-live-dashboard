/*
 * Front‑end logic for the D24 strategy dashboard.
 *
 * This script no longer fetches live timing data from a backend. Instead,
 * it provides a simple interface for entering race‑critical metrics by hand.
 * These metrics are then displayed on the page for quick reference. This
 * approach avoids the need for scraping Speedhive live timing when a
 * headless browser is unavailable, while still giving race engineers a
 * dedicated dashboard for strategy and monitoring.
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Reads values from the manual input fields and updates the displayed
   * metrics. Any empty field is shown as "N/A". The status element is
   * updated with the current time to indicate when the last update
   * occurred. This function is called whenever the "Update" button
   * is pressed.
   */
  function updateMetrics() {
    const lap = document.getElementById("lap-input").value;
    const pos = document.getElementById("position-input").value;
    const gap = document.getElementById("gap-input").value;
    const stint = document.getElementById("stint-input").value;
    const driver = document.getElementById("driver-input").value;
    const lastLap = document.getElementById("lastlap-input").value;

    const displayLapEl = document.getElementById("display-lap");
    if (displayLapEl) {
      displayLapEl.textContent = `Lap: ${lap || "N/A"}`;
    }
    const displayPosEl = document.getElementById("display-position");
    if (displayPosEl) {
      displayPosEl.textContent = `Position: ${pos || "N/A"}`;
    }
    const displayGapEl = document.getElementById("display-gap");
    if (displayGapEl) {
      displayGapEl.textContent = `Gap to P1: ${gap || "N/A"}`;
    }
    const displayStintEl = document.getElementById("display-stint");
    if (displayStintEl) {
      displayStintEl.textContent = `Stint #: ${stint || "N/A"}`;
    }
    const displayDriverEl = document.getElementById("display-driver");
    if (displayDriverEl) {
      displayDriverEl.textContent = `Driver: ${driver || "N/A"}`;
    }
    const displayLastLapEl = document.getElementById("display-lastlap");
    if (displayLastLapEl) {
      displayLastLapEl.textContent = `Last Lap: ${lastLap || "N/A"}`;
    }

    // Update status with timestamp for traceability
    const now = new Date();
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = `Last updated: ${now.toLocaleString()}`;
    }
  }

  // Attach event listener to the update button
  const updateBtn = document.getElementById("update-btn");
  if (updateBtn) {
    updateBtn.addEventListener("click", updateMetrics);
  }
});