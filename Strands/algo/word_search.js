/**
 * Word Search Algorithm for Strands Grid
 * Grid size: 8 rows x 6 columns (fixed)
 * Uses pre-built dictionary from dictionary.js
 */

const { dictSet, prefixSet, MIN_WORD_LENGTH } = require('./dictionary');

const ROWS = 8;
const COLS = 6;
const MAX_WORD_LENGTH = 15;

// 8 directions for adjacency
const DIRECTIONS = [
    { dr: 0, dc: 1 },   // right
    { dr: 0, dc: -1 },  // left
    { dr: 1, dc: 0 },   // down
    { dr: -1, dc: 0 },  // up
    { dr: 1, dc: 1 },   // down-right
    { dr: 1, dc: -1 },  // down-left
    { dr: -1, dc: 1 },  // up-right
    { dr: -1, dc: -1 }  // up-left
];

/**
 * Find all valid words in the grid
 * @param {string[][]} grid - 8x6 grid of letters
 * @returns {Object[]} Array of found words with their paths
 */
function findAllWords(grid) {
    const foundWords = new Map();

    // Start DFS from each cell
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const visited = new Set();
            const path = [];
            generatePaths(grid, row, col, '', visited, path, foundWords);
        }
    }

    // Convert to array and sort by length (longest first)
    return Array.from(foundWords.entries())
        .map(([word, path]) => ({ word, positions: path }))
        .sort((a, b) => b.word.length - a.word.length);
}

/**
 * Recursive DFS with prefix pruning
 */
function generatePaths(grid, row, col, currentWord, visited, path, foundWords) {
    // Out of bounds
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    // Already visited
    const key = `${row},${col}`;
    if (visited.has(key)) return;

    // Build current word
    const letter = grid[row][col].toUpperCase();
    const newWord = currentWord + letter;

    // Prune: only check prefix once word is >= 4 chars
    if (newWord.length >= MIN_WORD_LENGTH && !prefixSet.has(newWord)) return;

    // Stop if word is too long
    if (newWord.length > MAX_WORD_LENGTH) return;

    // Mark visited and add to path
    visited.add(key);
    path.push({ row, col, letter });

    // Check if current word is in dictionary
    if (newWord.length >= MIN_WORD_LENGTH && dictSet.has(newWord)) {
        if (!foundWords.has(newWord)) {
            foundWords.set(newWord, [...path]);
        }
    }

    // Continue exploring all 8 directions
    for (const dir of DIRECTIONS) {
        generatePaths(grid, row + dir.dr, col + dir.dc, newWord, visited, path, foundWords);
    }

    // Backtrack
    visited.delete(key);
    path.pop();
}

/**
 * Convert flat array of 48 letters to 8x6 grid
 */
function flatToGrid(flatGrid) {
    if (flatGrid.length !== 48) {
        throw new Error(`Expected 48 letters, got ${flatGrid.length}`);
    }
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
        grid.push(flatGrid.slice(row * COLS, (row + 1) * COLS));
    }
    return grid;
}

// Export
module.exports = { findAllWords, flatToGrid, ROWS, COLS };

// Example usage
if (require.main === module) {
    const grid = [
        ['T', 'C', 'K', 'T', 'A', 'I'],
        ['S', 'I', 'O', 'C', 'L', 'P'],
        ['W', 'V', 'E', 'G', 'R', 'M'],
        ['T', 'I', 'O', 'A', 'H', 'I'],
        ['I', 'G', 'L', 'R', 'S', 'H'],
        ['R', 'P', 'S', 'N', 'C', 'E'],
        ['E', 'E', 'Y', 'I', 'R', 'R'],
        ['C', 'L', 'R', 'S', 'H', 'Y']
    ];

    console.log('\nFinding all words in grid...\n');
    const start = Date.now();
    const results = findAllWords(grid);
    const elapsed = Date.now() - start;

    console.log(`Found ${results.length} words in ${elapsed}ms:\n`);

    // Show top 20 longest words
    const top20 = results.slice(0, 800);
    for (const result of top20) {
        const pathStr = result.positions.map(p => `${p.letter}(${p.row},${p.col})`).join(' → ');
        console.log(`${result.word}: ${pathStr}`);
    }

    if (results.length > 20) {
        console.log(`\n... and ${results.length - 20} more words`);
    }
}
