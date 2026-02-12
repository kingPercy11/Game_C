/**
 * Solves a 9x9 Sudoku grid using backtracking.
 * @param {number[][]} board - 9x9 grid where 0 represents an empty cell.
 * @returns {number[][] | null} - The solved grid, or null if no solution exists.
 */
function solveSudoku(board) {
    const solvedBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    if (solve(solvedBoard)) {
        return solvedBoard;
    }
    return null;
}

/**
 * Recursive backtracking function.
 * @param {number[][]} board
 * @returns {boolean} - True if solved, false otherwise.
 */
function solve(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) {
                            return true;
                        }
                        board[row][col] = 0; // Backtrack
                    }
                }
                return false; // No number fits
            }
        }
    }
    return true; // Solved
}

/**
 * Checks if placing num at board[row][col] is valid.
 * @param {number[][]} board
 * @param {number} row
 * @param {number} col
 * @param {number} num
 * @returns {boolean}
 */
function isValid(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

// Expose to window for content script usage
window.solveSudoku = solveSudoku;
