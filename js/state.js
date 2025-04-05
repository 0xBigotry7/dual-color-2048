/**
 * Game State
 * Manages the current state of the game
 */
import { COLOR_CHANGE_MOVES } from './constants.js';

// Game state variables
let board = [];                // 2D array representing the grid
let score = 0;                 // Current score
let comboMultiplier = 1;       // Current combo multiplier
let colorChangeMoves = COLOR_CHANGE_MOVES; // Remaining color change moves
let isGameOver = false;        // Game over flag
let currentLanguage = 'en';    // Current language
let tileIdCounter = 0;         // Counter for generating unique tile IDs

/**
 * Reset the game state to initial values
 */
export function resetGameState() {
    score = 0;
    comboMultiplier = 1;
    colorChangeMoves = COLOR_CHANGE_MOVES;
    isGameOver = false;
    // Board is reset separately
}

/**
 * Get the current board state
 * @returns {Array} Current board
 */
export function getBoard() {
    return board;
}

/**
 * Set the board state
 * @param {Array} newBoard - New board state
 */
export function setBoard(newBoard) {
    board = newBoard;
}

/**
 * Get the current score
 * @returns {number} Current score
 */
export function getScore() {
    return score;
}

/**
 * Update the score
 * @param {number} points - Points to add
 */
export function updateScore(points) {
    score += points * comboMultiplier;
    return score;
}

/**
 * Get the current combo multiplier
 * @returns {number} Current combo multiplier
 */
export function getComboMultiplier() {
    return comboMultiplier;
}

/**
 * Increment the combo multiplier
 */
export function incrementCombo() {
    comboMultiplier++;
    return comboMultiplier;
}

/**
 * Reset the combo multiplier
 */
export function resetCombo() {
    comboMultiplier = 1;
    return comboMultiplier;
}

/**
 * Get the remaining color change moves
 * @returns {number} Remaining color change moves
 */
export function getColorChangeMoves() {
    return colorChangeMoves;
}

/**
 * Decrement the color change moves
 */
export function decrementColorChangeMoves() {
    colorChangeMoves--;
    return colorChangeMoves;
}

/**
 * Check if the game is over
 * @returns {boolean} True if game is over
 */
export function getIsGameOver() {
    return isGameOver;
}

/**
 * Set the game over state
 * @param {boolean} value - New game over state
 */
export function setGameOver(value) {
    isGameOver = value;
}

/**
 * Get the current language
 * @returns {string} Current language
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Toggle the current language
 */
export function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    return currentLanguage;
}

/**
 * Generate a unique tile ID
 * @returns {number} Unique tile ID
 */
export function generateTileId() {
    return tileIdCounter++;
} 