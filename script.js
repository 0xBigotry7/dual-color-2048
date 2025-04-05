console.log('script.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');
    
    // DOM Elements
    const boardElement = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const comboMultiplierElement = document.getElementById('combo-multiplier');
    const movesLeftElement = document.getElementById('moves-left');
    const changeRowBtn = document.getElementById('change-row-btn');
    const changeColBtn = document.getElementById('change-col-btn');
    const gameOverMessageElement = document.getElementById('game-over-message');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const modal = document.getElementById('instructions-modal');
    const infoBtn = document.getElementById('info-btn');
    const closeBtn = document.querySelector('.close-button');

    // Game Constants
    const GRID_SIZE = 6;
    const TILE_COLORS = ['red', 'blue'];
    const SPECIAL_TILES = {
        WILDCARD: 'wildcard',
        CONVERTER: 'converter'
    };
    const COLOR_CHANGE_MOVES = 5;
    
    // Game State
    let board = [];           // 2D array representing the grid
    let score = 0;            // Current score
    let comboMultiplier = 1;  // Current combo multiplier
    let colorChangeMoves = COLOR_CHANGE_MOVES; // Remaining color change moves
    let isGameOver = false;   // Game over flag
    let currentLanguage = 'en'; // Current language
    let tileIdCounter = 0;    // Counter for generating unique tile IDs
    
    // ============================
    // Initialization Functions
    // ============================
    
    function initGame() {
        console.log('Initializing game');
        // Reset game state
        score = 0;
        comboMultiplier = 1;
        colorChangeMoves = COLOR_CHANGE_MOVES;
        isGameOver = false;
        
        // Reset UI
        scoreElement.textContent = '0';
        comboMultiplierElement.textContent = '1';
        movesLeftElement.textContent = colorChangeMoves;
        gameOverMessageElement.style.display = 'none';
        
        // Initialize the board
        initBoard();
        
        // Add initial tiles (4 for 6x6 board)
        for (let i = 0; i < 4; i++) {
            addRandomTile();
        }
        
        // Update the board visuals
        updateBoardVisuals();
    }
    
    function initBoard() {
        // Create a new empty board
        board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        
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
    }
    
    // ============================
    // Tile Management Functions
    // ============================
    
    function createTile(row, col, value, color, special = null) {
        const id = generateTileId();
        return { row, col, value, color, special, id, merged: false };
    }
    
    function generateTileId() {
        return tileIdCounter++;
    }
    
    function addRandomTile() {
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
        createTileElement(board[r][c]);
        
        return true;
    }
    
    function createTileElement(tile) {
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
    }
    
    function positionTile(tileElement, row, col) {
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
    
    function updateTileFontSize(tileElement) {
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
    
    // ============================
    // Game Logic
    // ============================
    
    function moveTiles(direction) {
        if (isGameOver) return false;
        
        // Keep track of whether the board changed
        let boardChanged = false;
        let hasMerged = false;
        
        // Clear merged flags
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c]) {
                    board[r][c].merged = false;
                }
            }
        }
        
        // Determine traversal order
        const traversals = getTraversalOrder(direction);
        
        // Process each tile
        traversals.row.forEach(r => {
            traversals.col.forEach(c => {
                const tile = board[r][c];
                
                if (tile) {
                    // Find the farthest position and next tile (for potential merge)
                    const { farthest, next } = findFarthestPosition(r, c, direction);
                    
                    if (!farthest) return; // Skip if no valid position
                    
                    const isMoved = farthest.r !== r || farthest.c !== c;
                    
                    // Check if we can merge with the next tile
                    if (next && canMerge(tile, board[next.r][next.c])) {
                        // Perform merge
                        boardChanged = true;
                        hasMerged = true;
                        mergeTiles(tile, board[next.r][next.c]);
                    } else if (isMoved) {
                        // Just move the tile (no merge)
                        boardChanged = true;
                        moveTile(tile, farthest.r, farthest.c);
                    }
                }
            });
        });
        
        // Update game state based on the move
        if (boardChanged) {
            // Update combo multiplier
            if (hasMerged) {
                updateCombo();
            } else {
                resetCombo();
            }
            
            // Add a new random tile
            setTimeout(() => {
                addRandomTile();
                
                // Check for game over
                if (isGameBlocked()) {
                    endGame();
                }
            }, 150);
            
            // Update the board visuals
            updateBoardVisuals();
        }
        
        return boardChanged;
    }
    
    function getTraversalOrder(direction) {
        const traversal = {
            row: Array.from({ length: GRID_SIZE }, (_, i) => i),
            col: Array.from({ length: GRID_SIZE }, (_, i) => i)
        };
        
        // Reverse traversal order for right and down moves
        if (direction === 'right') traversal.col.reverse();
        if (direction === 'down') traversal.row.reverse();
        
        return traversal;
    }
    
    function findFarthestPosition(row, col, direction) {
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
        
        while (isValidPosition(r, c)) {
            if (!board[r][c]) {
                // Update farthest if the cell is empty
                farthest = { r, c };
                r += delta.r;
                c += delta.c;
            } else {
                // Cell is occupied - this could be a merge candidate
                next = { r, c };
                break;
            }
        }
        
        return { farthest, next };
    }
    
    function isValidPosition(r, c) {
        return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
    }
    
    function canMerge(tile1, tile2) {
        if (!tile1 || !tile2 || tile1.merged || tile2.merged) return false;
        
        // Wildcard tiles can merge with any tile of the same value
        if (tile1.special === SPECIAL_TILES.WILDCARD || tile2.special === SPECIAL_TILES.WILDCARD) {
            return tile1.value === tile2.value;
        }
        
        // Regular tiles need same value and color
        return tile1.value === tile2.value && tile1.color === tile2.color;
    }
    
    function moveTile(tile, newRow, newCol) {
        // Remove from old position
        board[tile.row][tile.col] = null;
        
        // Update position
        tile.row = newRow;
        tile.col = newCol;
        
        // Place at new position
        board[newRow][newCol] = tile;
    }
    
    function mergeTiles(fromTile, toTile) {
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
            applyConverterEffect(toTile.row, toTile.col);
        }
    }
    
    function applyConverterEffect(row, col) {
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
    
    function getRandomColor() {
        return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
    }
    
    function isGameBlocked() {
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
    
    function endGame() {
        isGameOver = true;
        finalScoreElement.textContent = score;
        gameOverMessageElement.style.display = 'flex';
    }
    
    // ============================
    // Row/Column Color Change
    // ============================
    
    function changeRowColor(rowIndex) {
        if (colorChangeMoves <= 0 || isGameOver) {
            showToast('No color change moves left!');
            return false;
        }
        
        const adjustedRowIndex = rowIndex - 1; // Convert 1-based to 0-based
        
        if (adjustedRowIndex < 0 || adjustedRowIndex >= GRID_SIZE) {
            showToast('Invalid row number. Please enter 1-6.');
            return false;
        }
        
        let changed = false;
        
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[adjustedRowIndex][c]) {
                board[adjustedRowIndex][c].color = board[adjustedRowIndex][c].color === 'red' ? 'blue' : 'red';
                changed = true;
            }
        }
        
        if (changed) {
            colorChangeMoves--;
            movesLeftElement.textContent = colorChangeMoves;
            updateBoardVisuals();
            return true;
        } else {
            showToast('Row is empty, no change made.');
            return false;
        }
    }
    
    function changeColumnColor(colIndex) {
        if (colorChangeMoves <= 0 || isGameOver) {
            showToast('No color change moves left!');
            return false;
        }
        
        const adjustedColIndex = colIndex - 1; // Convert 1-based to 0-based
        
        if (adjustedColIndex < 0 || adjustedColIndex >= GRID_SIZE) {
            showToast('Invalid column number. Please enter 1-6.');
            return false;
        }
        
        let changed = false;
        
        for (let r = 0; r < GRID_SIZE; r++) {
            if (board[r][adjustedColIndex]) {
                board[r][adjustedColIndex].color = board[r][adjustedColIndex].color === 'red' ? 'blue' : 'red';
                changed = true;
            }
        }
        
        if (changed) {
            colorChangeMoves--;
            movesLeftElement.textContent = colorChangeMoves;
            updateBoardVisuals();
            return true;
        } else {
            showToast('Column is empty, no change made.');
            return false;
        }
    }
    
    // ============================
    // UI Updates
    // ============================
    
    function updateBoardVisuals() {
        const tileElements = document.querySelectorAll('.tile');
        const currentTiles = new Map();
        const visibleTiles = new Map();
        
        // Create map of current board tiles
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = board[r][c];
                if (tile) {
                    currentTiles.set(tile.id.toString(), tile);
                }
            }
        }
        
        // Create map of visible tile elements
        tileElements.forEach(el => {
            visibleTiles.set(el.dataset.id, el);
        });
        
        // Update or create tiles
        currentTiles.forEach((tile, id) => {
            let tileElement = visibleTiles.get(id);
            
            if (!tileElement) {
                // Create a new tile element
                createTileElement(tile);
            } else {
                // Update existing tile
                
                // Update position
                positionTile(tileElement, tile.row, tile.col);
                
                // Update value
                if (parseInt(tileElement.dataset.value) !== tile.value) {
                    tileElement.dataset.value = tile.value;
                    if (tile.special === SPECIAL_TILES.WILDCARD) {
                        tileElement.textContent = '★';
                    } else {
                        tileElement.textContent = tile.value;
                    }
                    updateTileFontSize(tileElement);
                }
                
                // Update color
                tileElement.classList.remove('color-red', 'color-blue');
                tileElement.classList.add(`color-${tile.color}`);
                
                // Update special status
                tileElement.classList.remove(SPECIAL_TILES.WILDCARD, SPECIAL_TILES.CONVERTER);
                if (tile.special) {
                    tileElement.classList.add(tile.special);
                }
            }
        });
        
        // Remove tiles that are no longer on the board
        visibleTiles.forEach((element, id) => {
            if (!currentTiles.has(id)) {
                element.style.transform = 'scale(0)';
                element.style.opacity = '0';
                
                setTimeout(() => {
                    if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }
                }, 200);
            }
        });
    }
    
    function updateScore(points) {
        score += points * comboMultiplier;
        scoreElement.textContent = score;
    }
    
    function updateCombo() {
        comboMultiplier++;
        comboMultiplierElement.textContent = comboMultiplier;
    }
    
    function resetCombo() {
        comboMultiplier = 1;
        comboMultiplierElement.textContent = comboMultiplier;
    }
    
    function showToast(message) {
        // Create or reuse toast element
        let toast = document.querySelector('.toast-message');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.classList.add('toast-message');
            document.body.appendChild(toast);
        }
        
        // Set message and show
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
    
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        
        // Update toggle button
        document.getElementById('language-toggle').textContent = currentLanguage === 'en' ? 'EN' : '中';
        
        // Update all language elements
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.getAttribute('data-lang') === currentLanguage) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    // ============================
    // Event Handlers
    // ============================
    
    function handleKeyPress(e) {
        if (isGameOver) return;
        
        let moved = false;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                moved = moveTiles('up');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moved = moveTiles('right');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                moved = moveTiles('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moved = moveTiles('left');
                break;
        }
        
        if (moved) {
            e.preventDefault();
        }
    }
    
    function handleTouchStart(e) {
        if (isGameOver) return;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (isGameOver) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        const MIN_SWIPE = 30; // Minimum swipe distance
        
        // Determine direction based on strongest delta
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE) {
            // Horizontal swipe
            if (deltaX > 0) {
                moveTiles('right');
            } else {
                moveTiles('left');
            }
        } else if (Math.abs(deltaY) > MIN_SWIPE) {
            // Vertical swipe
            if (deltaY > 0) {
                moveTiles('down');
            } else {
                moveTiles('up');
            }
        }
    }
    
    function handleWindowResize() {
        updateBoardVisuals();
    }
    
    // ============================
    // Event Listeners
    // ============================
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Touch controls
    let startX, startY;
    boardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    boardElement.addEventListener('touchend', handleTouchEnd);
    
    // Button controls
    restartButton.addEventListener('click', initGame);
    
    // Color change buttons
    changeRowBtn.addEventListener('click', () => {
        if (colorChangeMoves <= 0 || isGameOver) {
            showToast('No color change moves left!');
            return;
        }
        
        const row = prompt(`Enter row number to change color (1-6). Moves left: ${colorChangeMoves}`);
        if (row !== null) {
            changeRowColor(parseInt(row));
        }
    });
    
    changeColBtn.addEventListener('click', () => {
        if (colorChangeMoves <= 0 || isGameOver) {
            showToast('No color change moves left!');
            return;
        }
        
        const col = prompt(`Enter column number to change color (1-6). Moves left: ${colorChangeMoves}`);
        if (col !== null) {
            changeColumnColor(parseInt(col));
        }
    });
    
    // Modal controls
    infoBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Language toggle
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    
    // Window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleWindowResize, 250);
    });
    
    // Initialize the game
    initGame();
}); 