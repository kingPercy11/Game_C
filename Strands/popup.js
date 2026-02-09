document.addEventListener('DOMContentLoaded', function () {
  const solveBtn = document.getElementById('solveBtn');
  const statusDiv = document.getElementById('status');

  solveBtn.addEventListener('click', async () => {
    // UI Feedback
    solveBtn.disabled = true;
    solveBtn.innerText = "Solving...";
    statusDiv.className = "loading";
    statusDiv.innerText = "Scanning grid...";

    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we are on the correct URL
    if (!tab.url.includes("nytimes.com/games/strands")) {
      statusDiv.className = "error";
      statusDiv.innerText = "Error: Please open NYT Strands.";
      solveBtn.disabled = false;
      solveBtn.innerText = "Start solving";
      return;
    }
    statusDiv.innerText = "Searching for words...";
    // Send a message to the content script running on the page
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: "solve_strands" });

      if (response && response.status === "success") {
        statusDiv.className = "success";
        statusDiv.innerText = "Solved";
      } else {
        throw new Error("Script not ready");
      }
    } catch (error) {
      console.error(error);
      statusDiv.className = "error";
      statusDiv.innerText = "Error: Refresh the game page.";
    }

    // Reset button after a short delay
    setTimeout(() => {
      solveBtn.disabled = false;
      solveBtn.innerText = "Start solving";
    }, 2000);
  });
});
