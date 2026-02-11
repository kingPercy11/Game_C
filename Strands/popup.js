document.addEventListener('DOMContentLoaded', function () {
  const solveBtn = document.getElementById('solveBtn');
  const statusText = document.getElementById('status');
  const statusBox = document.getElementById('status-container');
  const timerDisplay = document.getElementById('timer');
  let startTime;
  let timerInterval;

  function updateTimer() {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.innerText = `${elapsed}s`;
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  solveBtn.addEventListener('click', async () => {
    // UI Feedback
    solveBtn.disabled = true;
    solveBtn.innerHTML = '<span class="btn-text">Solving...</span>';

    // Set loading state
    statusBox.className = "status-box loading";
    statusText.innerText = "Scanning grid...";

    // Start Timer
    startTime = Date.now();
    timerDisplay.innerText = "0.00s";
    timerInterval = setInterval(updateTimer, 1);

    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we are on the correct URL
    if (!tab.url.includes("nytimes.com/games/strands")) {
      stopTimer();
      statusBox.className = "status-box error";
      statusText.innerText = "Error: Please open NYT Strands.";
      resetButton();
      return;
    }

    statusText.innerText = "Searching for words...";

    // Send a message to the content script running on the page
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: "solve_strands" });

      if (response && response.status === "success") {
        stopTimer();
        updateTimer(); // Final update
        statusBox.className = "status-box success";
        statusText.innerText = "Solved!";
      } else {
        throw new Error("Script not ready");
      }
    } catch (error) {
      console.error(error);
      stopTimer();
      statusBox.className = "status-box error";
      statusText.innerText = "Error: Refresh the game page.";
    }

    // Reset button after a short delay
    setTimeout(() => {
      resetButton();
    }, 2000);
  });

  function resetButton() {
    solveBtn.disabled = false;
    solveBtn.innerHTML = `
      <span class="btn-text">Start Solving</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    `;
    // Only reset status box if it was error/loading? Or keep success visible?
    // Let's keep it visible until next click or manual clear.
  }
});
