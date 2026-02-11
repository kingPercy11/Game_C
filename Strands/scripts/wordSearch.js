
// Word search algorithm using Trie-based DFS

const GRID_HEIGHT = 8;
const GRID_WIDTH = 6;
const MIN_WORD_LENGTH = 4;

// 8-directional movement
const DIRECTIONS = [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1],   // Right
    [-1, -1], // Up-Left
    [-1, 1],  // Up-Right
    [1, -1],  // Down-Left
    [1, 1]    // Down-Right 
];

/**
 * Extract grid from the Strands page
 * @returns {Array} 8x6 grid of cell objects { char, element, r, c }
 */
window.getGrid = function () {
    const grid = [];

    for (let row = 0; row < GRID_HEIGHT; row++) {
        const gridRow = [];
        for (let col = 0; col < GRID_WIDTH; col++) {
            const buttonId = `button-${row * GRID_WIDTH + col}`;
            const button = document.getElementById(buttonId);

            // //console.log(style.backgroundColor);
            if (button) {
                // Check inline style for CSS variables as requested
                const bgStyle = button.style.backgroundColor;
                if (bgStyle && (bgStyle.includes("--text-spangram") || bgStyle.includes("--strands-blue"))) {
                    gridRow.push({
                        char: "#",
                        element: button,
                        r: row,
                        c: col
                    });
                    continue;
                }
                else {
                    gridRow.push({
                        char: button.innerText.toLowerCase().trim(),
                        element: button,
                        r: row,
                        c: col
                    });
                }
            } else {
                //console.warn(`Button not found: ${buttonId}`);
                gridRow.push(null);
            }
        }
        grid.push(gridRow);
    }

    //console.log("Grid extracted");
    return grid;
};

/**
 * Find all valid words (4+ chars) in the grid using DFS with Trie
 * @param {Array} grid - 8x6 grid of cell objects
 * @param {Trie} trie - Trie dictionary
 * @returns {Array} Array of { word, path } sorted by length (4-letter first)
 */
window.findAllWords = function (grid, trie) {
    const rows = grid.length;
    const cols = grid[0].length;
    const uniqueResults = new Map();
    const visited = new Set();

    function dfs(r, c, parentNode, path) {
        const cell = grid[r][c];
        if (!cell) return;

        const char = cell.char;

        // Skip blocked cells (already found words)
        if (char === "#") return;

        if (!parentNode.children[char]) return;

        const currentNode = parentNode.children[char];
        const key = `${r},${c}`;

        visited.add(key);
        path.push(cell);

        // Only store words with 4+ characters
        if (currentNode.isWord && path.length >= MIN_WORD_LENGTH) {
            const wordStr = path.map(p => p.char).join("");
            if (!uniqueResults.has(wordStr)) {
                uniqueResults.set(wordStr, [...path]);
            }
        }

        // Visit all 8 directions
        for (const [dr, dc] of DIRECTIONS) {
            const newRow = r + dr;
            const newCol = c + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (!visited.has(`${newRow},${newCol}`)) {
                    dfs(newRow, newCol, currentNode, path);
                }
            }
        }

        // Backtrack
        visited.delete(key);
        path.pop();
    }

    // Start DFS from each cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            dfs(r, c, trie.root, []);
        }
    }

    //console.log(`Found ${uniqueResults.size} unique words`);

    // Sort by length: shortest (4-letter) first
    return Array.from(uniqueResults, ([word, path]) => ({ word, path }))
        .sort((a, b) => b.word.length - a.word.length);
};

/**
 * Find all paths that use ALL remaining uncolored cells (Hamiltonian paths).
 * @param {Array} grid - 8x6 grid of cell objects
 * @returns {Array} Array of { word, path } objects.
 */
window.findSpangram = function (grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    let validPaths = [];
    let totalUncolored = 0;

    // Count uncolored cells
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] && grid[r][c].char !== "#") {
                totalUncolored++;
            }
        }
    }

    //console.log(`Searching for full paths covering ${totalUncolored} letters...`);

    // Helper DFS
    function dfsFull(r, c, path, visited) {
        if (validPaths.length >= 20) return; // Cap results

        const cell = grid[r][c];
        // Skip invalid or already used cells (marked #)
        if (!cell || cell.char === "#") return;

        visited.add(`${r},${c}`);
        path.push(cell);

        // Check if path uses all uncolored cells
        if (path.length === totalUncolored) {
            const word = path.map(p => p.char).join("");
            validPaths.push({ word: word, path: [...path] });
        } else {
            // Continue DFS
            // Optimization: Only continue if current path length < totalUncolored
            if (path.length < totalUncolored) {
                for (const [dr, dc] of DIRECTIONS) {
                    const newRow = r + dr;
                    const newCol = c + dc;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        if (!visited.has(`${newRow},${newCol}`)) {
                            dfsFull(newRow, newCol, path, visited);
                        }
                    }
                }
            }
        }

        // Backtrack
        visited.delete(`${r},${c}`);
        path.pop();
    }

    // Start DFS from EVERY uncolored cell
    //add cap here
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] && grid[r][c].char !== "#") {
                dfsFull(r, c, [], new Set());
                // if (validPaths.length >= 20) break;
            }
        }
        // if (validPaths.length >= 20) break;
    }

    if (validPaths.length > 0) {
        //console.log(`Found ${validPaths.length} candidate paths.`);
        return validPaths;
    }

    return [];
};
