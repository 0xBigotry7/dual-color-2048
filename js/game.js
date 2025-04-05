/**
 * Main Game Module
 * Initializes and manages the game
 */
import { GRID_SIZE, COLOR_CHANGE_MOVES } from './constants.js';
import { resetGameState, getBoard, setGameOver, getIsGameOver, getColorChangeMoves } from './state.js';
import { initBoard, isGameBlocked } from './board.js';
import { addRandomTile } from './tiles.js';
import { initUI, updateUI, updateColorChangesDisplay, updateBoardVisuals, hideGameOver } from './ui.js';
import { initInputHandlers } from './input.js';

/**
 * Initialize the game
 */
export function initGame() {
    console.log('Initializing Dual-Color 2048 game (6x6)...');
    
    // Initialize game state
    resetGameState();
    
    // Initialize UI
    initUI();
    
    // Initialize board
    const boardElement = document.getElementById('game-board');
    initBoard(boardElement);
    
    // Add initial tiles
    addRandomTile();
    addRandomTile();
    
    // Update UI
    updateBoardVisuals();
    updateColorChangesDisplay(COLOR_CHANGE_MOVES);
    
    // Initialize input handlers
    initInputHandlers();
    
    // Set up game restart listener
    document.addEventListener('game:restart', restartGame);
    document.addEventListener('game:updateCombo', () => {
        document.dispatchEvent(new CustomEvent('ui:updateCombo'));
    });
    document.addEventListener('game:resetCombo', () => {
        document.dispatchEvent(new CustomEvent('ui:resetCombo'));
    });
    
    console.log('Game initialized successfully!');
}

/**
 * Restart the game
 */
function restartGame() {
    console.log('Restarting game...');
    
    // Reset game state
    resetGameState();
    
    // Clear the board
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    
    // Re-initialize the board
    initBoard(boardElement);
    
    // Add initial tiles
    addRandomTile();
    addRandomTile();
    
    // Update UI
    updateBoardVisuals();
    updateUI();
    updateColorChangesDisplay(COLOR_CHANGE_MOVES);
    hideGameOver();
    
    console.log('Game restarted successfully!');
}

/**
 * Check if the game is over
 * @returns {boolean} True if game is over
 */
export function checkGameOver() {
    if (getIsGameOver()) return true;
    
    const board = getBoard();
    const colorChangesRemaining = getColorChangeMoves();
    
    // Game is over if there are no possible moves
    if (isGameBlocked(board, true)) {
        // If we have color changes left, the game might not be over
        if (colorChangesRemaining > 0) {
            // Check if there are any tiles on the board that could be affected by color changes
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (board[r][c]) {
                        // If there's at least one tile, we can use a color change
                        return false;
                    }
                }
            }
        }
        
        // Game is over
        setGameOver(true);
        document.dispatchEvent(new CustomEvent('ui:gameOver'));
        return true;
    }
    
    return false;
}

/**
 * Update the board visuals
 */
export function updateBoardVisuals() {
    document.querySelectorAll('.tile').forEach(tileElement => {
        // Update tile positions
        const row = parseInt(tileElement.dataset.row);
        const col = parseInt(tileElement.dataset.col);
        
        // Calculate position
        const cellWidth = 100 / GRID_SIZE;
        tileElement.style.top = `${row * cellWidth}%`;
        tileElement.style.left = `${col * cellWidth}%`;
        tileElement.style.width = `${cellWidth}%`;
        tileElement.style.height = `${cellWidth}%`;
        
        // Update font size
        const value = parseInt(tileElement.dataset.value);
        updateTileFontSize(tileElement, value);
    });
}

/**
 * Update font size for a tile based on its value
 * @param {HTMLElement} tileElement - Tile element to update
 * @param {number} value - Tile value
 */
function updateTileFontSize(tileElement, value) {
    const isVerySmall = window.innerWidth < 400;
    const isMobile = window.innerWidth < 768;
    
    // Base font size depends on digits in value
    let fontSize;
    const digits = value.toString().length;
    
    if (digits <= 1) {
        fontSize = isVerySmall ? 18 : isMobile ? 22 : 26;
    } else if (digits === 2) {
        fontSize = isVerySmall ? 16 : isMobile ? 20 : 24;
    } else if (digits === 3) {
        fontSize = isVerySmall ? 14 : isMobile ? 18 : 22;
    } else {
        fontSize = isVerySmall ? 12 : isMobile ? 14 : 18;
    }
    
    tileElement.style.fontSize = `${fontSize}px`;
}

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame); 