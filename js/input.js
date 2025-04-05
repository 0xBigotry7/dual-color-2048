/**
 * Input Handler
 * Manages keyboard and touch interactions
 */
import { getBoard, decrementColorChangeMoves, getColorChangeMoves, getIsGameOver } from './state.js';
import { moveTiles, changeRowColor, changeColumnColor } from './movement.js';
import { addRandomTile } from './tiles.js';
import { checkGameOver, updateBoardVisuals } from './game.js';

// Touch tracking variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

/**
 * Initialize input handlers
 */
export function initInputHandlers() {
    // Keyboard event handling
    document.addEventListener('keydown', handleKeyPress);
    
    // Touch event handling
    const gameBoard = document.getElementById('game-board');
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameBoard.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Button event handling
    document.getElementById('new-game-button').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('game:restart'));
    });
    
    document.getElementById('language-toggle').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('ui:toggleLanguage'));
    });
    
    // Row/Column color change buttons
    setupRowColumnButtons();
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Handle keyboard presses
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyPress(event) {
    if (getIsGameOver()) return;
    
    const key = event.key.toLowerCase();
    
    // Check for arrow keys or WASD
    if (['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'].includes(key)) {
        event.preventDefault();
        
        let direction;
        switch (key) {
            case 'arrowup':
            case 'w':
                direction = 'up';
                break;
            case 'arrowright':
            case 'd':
                direction = 'right';
                break;
            case 'arrowdown':
            case 's':
                direction = 'down';
                break;
            case 'arrowleft':
            case 'a':
                direction = 'left';
                break;
        }
        
        processMoveInDirection(direction);
    } 
    // Check for number keys for row/column color changes
    else if (key >= '1' && key <= '6') {
        event.preventDefault();
        
        const index = parseInt(key);
        processColorChange(index);
    }
}

/**
 * Handle touch start event
 * @param {TouchEvent} event - Touch start event
 */
function handleTouchStart(event) {
    if (getIsGameOver()) return;
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

/**
 * Handle touch end event
 * @param {TouchEvent} event - Touch end event
 */
function handleTouchEnd(event) {
    if (getIsGameOver()) return;
    
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    
    // Calculate swipe direction
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // Only process if the swipe is significant
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
        // Determine the direction based on which axis had the larger movement
        if (Math.abs(dx) > Math.abs(dy)) {
            processMoveInDirection(dx > 0 ? 'right' : 'left');
        } else {
            processMoveInDirection(dy > 0 ? 'down' : 'up');
        }
    }
}

/**
 * Process a move in the specified direction
 * @param {string} direction - Direction to move tiles
 */
function processMoveInDirection(direction) {
    const { boardChanged, hasMerged } = moveTiles(direction);
    
    if (boardChanged) {
        addRandomTile();
        updateBoardVisuals();
        checkGameOver();
        
        if (hasMerged) {
            // Process combo if tiles merged
            document.dispatchEvent(new CustomEvent('game:updateCombo'));
        } else {
            // Reset combo if no merges
            document.dispatchEvent(new CustomEvent('game:resetCombo'));
        }
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    updateBoardVisuals();
}

/**
 * Setup row and column button event listeners
 */
function setupRowColumnButtons() {
    // Setup row buttons
    for (let r = 1; r <= 6; r++) {
        const rowBtn = document.getElementById(`row-${r}`);
        if (rowBtn) {
            rowBtn.addEventListener('click', () => {
                processRowColorChange(r);
            });
        }
    }
    
    // Setup column buttons
    for (let c = 1; c <= 6; c++) {
        const colBtn = document.getElementById(`col-${c}`);
        if (colBtn) {
            colBtn.addEventListener('click', () => {
                processColumnColorChange(c);
            });
        }
    }
}

/**
 * Process a color change for a row
 * @param {number} rowIndex - 1-based row index
 */
function processRowColorChange(rowIndex) {
    if (getIsGameOver() || getColorChangeMoves() <= 0) return;
    
    const board = getBoard();
    if (changeRowColor(rowIndex, board)) {
        decrementColorChangeMoves();
        updateBoardVisuals();
        
        document.dispatchEvent(new CustomEvent('ui:showToast', { 
            detail: { message: `Changed Row ${rowIndex} colors!` }
        }));
    }
}

/**
 * Process a color change for a column
 * @param {number} colIndex - 1-based column index
 */
function processColumnColorChange(colIndex) {
    if (getIsGameOver() || getColorChangeMoves() <= 0) return;
    
    const board = getBoard();
    if (changeColumnColor(colIndex, board)) {
        decrementColorChangeMoves();
        updateBoardVisuals();
        
        document.dispatchEvent(new CustomEvent('ui:showToast', { 
            detail: { message: `Changed Column ${colIndex} colors!` }
        }));
    }
}

/**
 * Process color change based on number key
 * @param {number} index - 1-based index pressed
 */
function processColorChange(index) {
    if (getIsGameOver() || getColorChangeMoves() <= 0) return;
    
    // Check if shift key is pressed to determine row vs column
    const isShiftPressed = window.event.shiftKey;
    
    if (isShiftPressed) {
        processColumnColorChange(index);
    } else {
        processRowColorChange(index);
    }
} 