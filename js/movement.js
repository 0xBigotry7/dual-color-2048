/**
 * Tile Movement Logic
 * Handles tile movement and merging
 */
import { SPECIAL_TILES } from './constants.js';
import { getBoard, updateScore, incrementCombo, resetCombo } from './state.js';
import { isValidPosition } from './board.js';
import { moveTile, getRandomColor, applyConverterEffect } from './tiles.js';

/**
 * Move tiles in a specific direction
 * @param {string} direction - Direction to move tiles (up, right, down, left)
 * @returns {boolean} True if the board changed
 */
export function moveTiles(direction) {
    const board = getBoard();
    
    // Keep track of whether the board changed
    let boardChanged = false;
    let hasMerged = false;
    
    // Clear merged flags
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c]) {
                board[r][c].merged = false;
            }
        }
    }
    
    // Determine traversal order
    const traversals = getTraversalOrder(direction, board.length);
    
    // Process each tile
    traversals.row.forEach(r => {
        traversals.col.forEach(c => {
            const tile = board[r][c];
            
            if (tile) {
                // Find the farthest position and next tile (for potential merge)
                const { farthest, next } = findFarthestPosition(r, c, direction, board);
                
                if (!farthest) return; // Skip if no valid position
                
                const isMoved = farthest.r !== r || farthest.c !== c;
                
                // Check if we can merge with the next tile
                if (next && canMerge(tile, board[next.r][next.c])) {
                    // Perform merge
                    boardChanged = true;
                    hasMerged = true;
                    mergeTiles(tile, board[next.r][next.c], board);
                } else if (isMoved) {
                    // Just move the tile (no merge)
                    boardChanged = true;
                    moveTile(tile, farthest.r, farthest.c, board);
                }
            }
        });
    });
    
    // Return whether the board changed
    return { boardChanged, hasMerged };
}

/**
 * Get the traversal order for moving tiles
 * @param {string} direction - Direction to move tiles
 * @param {number} size - Size of the board
 * @returns {Object} Traversal order for rows and columns
 */
export function getTraversalOrder(direction, size) {
    const traversal = {
        row: Array.from({ length: size }, (_, i) => i),
        col: Array.from({ length: size }, (_, i) => i)
    };
    
    // Reverse traversal order for right and down moves
    if (direction === 'right') traversal.col.reverse();
    if (direction === 'down') traversal.row.reverse();
    
    return traversal;
}

/**
 * Find the farthest position a tile can move to
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {string} direction - Direction to move
 * @param {Array} board - Current board state
 * @returns {Object} Farthest position and next position
 */
export function findFarthestPosition(row, col, direction, board) {
    let farthest = { r: row, c: col };
    let next = null;
    
    // Calculate direction deltas
    const delta = {
        'up': { r: -1, c: 0 },
        'right': { r: 0, c: 1 },
        'down': { r: 1, c: 0 },
        'left': { r: 0, c: -1 }
    }[direction];
    
    // Find the farthest empty position
    let r = row + delta.r;
    let c = col + delta.c;
    
    while (isValidPosition(r, c) && !board[r][c]) {
        // Update farthest if the cell is empty
        farthest = { r, c };
        r += delta.r;
        c += delta.c;
    }
    
    // Check if there's a tile next to the farthest position
    if (isValidPosition(r, c)) {
        next = { r, c };
    }
    
    return { farthest, next };
}

/**
 * Check if two tiles can be merged
 * @param {Object} tile1 - First tile
 * @param {Object} tile2 - Second tile
 * @returns {boolean} True if tiles can be merged
 */
export function canMerge(tile1, tile2) {
    if (!tile1 || !tile2 || tile1.merged || tile2.merged) return false;
    
    // Wildcard tiles can merge with any tile of the same value
    if (tile1.special === SPECIAL_TILES.WILDCARD || tile2.special === SPECIAL_TILES.WILDCARD) {
        return tile1.value === tile2.value;
    }
    
    // Regular tiles need same value and color
    return tile1.value === tile2.value && tile1.color === tile2.color;
}

/**
 * Merge two tiles
 * @param {Object} fromTile - Tile being moved
 * @param {Object} toTile - Destination tile
 * @param {Array} board - Current board state
 */
export function mergeTiles(fromTile, toTile, board) {
    const newValue = toTile.value * 2;
    const wasConverter = fromTile.special === SPECIAL_TILES.CONVERTER || toTile.special === SPECIAL_TILES.CONVERTER;
    
    // Determine merged color (special rules for wildcards and 32/256 values)
    let newColor;
    
    if (fromTile.special === SPECIAL_TILES.WILDCARD && toTile.special === SPECIAL_TILES.WILDCARD) {
        newColor = getRandomColor();
    } else if (fromTile.special === SPECIAL_TILES.WILDCARD) {
        newColor = toTile.color;
    } else if (toTile.special === SPECIAL_TILES.WILDCARD) {
        newColor = fromTile.color;
    } else {
        newColor = toTile.color;
    }
    
    // Special rule: 32 and 256 tiles change color
    if (newValue === 32 || newValue === 256) {
        newColor = newColor === 'red' ? 'blue' : 'red';
    }
    
    // Remove from old position
    board[fromTile.row][fromTile.col] = null;
    
    // Update to-tile with new values
    toTile.value = newValue;
    toTile.color = newColor;
    toTile.merged = true;
    toTile.special = null; // Special status is lost on merge
    
    // Update score
    updateScore(newValue);
    
    // Handle converter effect if applicable
    if (wasConverter) {
        applyConverterEffect(toTile.row, toTile.col, board);
    }
}

/**
 * Change the color of tiles in a row
 * @param {number} rowIndex - 1-based row index
 * @param {Array} board - Current board state
 * @returns {boolean} True if any tiles were changed
 */
export function changeRowColor(rowIndex, board) {
    const adjustedRowIndex = rowIndex - 1; // Convert 1-based to 0-based
    
    if (adjustedRowIndex < 0 || adjustedRowIndex >= board.length) {
        return false;
    }
    
    let changed = false;
    
    for (let c = 0; c < board[0].length; c++) {
        if (board[adjustedRowIndex][c]) {
            board[adjustedRowIndex][c].color = board[adjustedRowIndex][c].color === 'red' ? 'blue' : 'red';
            changed = true;
        }
    }
    
    return changed;
}

/**
 * Change the color of tiles in a column
 * @param {number} colIndex - 1-based column index
 * @param {Array} board - Current board state
 * @returns {boolean} True if any tiles were changed
 */
export function changeColumnColor(colIndex, board) {
    const adjustedColIndex = colIndex - 1; // Convert 1-based to 0-based
    
    if (adjustedColIndex < 0 || adjustedColIndex >= board[0].length) {
        return false;
    }
    
    let changed = false;
    
    for (let r = 0; r < board.length; r++) {
        if (board[r][adjustedColIndex]) {
            board[r][adjustedColIndex].color = board[r][adjustedColIndex].color === 'red' ? 'blue' : 'red';
            changed = true;
        }
    }
    
    return changed;
} 