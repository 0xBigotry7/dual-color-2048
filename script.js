console.log('script.js file loaded'); // Check if the script file itself is loaded

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Check if the main event listener is working

    const boardElement = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const comboMultiplierElement = document.getElementById('combo-multiplier');
    const movesLeftElement = document.getElementById('moves-left'); // Placeholder
    const changeRowBtn = document.getElementById('change-row-btn');
    const changeColBtn = document.getElementById('change-col-btn');
    const gameOverMessageElement = document.getElementById('game-over-message');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    const gridSize = 6;
    let board = []; // 2D array representing the grid
    let score = 0;
    let comboMultiplier = 1;
    let colorChangeMoves = 5; // Example starting value
    let isGameOver = false;

    const TILE_COLORS = ['red', 'blue'];
    const SPECIAL_TILES = {
        WILDCARD: 'wildcard', // Can merge with any color
        CONVERTER: 'converter' // Changes adjacent colors on merge
        // RAINBOW: 'rainbow' // Merges with any color/adjacent value (Future)
    };

    // Language functionality
    let currentLanguage = 'en';

    function toggleLanguage() {
        // Toggle between languages
        currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        
        // Update the button text
        document.getElementById('language-toggle').textContent = currentLanguage === 'en' ? 'EN' : '中';
        
        // Update all text elements
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            if (element.getAttribute('data-lang') === currentLanguage) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // --- Initialization ---
    function initBoard() {
        board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
        // Clear existing tiles from boardElement
        boardElement.innerHTML = '';
        // Create visual grid cells
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                boardElement.appendChild(cell);
            }
        }
    }

    function getRandomColor() {
        return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
    }

    function addRandomTile() {
        let emptyCells = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!board[r][c]) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
            const color = getRandomColor();
            let special = null;

            // --- Add chance for special tiles ---
            const randSpecial = Math.random();
            const wildcardChance = 0.03; // 3% chance for a wildcard
            const converterChance = 0.05; // 5% chance for a converter (adjust as needed)

            if (randSpecial < wildcardChance) {
                special = SPECIAL_TILES.WILDCARD;
                // Wildcards usually start at a base value, like 2 or 4
            } else if (randSpecial < wildcardChance + converterChance) {
                special = SPECIAL_TILES.CONVERTER;
                 // Converters also need a base value
            }
            // -------------------------------------

            board[r][c] = { value, color, special, id: generateTileId(), r, c, merged: false }; // Add initial r, c and special type
            createTileElement(board[r][c]);
        }
    }

    let tileIdCounter = 0;
    function generateTileId() {
        return tileIdCounter++;
    }

    function createTileElement(tileData) {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile', `color-${tileData.color}`);
        tileElement.dataset.value = tileData.value;
        tileElement.dataset.id = tileData.id;
        tileElement.textContent = tileData.value; // Display value initially
        // Add special tile class if applicable
        if (tileData.special) {
             tileElement.classList.add(tileData.special);
             if (tileData.special === SPECIAL_TILES.WILDCARD) {
                 tileElement.textContent = '★'; // Display star for wildcard
             }
        }

        // Position the tile based on its r, c
        positionTile(tileElement, tileData.r, tileData.c);
        boardElement.appendChild(tileElement);
        // Add animation class for appearance
        tileElement.style.transform = 'scale(0)';
        requestAnimationFrame(() => {
             requestAnimationFrame(() => { // Double rAF for better browser rendering
                tileElement.style.transform = 'scale(1)';
             });
        });

    }

     function positionTile(tileElement, r, c) {
         // Get board dimensions dynamically
         const boardRect = boardElement.getBoundingClientRect();
         
         // Calculate the cell dimensions - make this exact and without rounding
         const cellWidth = boardRect.width / gridSize;
         const cellHeight = boardRect.height / gridSize;
         
         // Use exact percentage-based positions to prevent grid shifting
         const top = (r * (100 / gridSize)) + '%';
         const left = (c * (100 / gridSize)) + '%';
         
         // Size based on cell dimensions with small reduction for spacing
         const tileSize = Math.min(cellWidth, cellHeight) * 0.9;
         
         // Set the tile size directly
         tileElement.style.width = `${tileSize}px`;
         tileElement.style.height = `${tileSize}px`;
         
         // Position the tile with percentage positioning for stability
         tileElement.style.top = top;
         tileElement.style.left = left;
         
         // Adjust font size based on the tile size
         const isMobile = window.innerWidth <= 500;
         const isVerySmall = window.innerWidth <= 350;
         
         let fontSizeMultiplier;
         if (isVerySmall) {
             fontSizeMultiplier = 0.35; // Smaller font for very small screens
         } else if (isMobile) {
             fontSizeMultiplier = 0.38; // Slightly larger for mobile
         } else {
             fontSizeMultiplier = 0.4; // Normal size for desktop
         }
         
         const fontSize = tileSize * fontSizeMultiplier;
         const maxFontSize = isVerySmall ? 20 : (isMobile ? 22 : 26);
         tileElement.style.fontSize = `${Math.min(fontSize, maxFontSize)}px`;
     }

    // --- Game State Updates ---
    function updateScore(newPoints) {
        score += newPoints * comboMultiplier;
        scoreElement.textContent = score;
    }

    function updateCombo(reset = false) {
        if (reset) {
            comboMultiplier = 1;
        } else {
            comboMultiplier++;
        }
        comboMultiplierElement.textContent = `${comboMultiplier}x`;
    }

    function updateMovesLeft() {
        movesLeftElement.textContent = colorChangeMoves;
    }

    // --- Game Logic ---
    function move(direction) {
        if (isGameOver) return;
        // console.log(`Move: ${direction}`); // Keep for debugging if needed

        let boardChanged = false;
        let currentMoveMerged = false; // Track if any merge happened in this move

        // Create a deep copy of the board to compare later to see if anything changed
        // const boardBeforeMove = JSON.parse(JSON.stringify(board)); // Simple deep copy for this structure

        // Define traversal order based on direction
        const traversals = buildTraversals(direction);

        // Clear merged flags from previous turn
         for (let r = 0; r < gridSize; r++) {
             for (let c = 0; c < gridSize; c++) {
                 if (board[r][c]) {
                     board[r][c].merged = false; // Flag to prevent double merging
                 }
             }
         }

        // Iterate through rows/columns based on traversal order
        traversals.rows.forEach(r => {
            traversals.cols.forEach(c => {
                const currentTile = board[r][c];
                if (currentTile) {
                    // Find the furthest position the tile can slide to
                    const farthestPosition = findFarthestPosition(r, c, direction);
                    const nextPos = farthestPosition.next; // The cell where the tile will stop or merge
                    const currentPos = { r: r, c: c };

                    // Check if nextPos is valid (not out of bounds) 
                    const hasValidNextPos = isWithinBounds(nextPos.r, nextPos.c);
                    
                    // Only check for merge if the next position is valid
                    const tileAtNextPos = hasValidNextPos ? board[nextPos.r][nextPos.c] : null;

                    if (hasValidNextPos && tileAtNextPos && !tileAtNextPos.merged && !currentTile.merged && canMerge(currentTile, tileAtNextPos)) {
                        // --- Merge Occurs ---
                        const mergedValue = currentTile.value * 2;
                        const mergedColor = determineMergedColor(currentTile, tileAtNextPos, mergedValue);
                        const wasConverter = currentTile.special === SPECIAL_TILES.CONVERTER || tileAtNextPos.special === SPECIAL_TILES.CONVERTER;

                        // Update the tile at the merge destination
                        tileAtNextPos.value = mergedValue;
                        tileAtNextPos.color = mergedColor;
                        tileAtNextPos.merged = true; // Mark as merged for this turn
                        tileAtNextPos.special = determineSpecialStatusAfterMerge(currentTile, tileAtNextPos, mergedValue); // Handle potential special changes

                        // Remove the original tile that moved and merged
                        board[currentPos.r][currentPos.c] = null;

                        // Update score & combo
                        updateScore(mergedValue);
                        updateCombo(); // Increment combo
                        currentMoveMerged = true;
                        boardChanged = true;

                        // Handle Converter Tile Effect (If the merge involved a converter)
                        if (wasConverter) {
                             // Apply effect *after* the board state is updated but before visuals
                             applyConverterEffect(nextPos.r, nextPos.c);
                        }

                    } else if (farthestPosition.farthest.r !== currentPos.r || farthestPosition.farthest.c !== currentPos.c) {
                        // --- Slide Occurs (No Merge) ---
                         const targetPos = farthestPosition.farthest;
                        // Move tile in the board array
                        board[targetPos.r][targetPos.c] = currentTile;
                        board[currentPos.r][currentPos.c] = null;

                        // Update tile's internal position tracking
                        currentTile.r = targetPos.r;
                        currentTile.c = targetPos.c;

                        boardChanged = true;
                    }
                }
            });
        });

        if (boardChanged) {
            updateBoardVisuals(); // Update visuals after processing all tiles for the move
            // Wait for animations to roughly finish before adding new tile & checking game over
            setTimeout(() => {
                addRandomTile();
                 if (checkGameOver()) {
                    endGame();
                }
                // If merge happened, combo already incremented. If only slide, reset combo.
                 if (!currentMoveMerged) {
                     updateCombo(true); // Reset combo if only sliding occurred
                 }
            }, 100); // Match transition time in CSS roughly
        } else {
             updateCombo(true); // Reset combo if nothing moved
        }
    }

    function buildTraversals(direction) {
        const traversals = { rows: [], cols: [] };
        for (let i = 0; i < gridSize; i++) {
            traversals.rows.push(i);
            traversals.cols.push(i);
        }

        // Reverse traversal order for 'right' and 'down' moves
        if (direction === 'right') traversals.cols.reverse();
        if (direction === 'down') traversals.rows.reverse();

        return traversals;
    }

    function findFarthestPosition(r, c, direction) {
        let currentR = r;
        let currentC = c;
        let nextR, nextC;

        do {
            nextR = currentR;
            nextC = currentC;
            switch (direction) {
                case 'up':    nextR--; break;
                case 'down':  nextR++; break;
                case 'left':  nextC--; break;
                case 'right': nextC++; break;
            }
            // Check if the next position is within bounds and empty
            if (isWithinBounds(nextR, nextC) && !board[nextR][nextC]) {
                currentR = nextR;
                currentC = nextC;
            } else {
                break; // Stop if out of bounds or cell is occupied
            }
        } while (true);

        // 'next' is the position right after the farthest empty cell (potential merge target)
        let mergeTargetR = currentR;
        let mergeTargetC = currentC;
        switch (direction) {
            case 'up':    mergeTargetR--; break;
            case 'down':  mergeTargetR++; break;
            case 'left':  mergeTargetC--; break;
            case 'right': mergeTargetC++; break;
        }

        // Make sure the merge target is within bounds
        const isNextInBounds = isWithinBounds(mergeTargetR, mergeTargetC);

        return {
            farthest: { r: currentR, c: currentC }, // Furthest empty cell the tile can move to
            next: isNextInBounds ? { r: mergeTargetR, c: mergeTargetC } : { r: -1, c: -1 } // If out of bounds, use invalid coords
        };
    }

     function determineMergedColor(tile1, tile2, mergedValue) {
         const isWildcard1 = tile1.special === SPECIAL_TILES.WILDCARD;
         const isWildcard2 = tile2.special === SPECIAL_TILES.WILDCARD;

         let finalColor;

         if (isWildcard1 && isWildcard2) {
             // If both are wildcards, maybe default to one color or alternate? Let's pick one (e.g., tile2's original color if it had one, or random)
             finalColor = tile2.color || getRandomColor(); // Or tile1.color, doesn't matter much
         } else if (isWildcard1) {
             finalColor = tile2.color; // Takes color of the non-wildcard
         } else if (isWildcard2) {
             finalColor = tile1.color; // Takes color of the non-wildcard
         } else {
             finalColor = tile1.color; // Standard merge, color remains the same
         }

         // Special Rule: 32 and 256 merges change color
         if (mergedValue === 32 || mergedValue === 256) {
             finalColor = (finalColor === 'red') ? 'blue' : 'red';
         }

         return finalColor;
     }

    function determineSpecialStatusAfterMerge(tile1, tile2, mergedValue) {
        // If either merging tile was special, does the result retain/gain special status?
        // Current logic: Special status is lost on merge unless defined otherwise.
        // Wildcards become normal tiles of the determined color.
        // Converters become normal tiles (effect applied during merge).
        // Future: Could introduce rules like "merging two converters creates a higher-value converter".
        return null; // Default: merged tile is not special
    }

    function isWithinBounds(r, c) {
        return r >= 0 && r < gridSize && c >= 0 && c < gridSize;
    }

    // --- Add Converter Effect Logic ---
    function applyConverterEffect(mergedRow, mergedCol) {
        console.log(`Applying converter effect around ${mergedRow}, ${mergedCol}`);
        const deltas = [
            { dr: -1, dc: 0 }, // Up
            { dr: 1, dc: 0 },  // Down
            { dr: 0, dc: -1 }, // Left
            { dr: 0, dc: 1 }   // Right
        ];

        deltas.forEach(({ dr, dc }) => {
            const adjacentR = mergedRow + dr;
            const adjacentC = mergedCol + dc;

            if (isWithinBounds(adjacentR, adjacentC)) {
                const adjacentTile = board[adjacentR][adjacentC];
                if (adjacentTile) {
                    // Flip the color of the adjacent tile
                    adjacentTile.color = (adjacentTile.color === 'red') ? 'blue' : 'red';
                    console.log(` > Flipped color of tile at ${adjacentR}, ${adjacentC}`);
                    // Optional: Add visual cue that color was flipped by converter?
                }
            }
        });
        // Visuals will be updated in updateBoardVisuals() called after the move function completes
    }
    // --------------------------------

    function updateBoardVisuals() {
        const tileElements = boardElement.querySelectorAll('.tile');
        const tilesOnBoardData = new Map(); // Map ID -> tileData from board array
        const existingTileElements = new Map(); // Map ID -> tile DOM element

        tileElements.forEach(el => existingTileElements.set(el.dataset.id, el));

        // Iterate through the logical board state
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const tileData = board[r][c];
                if (tileData) {
                    tilesOnBoardData.set(tileData.id.toString(), tileData);
                    let tileElement = existingTileElements.get(tileData.id.toString());

                    if (!tileElement) {
                        // This is a new tile - create it
                        createTileElement(tileData);
                        tileElement = boardElement.querySelector(`.tile[data-id="${tileData.id}"]`);
                        if (!tileElement) {
                            console.error("Failed to create or find tile element for:", tileData);
                            continue; // Skip if element creation failed
                        }
                    }

                    // --- Update Existing or Newly Found Element ---
                    // Update position based on tileData's r, c
                    positionTile(tileElement, tileData.r, tileData.c);

                    // Update value and display
                    const currentValue = parseInt(tileElement.dataset.value);
                    if (currentValue !== tileData.value) {
                        tileElement.dataset.value = tileData.value;
                        tileElement.textContent = tileData.special === SPECIAL_TILES.WILDCARD ? '★' : tileData.value;
                    }

                    // Update color - ensure this works on all devices
                    const newColorClass = `color-${tileData.color}`;
                    
                    // Remove all color classes first
                    tileElement.classList.remove('color-red', 'color-blue');
                    
                    // Add the correct color class
                    tileElement.classList.add(newColorClass);

                    // Update special status
                    tileElement.classList.remove(SPECIAL_TILES.WILDCARD, SPECIAL_TILES.CONVERTER);
                    if (tileData.special) {
                        tileElement.classList.add(tileData.special);
                        if (tileData.special === SPECIAL_TILES.WILDCARD) {
                            tileElement.textContent = '★';
                        }
                    }
                }
            }
        }

        // Remove tiles that are no longer in the board
        existingTileElements.forEach((tileElement, id) => {
            if (!tilesOnBoardData.has(id)) {
                // Clean removal with animation
                tileElement.style.transform = 'scale(0)';
                tileElement.style.opacity = '0';
                
                setTimeout(() => {
                    if (tileElement.parentElement) {
                        boardElement.removeChild(tileElement);
                    }
                }, 200);
            }
        });
    }

    function checkGameOver() {
        // Check for empty cells
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!board[r][c]) {
                    return false; // Found an empty cell
                }
            }
        }

        // Check for possible merges horizontally and vertically
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const currentTile = board[r][c];
                // Check right neighbor
                if (c < gridSize - 1) {
                    const rightTile = board[r][c + 1];
                    if (canMerge(currentTile, rightTile)) {
                        return false;
                    }
                }
                // Check bottom neighbor
                if (r < gridSize - 1) {
                    const bottomTile = board[r + 1][c];
                    if (canMerge(currentTile, bottomTile)) {
                        return false;
                    }
                }
            }
        }

        return true; // No empty cells and no possible merges
    }

    function canMerge(tile1, tile2) {
         if (!tile1 || !tile2) return false;
         // Prevent merging if either tile was already part of a merge in this move cycle
         if (tile1.merged || tile2.merged) return false;

         const isWildcard1 = tile1.special === SPECIAL_TILES.WILDCARD;
         const isWildcard2 = tile2.special === SPECIAL_TILES.WILDCARD;

         // Wildcard merging rules: Only need same value
         if (isWildcard1 || isWildcard2) {
             return tile1.value === tile2.value;
         }

         // Standard merge rule: Need same value AND same color
         return tile1.value === tile2.value && tile1.color === tile2.color;
    }

    function endGame() {
        isGameOver = true;
        finalScoreElement.textContent = score;
        gameOverMessageElement.style.display = 'flex'; // Show the message
    }

    function restartGame() {
        score = 0;
        comboMultiplier = 1;
        colorChangeMoves = 5; // Reset moves
        isGameOver = false;
        gameOverMessageElement.style.display = 'none'; // Hide message
        updateScore(0); // Resets score to 0 visually
        updateCombo(true);
        updateMovesLeft();
        initBoard();
        // Add more initial tiles for 6x6 board
        addRandomTile();
        addRandomTile();
        addRandomTile();
        addRandomTile();
        updateBoardVisuals(); // Make sure the board is visually correct
    }

    // --- Input Handling ---
    function handleKeyPress(e) {
        console.log('Key pressed:', e.key);
        if (isGameOver) return;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                move('up');
                break;
            case 'ArrowDown':
            case 's':
                move('down');
                break;
            case 'ArrowLeft':
            case 'a':
                move('left');
                break;
            case 'ArrowRight':
            case 'd':
                move('right');
                break;
        }
    }

    // Basic Touch Handling
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    boardElement.addEventListener('touchstart', (e) => {
        if (isGameOver) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true }); // Use passive for performance

    boardElement.addEventListener('touchend', (e) => {
        if (isGameOver) return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        const minSwipeDistance = 50; // Minimum distance for a swipe

        if (Math.max(absDeltaX, absDeltaY) > minSwipeDistance) { // It's a swipe
            // Determine direction: prioritize the larger movement axis
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    move('right');
                } else {
                    move('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    move('down');
                } else {
                    move('up');
                }
            }
        }
    }

    // --- Color Changing (Now functional but basic UI) ---
    // Modified the button listeners slightly to directly call the logic

    // --- Event Listeners ---
    document.addEventListener('keydown', handleKeyPress);
    restartButton.addEventListener('click', restartGame);

    changeRowBtn.addEventListener('click', () => {
        if (colorChangeMoves <= 0 || isGameOver) {
            alert('No color change moves left or game over!');
            return;
        }
        const row = prompt(`Enter row number to change color (1-6). Moves left: ${colorChangeMoves}`);
        const rowIndex = parseInt(row) - 1; // Convert from 1-based (UI) to 0-based (internal)
        if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < gridSize) {
            let changed = false;
            for(let c = 0; c < gridSize; c++) {
                if (board[rowIndex][c]) {
                    // Flip color: red -> blue, blue -> red
                    board[rowIndex][c].color = (board[rowIndex][c].color === 'red') ? 'blue' : 'red';
                    changed = true;
                }
            }
            if (changed) {
                colorChangeMoves--;
                updateMovesLeft();
                updateBoardVisuals(); // Update display immediately
            } else {
                alert('Row is empty, no change made.');
            }
        } else {
            alert('Invalid row number. Please enter a number between 1 and 6.');
        }
    });

    changeColBtn.addEventListener('click', () => {
        if (colorChangeMoves <= 0 || isGameOver) {
            alert('No color change moves left or game over!');
            return;
        }
        const col = prompt(`Enter column number to change color (1-6). Moves left: ${colorChangeMoves}`);
        const colIndex = parseInt(col) - 1; // Convert from 1-based (UI) to 0-based (internal)
        if (!isNaN(colIndex) && colIndex >= 0 && colIndex < gridSize) {
            let changed = false;
            for(let r = 0; r < gridSize; r++) {
                if (board[r][colIndex]) {
                     board[r][colIndex].color = (board[r][colIndex].color === 'red') ? 'blue' : 'red';
                     changed = true;
                }
            }
            if(changed) {
                colorChangeMoves--;
                updateMovesLeft();
                updateBoardVisuals();
            } else {
                alert('Column is empty, no change made.');
            }
        } else {
            alert('Invalid column number. Please enter a number between 1 and 6.');
        }
    });

    // --- Game Start ---
    function startGame() {
        console.log('Starting game...'); // Debugging log
        score = 0;
        comboMultiplier = 1;
        colorChangeMoves = 5; 
        isGameOver = false;
        
        // Reset UI
        scoreElement.textContent = '0';
        comboMultiplierElement.textContent = '1';
        updateMovesLeft();
        gameOverMessageElement.style.display = 'none';
        
        // Initialize board
        initBoard();
        
        // Add initial tiles (more for 6x6 board)
        addRandomTile();
        addRandomTile();
        addRandomTile();
        addRandomTile(); // Added 2 more tiles for 6x6
        
        // Give a slight delay to ensure board visuals are properly updated
        setTimeout(() => {
            updateBoardVisuals();
        }, 100);
        
        // Set up language toggle
        document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    }
    
    // Handle window resize to reposition tiles correctly
    window.addEventListener('resize', () => {
        // Debounce resize event to avoid too many calls
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            console.log('Window resized, updating board visuals');
            updateBoardVisuals();
            
            // Force reposition of all tiles after resize
            const allTiles = document.querySelectorAll('.tile');
            allTiles.forEach(tile => {
                const tileData = getTileDataById(tile.dataset.id);
                if (tileData) {
                    positionTile(tile, tileData.r, tileData.c);
                }
            });
        }, 250);
    });

    // Helper to find tile data by id
    function getTileDataById(id) {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (board[r][c] && board[r][c].id.toString() === id) {
                    return board[r][c];
                }
            }
        }
        return null;
    }

    // Modal functionality
    const modal = document.getElementById('instructions-modal');
    const infoBtn = document.getElementById('info-btn');
    const closeBtn = document.querySelector('.close-button');

    // Show modal when info button is clicked
    infoBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Call startGame to initialize everything
    startGame();
}); 