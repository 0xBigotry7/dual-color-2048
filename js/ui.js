/**
 * UI Management
 * Handles UI updates, animations, and translations
 */
import { getScore, getComboMultiplier, getCurrentLanguage, toggleLanguage as toggleStateLanguage } from './state.js';

// Translation data
const translations = {
    'en': {
        'title': 'Dual-Color 2048 (6x6)',
        'new-game': 'New Game',
        'score': 'Score',
        'combo': 'Combo',
        'color-changes': 'Color Changes',
        'instructions-title': 'How to Play',
        'instructions-1': 'Use arrow keys or swipe to move tiles.',
        'instructions-2': 'Merge same-value, same-color tiles to create larger values.',
        'instructions-3': 'Special red-blue wildcards can merge with any color of the same value.',
        'instructions-4': 'Special converter tiles (⟳) will flip the color of adjacent tiles when merged.',
        'instructions-5': 'Click row/column numbers or press number keys (hold Shift for columns) to change tile colors.',
        'instructions-6': 'Tiles 32 and 256 change color when created!',
        'close': 'Close',
        'game-over': 'Game Over!',
        'final-score': 'Final Score',
        'try-again': 'Try Again'
    },
    'zh': {
        'title': '双色2048 (6x6)',
        'new-game': '新游戏',
        'score': '分数',
        'combo': '连击',
        'color-changes': '颜色变换',
        'instructions-title': '游戏规则',
        'instructions-1': '使用方向键或滑动移动方块。',
        'instructions-2': '合并相同数值和颜色的方块以创建更大的数值。',
        'instructions-3': '特殊的红蓝万能方块可以与相同数值的任何颜色方块合并。',
        'instructions-4': '特殊转换方块 (⟳) 合并时会翻转相邻方块的颜色。',
        'instructions-5': '点击行/列数字或按数字键(按住Shift键为列)来改变方块颜色。',
        'instructions-6': '32和256的方块在创建时会改变颜色！',
        'close': '关闭',
        'game-over': '游戏结束！',
        'final-score': '最终得分',
        'try-again': '再试一次'
    }
};

// Toast message queue and timers
let toastQueue = [];
let toastTimer = null;

/**
 * Initialize UI
 */
export function initUI() {
    // Initialize UI elements and listeners
    document.getElementById('instructions-button').addEventListener('click', showInstructions);
    document.getElementById('close-instructions').addEventListener('click', hideInstructions);
    document.getElementById('try-again-button').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('game:restart'));
    });
    
    // Set up event listeners for UI events
    document.addEventListener('ui:toggleLanguage', handleToggleLanguage);
    document.addEventListener('ui:updateScore', updateScoreDisplay);
    document.addEventListener('ui:updateCombo', updateComboDisplay);
    document.addEventListener('ui:resetCombo', resetComboDisplay);
    document.addEventListener('ui:updateColorChanges', updateColorChangesDisplay);
    document.addEventListener('ui:showToast', (event) => showToast(event.detail.message));
    document.addEventListener('ui:gameOver', showGameOver);
    
    // Initial UI update
    updateUI();
}

/**
 * Update all UI elements
 */
export function updateUI() {
    applyTranslations();
    updateScoreDisplay();
    updateComboDisplay();
    updateColorChangesDisplay();
}

/**
 * Apply translations based on current language
 */
function applyTranslations() {
    const lang = getCurrentLanguage();
    const texts = translations[lang];
    
    // Apply translations to all elements with a data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });
    
    // Update language toggle button
    document.getElementById('language-toggle').textContent = lang === 'en' ? '中文' : 'English';
}

/**
 * Handle language toggle
 */
function handleToggleLanguage() {
    toggleStateLanguage();
    applyTranslations();
}

/**
 * Update score display
 */
function updateScoreDisplay() {
    document.getElementById('score-value').textContent = getScore();
}

/**
 * Update combo multiplier display
 */
function updateComboDisplay() {
    const combo = getComboMultiplier();
    const comboDisplay = document.getElementById('combo-value');
    comboDisplay.textContent = `${combo}x`;
    
    // Add animation
    comboDisplay.classList.remove('pulse');
    // Trigger reflow to restart the animation
    void comboDisplay.offsetWidth;
    comboDisplay.classList.add('pulse');
}

/**
 * Reset combo display
 */
function resetComboDisplay() {
    document.getElementById('combo-value').textContent = '1x';
    document.getElementById('combo-value').classList.remove('pulse');
}

/**
 * Update color changes display
 * @param {number} changes - Number of color changes remaining
 */
export function updateColorChangesDisplay(changes) {
    document.getElementById('color-changes-value').textContent = changes;
}

/**
 * Show instructions modal
 */
function showInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
}

/**
 * Hide instructions modal
 */
function hideInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

/**
 * Show game over modal
 */
function showGameOver() {
    const modal = document.getElementById('game-over-modal');
    document.getElementById('final-score').textContent = getScore();
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
}

/**
 * Hide game over modal
 */
export function hideGameOver() {
    const modal = document.getElementById('game-over-modal');
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

/**
 * Show toast message
 * @param {string} message - Message to display
 */
function showToast(message) {
    // Add to queue
    toastQueue.push(message);
    
    // If no active toast, show the next one
    if (!toastTimer) {
        processNextToast();
    }
}

/**
 * Process the next toast in the queue
 */
function processNextToast() {
    if (toastQueue.length === 0) {
        toastTimer = null;
        return;
    }
    
    const message = toastQueue.shift();
    const toast = document.getElementById('toast');
    
    toast.textContent = message;
    toast.classList.add('visible');
    
    // Set timer to hide toast after 2 seconds
    toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
        
        // Set timer to process next toast after animation completes
        setTimeout(() => {
            processNextToast();
        }, 300);
    }, 2000);
}

/**
 * Update board visuals (tiles and styling)
 */
export function updateBoardVisuals() {
    // Update all tile positions and styles
    document.querySelectorAll('.tile').forEach(tileElement => {
        const row = parseInt(tileElement.dataset.row);
        const col = parseInt(tileElement.dataset.col);
        
        // Position the tile
        positionTileElement(tileElement, row, col);
    });
    
    // Update row and column buttons status
    updateRowColumnButtons();
}

/**
 * Position a tile element on the board
 * @param {HTMLElement} tileElement - Tile element to position
 * @param {number} row - Row index
 * @param {number} col - Column index
 */
function positionTileElement(tileElement, row, col) {
    const gridSize = 6;
    const cellWidth = (100 / gridSize);
    const tileValue = parseInt(tileElement.dataset.value);
    
    // Set the position using percentages for stability
    tileElement.style.top = `${row * cellWidth}%`;
    tileElement.style.left = `${col * cellWidth}%`;
    tileElement.style.width = `${cellWidth}%`;
    tileElement.style.height = `${cellWidth}%`;
    
    // Update font size based on value
    updateTileFontSize(tileElement, tileValue);
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

/**
 * Update row and column buttons status
 */
function updateRowColumnButtons() {
    const colorChanges = document.getElementById('color-changes-value').textContent;
    const isDisabled = parseInt(colorChanges) <= 0;
    
    // Update row buttons
    for (let r = 1; r <= 6; r++) {
        const rowBtn = document.getElementById(`row-${r}`);
        if (rowBtn) {
            rowBtn.disabled = isDisabled;
            rowBtn.classList.toggle('disabled', isDisabled);
        }
    }
    
    // Update column buttons
    for (let c = 1; c <= 6; c++) {
        const colBtn = document.getElementById(`col-${c}`);
        if (colBtn) {
            colBtn.disabled = isDisabled;
            colBtn.classList.toggle('disabled', isDisabled);
        }
    }
} 