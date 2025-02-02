// Constants
const BOARD_ROWS = 6;
const BOARD_COLS = 5;
const FLASH_SPEED = 200; // Animation speed per step
const CONTENT_DISPLAY_DURATION = 500; // how long to display text
const COLOR_MAP = {
    gray: "#787C7E",
    yellow: "#C6B451",
    green: "#71AA61"
};

// Hardcoded Word List and Feedback List
const wordsList = ["HAPPY", "WORDL", "    I", "    N", "    G", "    !"];
const feedbackList = [
    ["green", "green", "green", "green", "green"],
    ["gray", "gray", "gray", "gray", "gray"],
    ["", "", "", "", "yellow"],
    ["", "", "", "", "yellow"],
    ["", "", "", "", "yellow"],
    ["", "", "", "", "yellow"]
];

// Generate blank word list (all spaces)
const blankWordsList = wordsList.map(word => " ".repeat(word.length));

// Ensure animation runs after board is created
window.addEventListener("load", async () => {
    console.log("Waiting for board to be created...");
    await waitForBoardCreation();
    await playWordleAnimation(); // Runs once, then exits
});

/**
 * Waits until the board is fully created before running animations.
 */
async function waitForBoardCreation() {
    while (!board || board.children.length < wordsList.length) {
        await sleep(100); // Check every 100ms
    }
    console.log("Board is ready!");
}

/**
 * Plays a Wordle-style animation with fade-in and fade-out effects (ONCE).
 */
async function playWordleAnimation() {
    console.log("Starting Wordle animation...");

    // Reset board
    clearBoard();

    // Step 1: Show the words with animation
    await animateRevealLetters(wordsList, feedbackList);

    // Step 2: Wait before erasing
    await sleep(CONTENT_DISPLAY_DURATION);

    // Step 3: Erase letters in the same order they were added
    await animateEraseLetters();

    console.log("Animation complete! Transitioning to game...");

    document.dispatchEvent(new Event("animationsFinished"));

}

/**
 * Slowly reveals letters while animating them.
 */
async function animateRevealLetters(wordSet, colorSet) {
    for (let rowIdx = 0; rowIdx < wordSet.length; rowIdx++) {
        const row = board.children[rowIdx];
        if (!row) continue; // Ensure row exists

        const word = wordSet[rowIdx];
        const feedback = colorSet[rowIdx];

        for (let colIdx = 0; colIdx < word.length; colIdx++) {
            const cell = row.children[colIdx];
            if (!cell) continue; // Ensure cell exists

            if (word[colIdx] !== "" && word[colIdx] !== " ") {
                cell.textContent = word[colIdx];  // Set letter
                cell.style.backgroundColor = COLOR_MAP[feedback[colIdx]];  // Set color
                animateCell(cell);
                await sleep(FLASH_SPEED);
            }
        }
    }
}

/**
 * Erases letters in the same order they were added (top-down, left-to-right).
 */
async function animateEraseLetters() {
    for (let rowIdx = 0; rowIdx < wordsList.length; rowIdx++) { // Normal order
        const row = board.children[rowIdx];
        if (!row) continue; // Ensure row exists

        for (let colIdx = 0; colIdx < wordsList[rowIdx].length; colIdx++) { // Normal order
            const cell = row.children[colIdx];
            if (!cell) continue; // Ensure cell exists
            if (cell.textContent !== "") {
                cell.textContent = "";  // Remove letter
                cell.style.backgroundColor = "";  // Fully reset color
                animateCell(cell);  // Apply animation before removal
                await sleep(FLASH_SPEED);
            }
        }
    }
}

/**
 * Helper function to clear the board.
 */
function clearBoard() {
    for (let i = 0; i < BOARD_ROWS; i++) {
        const row = board.children[i];
        if (!row) continue; // Ensure row exists
        for (let j = 0; j < BOARD_COLS; j++) {
            const cell = row.children[j];
            if (!cell) continue; // Ensure cell exists
            cell.textContent = "";
            cell.style.backgroundColor = ""; // Fully reset color
            cell.style.opacity = "1"; // Reset visibility
        }
    }
}


/**
 * Sleep Helper Function (Pauses execution for a duration).
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
