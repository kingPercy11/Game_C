/**
 * Word Search for Browser (Chrome Extension)
 * No Node.js dependencies
 */

const ROWS = 8;
const COLS = 6;
const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 15;

const DIRECTIONS = [
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: -1, dc: -1 }
];

let dictSet = null;
let prefixSet = null;

/**
 * Initialize dictionary from array of words
 */
function initDictionary(words) {
    console.log(`Initializing dictionary with ${words.length} words...`);

    dictSet = new Set(words.map(w => w.toUpperCase()));
    prefixSet = new Set();

    for (const word of words) {
        const upper = word.toUpperCase();
        for (let i = MIN_WORD_LENGTH; i <= upper.length; i++) {
            prefixSet.add(upper.slice(0, i));
        }
    }

    console.log(`Dictionary ready: ${dictSet.size} words, ${prefixSet.size} prefixes`);
}

/**
 * Find all valid words in the grid
 */
function findAllWords(grid) {
    if (!dictSet || !prefixSet) {
        throw new Error('Dictionary not initialized. Call initDictionary first.');
    }

    const foundWords = new Map();

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const visited = new Set();
            const path = [];
            generatePaths(grid, row, col, '', visited, path, foundWords);
        }
    }

    return Array.from(foundWords.entries())
        .map(([word, path]) => ({ word, positions: path }))
        .sort((a, b) => b.word.length - a.word.length);
}

function generatePaths(grid, row, col, currentWord, visited, path, foundWords) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    const key = `${row},${col}`;
    if (visited.has(key)) return;

    const letter = grid[row][col].toUpperCase();
    const newWord = currentWord + letter;

    if (newWord.length >= MIN_WORD_LENGTH && !prefixSet.has(newWord)) return;
    if (newWord.length > MAX_WORD_LENGTH) return;

    visited.add(key);
    path.push({ row, col, letter });

    if (newWord.length >= MIN_WORD_LENGTH && dictSet.has(newWord)) {
        if (!foundWords.has(newWord)) {
            foundWords.set(newWord, [...path]);
        }
    }

    for (const dir of DIRECTIONS) {
        generatePaths(grid, row + dir.dr, col + dir.dc, newWord, visited, path, foundWords);
    }

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
