// scripts/content.js
// Main entry point - handles messages from popup and coordinates solving

// Listens for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "solve_strands") {
        console.log("Received solve request from popup.");

        startSolver().then(async (result) => {
            console.log("Initial solver finished. Found:", result.length, "words.");
            await inputWordsToPage(result);

            // Re-scan grid to see remaining uncolored cells
            console.log("Checking for Spangram...");
            await sleep(1); // Wait for UI update
            const updatedGrid = getGrid();

            // Check if there are any uncolored cells left (not '#')
            const hasUncolored = updatedGrid.some(row => row.some(cell => cell && cell.char !== "#"));

            if (hasUncolored) {
                console.log("Uncolored cells found. Attempting to find Spangram...");
                const spangram = findSpangram(updatedGrid);
                if (spangram && spangram.length > 0) {
                    console.log("Spangram found:", spangram[0].word);
                    await inputWordsToPage(spangram);
                    result.push(spangram[0]); // Add to results
                } else {
                    console.log("No Spangram found.");
                }
            } else {
                console.log("Grid is complete. No Spangram search needed.");
            }

            sendResponse({ status: "success", data: result });
        });

        return true; // Async response
    }
});

/**
 * Main solver function
 */
async function startSolver() {
    console.log("Starting solver...");

    // Load Trie dictionary
    const trie = await loadTrieDictionary();
    if (!trie) {
        console.error("Failed to load dictionary");
        return [];
    }

    // Extract grid from page (from wordSearch.js)
    const grid = getGrid();

    // Find all valid words (from wordSearch.js)
    const results = findAllWords(grid, trie);

    return results;
}

/**
 * Submit found words to the page
 */
async function inputWordsToPage(results) {
    console.log("Inputting words to page...");

    for (const { word, path } of results) {

        // Check if word is already found (any button is colored)
        const isBlocked = path.some(cell => {
            const btn = document.getElementById(cell.element.id);
            const bgStyle = btn.style.backgroundColor;
            return bgStyle && (bgStyle.includes("--strands-blue") || bgStyle.includes("--text-spangram"));
        });

        if (isBlocked) {
            console.log(`Skipping blocked word: ${word}`);
            continue;
        }

        console.log(`Submitting: ${word}`);

        for (let i = 0; i < path.length; i++) {
            const cell = path[i];
            const button = document.getElementById(cell.element.id);

            if (button) {
                button.click();
                await sleep(1);

                // Double-click last letter to submit
                if (i === path.length - 1) {
                    button.click();
                    await sleep(1);
                }
            }
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
