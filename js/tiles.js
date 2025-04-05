/**
 * Tile Management
 * Handles creation, positioning, and styling of tiles
 */
import { GRID_SIZE, TILE_COLORS, SPECIAL_TILES } from './constants.js';
import { getBoard, generateTileId } from './state.js';
import { isValidPosition } from './board.js';

/**
 * Create a new tile object
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {number} value - Tile value
 * @param {string} color - Tile color
 * @param {string|null} special - Special tile type
 * @returns {Object} Tile object
 */
export function createTile(row, col, value, color, special = null) {
    const id = generateTileId();
    return { row, col, value, color, special, id, merged: false };
}

/**
 * Add a random tile to the board
 * @param {HTMLElement} boardElement - The game board DOM element
 * @returns {boolean} True if a tile was added, false if the board is full
 */
export function addRandomTile(boardElement) {
    const board = getBoard();
    
    // Find all empty cells
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!board[r][c]) {
                emptyCells.push({ r, c });
            }
        }
    }
    
    // If there are no empty cells, return
    if (emptyCells.length === 0) return false;
    
    // Pick a random empty cell
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Determine the tile properties
    const value = Math.random() < 0.9 ? 2 : 4;
    const color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
    let special = null;
    
    // Small chance for special tiles
    const specialRand = Math.random();
    if (specialRand < 0.03) {
        special = SPECIAL_TILES.WILDCARD;
    } else if (specialRand < 0.08) {
        special = SPECIAL_TILES.CONVERTER;
    }
    
    // Create the tile and add it to the board
    board[r][c] = createTile(r, c, value, color, special);
    
    // Create the tile element
    createTileElement(board[r][c], boardElement);
    
    return true;
}

/**
 * Create a DOM element for a tile
 * @param {Object} tile - Tile object
 * @param {HTMLElement} boardElement - The game board DOM element
 * @returns {HTMLElement} The created tile element
 */
export function createTileElement(tile, boardElement) {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile', `color-${tile.color}`);
    tileElement.dataset.value = tile.value;
    tileElement.dataset.id = tile.id;
    
    // Set the text content based on special status
    if (tile.special === SPECIAL_TILES.WILDCARD) {
        tileElement.textContent = '★';
        tileElement.classList.add(SPECIAL_TILES.WILDCARD);
    } else if (tile.special === SPECIAL_TILES.CONVERTER) {
        tileElement.textContent = tile.value;
        tileElement.classList.add(SPECIAL_TILES.CONVERTER);
    } else {
        tileElement.textContent = tile.value;
    }
    
    // Position the tile
    positionTile(tileElement, tile.row, tile.col);
    
    // Add to the board
    boardElement.appendChild(tileElement);
    
    // Add appear animation
    requestAnimationFrame(() => {
        tileElement.style.transform = 'scale(1)';
        tileElement.style.opacity = '1';
    });
    
    return tileElement;
}

/**
 * Position a tile element on the board
 * @param {HTMLElement} tileElement - The tile DOM element
 * @param {number} row - Row position
 * @param {number} col - Column position
 */
export function positionTile(tileElement, row, col) {
    // Use fixed percentage-based positioning for absolute stability
    const cellWidth = 100 / GRID_SIZE;
    
    // Position using exact percentages without any calculations that could cause rounding errors
    tileElement.style.top = `${row * cellWidth}%`;
    tileElement.style.left = `${col * cellWidth}%`;
    
    // Size with a consistent percentage that doesn't change
    const tileSize = 0.9 * cellWidth;
    tileElement.style.width = `${tileSize}%`;
    tileElement.style.height = `${tileSize}%`;
    
    // Adaptive font sizing based on tile value
    updateTileFontSize(tileElement);
}

/**
 * Update the font size of a tile based on its value
 * @param {HTMLElement} tileElement - The tile DOM element
 */
export function updateTileFontSize(tileElement) {
    const value = parseInt(tileElement.dataset.value);
    const isMobile = window.innerWidth <= 500;
    const isVerySmall = window.innerWidth <= 350;
    
    let fontSize;
    
    if (value >= 1024) {
        fontSize = isVerySmall ? '12px' : (isMobile ? '14px' : '16px');
    } else if (value >= 128) {
        fontSize = isVerySmall ? '14px' : (isMobile ? '16px' : '20px');
    } else if (value >= 16) {
        fontSize = isVerySmall ? '16px' : (isMobile ? '20px' : '22px');
    } else {
        fontSize = isVerySmall ? '18px' : (isMobile ? '22px' : '24px');
    }
    
    tileElement.style.fontSize = fontSize;
}

/**
 * Move a tile to a new position on the board
 * @param {Object} tile - Tile object
 * @param {number} newRow - New row position
 * @param {number} newCol - New column position
 * @param {Array} board - The board state
 */
export function moveTile(tile, newRow, newCol, board) {
    // Remove from old position
    board[tile.row][tile.col] = null;
    
    // Update position
    tile.row = newRow;
    tile.col = newCol;
    
    // Place at new position
    board[newRow][newCol] = tile;
}

/**
 * Get a random tile color
 * @returns {string} Random color from TILE_COLORS
 */
export function getRandomColor() {
    return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
}

/**
 * Apply converter effect to adjacent tiles
 * @param {number} row - Row of the converter tile
 * @param {number} col - Column of the converter tile
 * @param {Array} board - The board state
 */
export function applyConverterEffect(row, col, board) {
    // Flip color of adjacent tiles
    const adjacentPositions = [
        { r: row - 1, c: col },   // Up
        { r: row + 1, c: col },   // Down
        { r: row, c: col - 1 },   // Left
        { r: row, c: col + 1 }    // Right
    ];
    
    adjacentPositions.forEach(pos => {
        if (isValidPosition(pos.r, pos.c) && board[pos.r][pos.c]) {
            // Flip the color
            board[pos.r][pos.c].color = board[pos.r][pos.c].color === 'red' ? 'blue' : 'red';
        }
    });
} 