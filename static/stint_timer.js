/*
 * Stint Timer Tool
 *
 * This script provides a simple timing interface for endurance kart racing.
 * Users can configure a list of drivers, specify single and double stint
 * durations, and start a timer that tracks how long the current driver has
 * been in the kart. It displays time remaining and when the pit window
 * opens based on a configurable offset. The next and reserve drivers
 * are determined from the driver list. When the stint ends, the tool
 * automatically cycles to the next driver.
 */

document.addEventListener("DOMContentLoaded", () => {
  let driverList = [];
  let currentIndex = 0;
  let timerInterval = null;
  let stintStartTime = null;
  let stintDurationMs = 0;
  let pitOffsetMs = 0;

  const driversInput = document.getElementById("drivers-input");
  const singleDurationInput = document.getElementById("single-duration-input");
  const doubleDurationInput = document.getElementById("double-duration-input");
  const pitOffsetInput = document.getElementById("pit-offset-input");

  const currentDriverEl = document.getElementById("current-driver");
  const nextDriverEl = document.getElementById("next-driver");
  const reserveDriverEl = document.getElementById("reserve-driver");

  const startBtn = document.getElementById("start-btn");
  const endBtn = document.getElementById("end-btn");

  const timeInEl = document.getElementById("time-in");
  const timeLeftEl = document.getElementById("time-left");
  const pitWindowEl = document.getElementById("pit-window");
  const statusEl = document.getElementById("status");

  /**
   * Helper to format milliseconds as HH:MM:SS.
   */
  function formatTime(ms) {
    if (ms < 0) {
      ms = 0;
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  /**
   * Updates the driver display elements based on the current index.
   */
  function updateDriverDisplay() {
    if (driverList.length === 0) {
      currentDriverEl.textContent = "N/A";
      nextDriverEl.textContent = "N/A";
      reserveDriverEl.textContent = "N/A";
      return;
    }
    const current = driverList[currentIndex % driverList.length];
    const next = driverList[(currentIndex + 1) % driverList.length];
    const reserve = driverList[(currentIndex + 2) % driverList.length];
    currentDriverEl.textContent = current || "N/A";
    nextDriverEl.textContent = next || "N/A";
    reserveDriverEl.textContent = reserve || "N/A";
  }

  /**
   * Starts the timer for the selected stint type.
   */
  function startStint() {
    if (driverList.length === 0) {
      alert("Please load at least one driver before starting a stint.");
      return;
    }
    // Determine selected stint type
    const stintType = document.querySelector('input[name="stint-type"]:checked')
      .value;
    const singleMin = parseFloat(singleDurationInput.value) || 0;
    const doubleMin = parseFloat(doubleDurationInput.value) || 0;
    const offsetMin = parseFloat(pitOffsetInput.value) || 0;
    if (stintType === "single") {
      stintDurationMs = singleMin * 60 * 1000;
    } else {
      stintDurationMs = doubleMin * 60 * 1000;
    }
    pitOffsetMs = offsetMin * 60 * 1000;
    stintStartTime = Date.now();
    // Disable start button, enable end button
    startBtn.disabled = true;
    endBtn.disabled = false;

    // Show timer display
    document.getElementById("timer-display").style.display = "block";

    // Update driver display (in case load happened earlier)
    updateDriverDisplay();

    // Start interval to update display every second
    timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - stintStartTime;
      const remaining = stintDurationMs - elapsed;
      const pitRemaining = remaining - pitOffsetMs;
      timeInEl.textContent = formatTime(elapsed);
      timeLeftEl.textContent = formatTime(remaining);
      if (pitRemaining > 0) {
        pitWindowEl.textContent = formatTime(pitRemaining);
      } else {
        pitWindowEl.textContent = "OPEN";
      }
      // Update status with current time
      if (statusEl) {
        statusEl.textContent =
          "Stint in progress: last updated " + new Date().toLocaleString();
      }
      // Auto-end if time remaining is zero or less
      if (remaining <= 0) {
        endStint();
      }
    }, 1000);
  }

  /**
   * Ends the current stint and cycles to the next driver.
   */
  function endStint() {
    clearInterval(timerInterval);
    timerInterval = null;
    stintStartTime = null;
    // Hide timer display
    document.getElementById("timer-display").style.display = "none";
    // Enable start button, disable end button
    startBtn.disabled = false;
    endBtn.disabled = true;
    // Move to next driver
    currentIndex = (currentIndex + 1) % driverList.length;
    updateDriverDisplay();
    // Update status
    if (statusEl) {
      statusEl.textContent =
        "Stint ended. Ready for next driver at " +
        new Date().toLocaleString();
    }
  }

  /**
   * Loads drivers from input and initializes driver rotation.
   */
  function loadDrivers() {
    const input = driversInput.value.trim();
    if (!input) {
      alert("Please enter at least one driver name.");
      return;
    }
    driverList = input
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    if (driverList.length === 0) {
      alert("Please enter at least one driver name.");
      return;
    }
    currentIndex = 0;
    updateDriverDisplay();
    // Show stint setup section
    document.getElementById("stint-setup").style.display = "block";
    if (statusEl) {
      statusEl.textContent = "Drivers loaded. Select stint type and press Start.";
    }
  }

  // Attach event listeners
  document
    .getElementById("load-drivers-btn")
    .addEventListener("click", loadDrivers);
  startBtn.addEventListener("click", startStint);
  endBtn.addEventListener("click", endStint);
});