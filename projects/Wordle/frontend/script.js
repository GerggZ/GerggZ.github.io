const board = document.getElementById('wordle-board');
const keyboard = document.getElementById('keyboard');
const rows = 6;
const cols = 5;
let currentRow = 0;
let currentGuess = "";
const keyRows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["Enter", ..."ZXCVBNM".split(""), "Backspace"],
    ["Space"]
];
const activeKeys = new Set();
const colors = ["#787C7E", "#C6B451", "#71AA61"];

function createBoard() {
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('div');
        row.classList.add('wordle-row');
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('wordle-cell');
            cell.dataset.colorIndex = 0;
            cell.addEventListener('click', () => cycleColor(cell));
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function createKeyboard() {
    keyboard.classList.add('keyboard-container');
    keyRows.forEach(rowKeys => {
        const row = document.createElement('div');
        row.classList.add('keyboard-row');
        rowKeys.forEach(letter => {
            const key = document.createElement('div');
            key.classList.add('key');
            key.textContent = letter === "Enter" ? "⏎" : letter === "Backspace" ? "⌫" : letter === "Space" ? "⎵" : letter;
            if (letter === "Space") key.classList.add('space-bar');
            key.addEventListener('mousedown', () => handleKeyDown(letter, key));
            key.addEventListener('mouseup', () => handleKeyUp(letter, key));
            key.addEventListener('mouseleave', () => handleKeyUp(letter, key));
            row.appendChild(key);
        });
        keyboard.appendChild(row);
    });
}

function cycleColor(cell) {
    const content = cell.textContent.trim();
    const isLetter = /^[A-Z]$/.test(content); // Check if the content is a single letter

    if (isLetter) {
        // Cycle through colors if the cell contains a letter
        let colorIndex = parseInt(cell.dataset.colorIndex, 10);
        colorIndex = (colorIndex + 1) % colors.length;
        cell.dataset.colorIndex = colorIndex;
        cell.style.backgroundColor = colors[colorIndex];
    } else {
        // Reset to default color if the cell is empty or contains a space
        cell.dataset.colorIndex = 0;
        cell.style.backgroundColor = ''; // Assumes default background is set via CSS
    }
}


function handleKeyDown(letter, keyElement) {
    if (currentRow >= rows || activeKeys.has(letter)) return;
    activeKeys.add(letter);
    keyElement.classList.add('active');
    handleInput(letter);
}

function handleKeyUp(letter, keyElement) {
    activeKeys.delete(letter);
    keyElement.classList.remove('active');
}

function handleInput(letter) {
    if (currentRow >= rows) return;
    const row = board.children[currentRow];
    if (currentGuess.length < cols) {
        currentGuess += letter;
        const cell = row.children[currentGuess.length - 1];
        cell.textContent = letter;
        animateCell(cell);
    }
}

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'Backspace' && currentGuess.length > 0) {
        // Handle Backspace
        // Get the row and cell that needs to be cleared
        const row = board.children[currentRow];
        const cellIndex = currentGuess.length - 1;
        const cell = row.children[cellIndex];

        // Update guess string FIRST
        currentGuess = currentGuess.slice(0, -1);

        // Clear the letter in the cell
        cell.textContent = "";

        // Reset the color only if the cell is empty
        cell.dataset.colorIndex = 0;
        cell.style.backgroundColor = ''; // Assumes default background from CSS

    } else if (key === 'Enter' && currentGuess.length === cols) {
        // Handle Enter
        if (currentGuess.length === cols && !currentGuess.includes('⎵')) {
            // Only proceed if the guess is complete and contains no spaces
            animateRow(board.children[currentRow]);
            currentRow++;
            currentGuess = "";
        }
    } else if (key === ' ' || /^[a-zA-Z]$/.test(key)) {
        // Handle Spacebar and letter keys
        event.preventDefault(); // Prevent default behavior for Spacebar
        if (currentGuess.length < cols) {
            const symbol = key === ' ' ? '⎵' : key.toUpperCase();
            currentGuess += symbol;
            const cell = board.children[currentRow].children[currentGuess.length - 1];
            cell.textContent = symbol;
            animateCell(cell);

            // Set the background color to gray (default)
            cell.dataset.colorIndex = 0;  // Gray color index
            cell.style.backgroundColor = colors[0]; // Gray color
        }
    }
});

function animateCell(cell) {
    cell.style.transform = "scale(1.2)";
    setTimeout(() => {
        cell.style.transform = "scale(1)";
    }, 150);
}

function animateRow(row) {
    row.style.transform = "scale(1.1)";
    setTimeout(() => {
        row.style.transform = "scale(1)";
    }, 150);
}

document.addEventListener('keyup', (event) => {
    let key = event.key.toUpperCase();
    activeKeys.delete(key);

    document.querySelectorAll('.key').forEach(keyElement => {
        if (keyElement.textContent === key || keyElement.textContent === "⏎" || keyElement.textContent === "⌫") {
            keyElement.classList.remove('active');
        }
    });
});

createBoard();
createKeyboard();
