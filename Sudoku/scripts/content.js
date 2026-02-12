// scripts/content.js
// Handles DOM interaction and coordination with solver

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "solve_sudoku") {
        solveGame().then((result) => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    }
});

async function solveGame() {
    // 1. Extract Grid
    const grid = getGrid();
    if (!grid) {
        return { status: "error", message: "Could not find Sudoku grid." };
    }

    // 2. Solve
    const solvedGrid = window.solveSudoku(grid);
    if (!solvedGrid) {
        return { status: "error", message: "No solution found." };
    }

    // 3. Input Solution
    await inputGrid(solvedGrid);

    return { status: "success" };
}

function getGrid() {
    const cells = document.querySelectorAll('.su-cell');
    if (cells.length !== 81) return null;

    const grid = [];
    for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j;
            const cell = cells[index];
            const ariaLabel = cell.getAttribute('aria-label');

            let val = 0;
            if (ariaLabel && ariaLabel !== "empty") {
                val = parseInt(ariaLabel, 10);
            }
            row.push(isNaN(val) ? 0 : val);
        }
        grid.push(row);
    }
    return grid;
}

async function inputGrid(solvedGrid) {
    const cells = document.querySelectorAll('.su-cell');

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j;
            const cell = cells[index];
            if (cell.classList.contains('prefilled')) continue;
            const currentAria = cell.getAttribute('aria-label');
            const targetVal = solvedGrid[i][j];

            if (currentAria === String(targetVal)) continue;

            cell.click();
            const keyEvent = new KeyboardEvent('keydown', {
                key: String(targetVal),
                code: `Digit${targetVal}`,
                keyCode: 48 + targetVal,
                which: 48 + targetVal,
                bubbles: true
            });
            cell.dispatchEvent(keyEvent);
            await sleep(1);
        }
    }

    // Deselect last cell
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
