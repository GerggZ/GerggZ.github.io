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
const colors = ["", "#787C7E", "#C6B451", "#71AA61"];

let wordle; // Declare wordle variable globally

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g); // Get all numeric values (e.g., ["120", "124", "126"])
    return result ? `#${((1 << 24) | (parseInt(result[0]) << 16) | (parseInt(result[1]) << 8) | parseInt(result[2])).toString(16).slice(1).toUpperCase()}` : rgb;
}

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

        // Call backend after updating color
        sendBoardToServer();
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
        const cell = row.children[currentGuess.length];

        if (letter === " ") {
            cell.textContent = "⎵"; // Space character
            cell.dataset.colorIndex = 0; // Reset color index
            cell.style.backgroundColor = ""; // Keep default black text
        } else {
            currentGuess += letter;
            cell.textContent = letter;
            cell.dataset.colorIndex = 0; // Default gray index
            cell.style.backgroundColor = ""; // Keep default black text
        }

        animateCell(cell);
    }
}

document.addEventListener('keydown', async (event) => {
    const key = event.key;

    if (key === 'Backspace') {

        if (currentGuess.length == 0 && currentRow > 0) {
            // Move back to the previous row
            currentRow--;
            // Extract the guess from the previous row and set to current guess
            const prevRow = board.children[currentRow];
            currentGuess = Array.from(prevRow.children)
                .map(cell => cell.textContent.trim())
                .join("");
        }
        if (currentGuess.length > 0) {
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
        }
    } else if (key === 'Enter' && currentGuess.length === cols) {
        const currentWord = currentGuess.toLowerCase();

        // Call async function and wait for boolean response
        const isValidWord = await checkIfWordIsViable(currentWord);

        if (!isValidWord) {
            // the word returned isn't a valid word!
            animateInvalidRow(board.children[currentRow]);
            return;
        }
        // Handle Enter -> Only should work if word is complete
        if (currentGuess.length === cols && !currentGuess.includes('⎵')) {
            // Get something? I don't quite know what
            const { words, feedback } = getWordAndFeedback();

            // Call submit_guess_data on the WordleLogic instance
            if (wordle) {
                // Submit current word info
                const result = wordle.submit_guess_data(words, feedback);

                // Optionally update the UI with the suggested guess and possible words left
                document.getElementById("best-guess").textContent = `Suggested Guess: ${result.word}`;
                document.getElementById("words-left").textContent = `Possible Words Left: ${result.possible_words_left}`;
            }

            // Animate row and move to the next one
            animateRow(board.children[currentRow]);

            // Increment the current row and reset the guess
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

            if (key === ' ') {
                cell.dataset.colorIndex = 0; // Keep default color index
                cell.style.backgroundColor = ''; // Keep black color
            } else {
                cell.dataset.colorIndex = 0;
                cell.style.backgroundColor = colors[0]; // Gray for letters
            }

            animateCell(cell);

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

function getWordAndFeedback() {
    let words = [];
    let feedbackColorsList = [];

    // Loop through all rows filled out so far (including the current row)
    for (let rowIndex = 0; rowIndex <= currentRow; rowIndex++) { // Include currentRow
        const row = board.children[rowIndex];
        let word = "";
        let feedbackColors = [];

        for (let i = 0; i < cols; i++) {
            const cell = row.children[i];
            word += cell.textContent.trim() || " ";

            // Convert background color to "gray", "yellow", or "green"
            const color = getColorName(cell.style.backgroundColor);
            feedbackColors.push(color);
        }

        words.push(word);
        feedbackColorsList.push(feedbackColors);
    }

    return { words: words, feedback: feedbackColorsList }; // Return all words and colors for all rows
}

function getColorName(color) {
    const hexColor = rgbToHex(color); // Convert RGB to HEX

    if (hexColor === colors[1]) return "gray";
    if (hexColor === colors[2]) return "yellow";
    if (hexColor === colors[3]) return "green";
    return "error"; // Default to gray
}

function sendBoardToServer() {
    const { words, feedback } = collectBoardState(); // ✅ Get the latest board state

    // Ensure all letters are lowercase and spaces are kept intact
    const formattedWords = words.map(word =>
        word.split('').map(char => char === '⎵' ? ' ' : char.toLowerCase()).join('')
    );

    fetch("http://127.0.0.1:8080/possible_words", {  // Update when deploying
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words, feedback, currentRow })
    })
    .then(response => response.json())
    .then(data => {
        updatePossibleWords(data.possible_words_left);
    })
    .catch(error => console.error("Error:", error));
}

function collectBoardState() {
    let words = [];
    let feedback = [];

    for (let i = 0; i < rows; i++) {
        let word = "";
        let rowFeedback = [];

        for (let j = 0; j < cols; j++) {
            const cell = board.children[i].children[j];
            let letter = cell.textContent.trim() || " ";  // Get letter
            letter = letter === '⎵' ? '⎵' : letter.toLowerCase(); // Convert to lowercase if not a space
            word += letter;

            let color = getColorName(cell.style.backgroundColor);  // Get color
            rowFeedback.push(color);
        }

        words.push(word);
        feedback.push(rowFeedback);
    }

    return { words, feedback };  // No extra dictionary, just words & feedback
}


async function checkIfWordIsViable(word) {
    try {
        const response = await fetch("http://127.0.0.1:8080/check_word_viability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word })
        });
        const data = await response.json();

        return data.valid; // Expecting { "valid": true/false }
    } catch (error) {
        console.error("Error checking word viability:", error);
        return false; // If an error occurs, assume invalid word
    }
}


function updatePossibleWords(possibleWords) {
    document.getElementById("current-words-left").textContent =
        `${possibleWords}`;
}

function animateInvalidRow(row) {
    const invalidColor = "#B55450"; // Muted deep red for invalid words

    // Save original colors of each tile
    const originalColors = [];
    for (let i = 0; i < row.children.length; i++) {
        originalColors.push(row.children[i].style.backgroundColor);
        row.children[i].style.backgroundColor = invalidColor; // Apply red temporarily
    }

    row.style.transition = "transform 0.15s ease";

    // First flash
    row.style.transform = "scale(1.1)";
    setTimeout(() => {
        row.style.transform = "scale(1)";
    }, 120);

    // Second flash
    setTimeout(() => {
        row.style.transform = "scale(1.1)";
    }, 240);

    // Restore original tile colors after flashing
    setTimeout(() => {
        row.style.transform = "scale(1)";
        for (let i = 0; i < row.children.length; i++) {
            row.children[i].style.backgroundColor = originalColors[i]; // Restore color
        }
    }, 360);
}


function togglePanel() {
    const panel = document.getElementById('analysis');
    const button = document.querySelector('.toggle-button');

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        button.classList.remove('rotate');
    } else {
        panel.classList.add('hidden');
        button.classList.add('rotate');
    }
}

// Base URL of your FastAPI server
const BASE_URL = "http://127.0.0.1:8000";  // Update if deployed

// Fetch Optimal Guess
async function fetchOptimalGuess() {
    console.log('fetching best guess')
    const response = await fetch("http://127.0.0.1:8080/generate-optimal-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();  // Parse response
    console.log(data)

    document.getElementById("best-guess").innerText = data.word.toUpperCase() || "Error";  // Update UI
}

// Toggle Hard Core Mode
async function toggleHardCoreMode() {
    await fetch("http://127.0.0.1:8080/toggle-hardcore-mode", {
        method: "POST"
    })
    console.log("Hard Core Mode toggled");
}

// Fetch Random Viable Guess
async function fetchRandomViableGuess() {
    console.log('fetching best guess')
    const response = await fetch("http://127.0.0.1:8080/random-viable-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    console.log(data)
    document.getElementById("best-guess").innerText = data.word.toUpperCase() || "Error";
}

// Fetch Random Word
async function fetchRandomWord() {
    const response = await fetch("http://127.0.0.1:8080/random-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    document.getElementById("best-guess").innerText = data.word.toUpperCase() || "Error";
}

// Clear the suggested guess box (No API call needed)
function clearGuess() {
    document.getElementById("best-guess").innerText = "---";
}

createBoard();
createKeyboard();
