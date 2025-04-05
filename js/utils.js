/**
 * Utility Functions
 * Common helper functions used across the app
 */

/**
 * Generate a random integer in a range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random item from an array
 * @param {Array} array - Array to select from
 * @returns {*} Random item from the array
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a shallow copy of a 2D array (board)
 * @param {Array} board - 2D array to copy
 * @returns {Array} Copy of the board
 */
export function copyBoard(board) {
    return board.map(row => [...row]);
}

/**
 * Check if two boards are equal
 * @param {Array} board1 - First board
 * @param {Array} board2 - Second board
 * @returns {boolean} True if boards are equal
 */
export function areBoardsEqual(board1, board2) {
    if (!board1 || !board2 || board1.length !== board2.length) return false;
    
    for (let r = 0; r < board1.length; r++) {
        if (board1[r].length !== board2[r].length) return false;
        
        for (let c = 0; c < board1[r].length; c++) {
            // Check null cases
            if (!board1[r][c] && !board2[r][c]) continue;
            if (!board1[r][c] || !board2[r][c]) return false;
            
            // Check tile properties
            if (board1[r][c].value !== board2[r][c].value ||
                board1[r][c].color !== board2[r][c].color ||
                board1[r][c].row !== board2[r][c].row ||
                board1[r][c].col !== board2[r][c].col) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 