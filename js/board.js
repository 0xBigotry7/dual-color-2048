/**
 * Board Management
 * Handles board initialization and state management
 */
import { GRID_SIZE } from './constants.js';
import { setBoard } from './state.js';

/**
 * Initialize the game board
 * @param {HTMLElement} boardElement - The game board DOM element
 * @returns {Array} The initialized board
 */
export function initBoard(boardElement) {
    // Create a new empty board
    const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Clear the board element
    boardElement.innerHTML = '';
    
    // Create grid cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            boardElement.appendChild(cell);
        }
    }
    
    // Update state
    setBoard(board);
    
    return board;
}

/**
 * Check if a position is valid on the board
 * @param {number} r - Row index
 * @param {number} c - Column index
 * @returns {boolean} True if the position is valid
 */
export function isValidPosition(r, c) {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

/**
 * Check if the game is blocked (no more moves possible)
 * @param {Array} board - The current board state
 * @param {Function} canMerge - Function to check if two tiles can merge
 * @returns {boolean} True if the game is blocked
 */
export function isGameBlocked(board, canMerge) {
    // Check for empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!board[r][c]) return false;
        }
    }
    
    // Check for possible merges
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = board[r][c];
            
            // Check adjacent cells for possible merges
            const adjacentPositions = [
                { r: r - 1, c: c },   // Up
                { r: r + 1, c: c },   // Down
                { r: r, c: c - 1 },   // Left
                { r: r, c: c + 1 }    // Right
            ];
            
            for (const pos of adjacentPositions) {
                if (isValidPosition(pos.r, pos.c) && canMerge(tile, board[pos.r][pos.c])) {
                    return false;
                }
            }
        }
    }
    
    return true; // No moves possible
} 