# main.py
import os
from starlette.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from wordle_buddy.guesser import WordleGuesser

app = FastAPI()

# Allow all origins for now (you can restrict it later to specific domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (you can specify a list of trusted origins)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

print("WordleGuesser initialized and word bank loaded.")

# Initialize a persistent instance of WordleGuesser (only runs once)
wordle_guesser = WordleGuesser(language="english")
wordle_guesser.scorer.toggle_mode(False)

print("WordleGuesser initialized and word bank loaded.")


@app.post("/check_word_viability")
async def check_word_viability(request: Request):
    # Parse and process the incoming data
    try:
        data = await request.json()  # Try to parse the JSON request body
        print('Checkin for Validity!')
        ascii_data = wordle_guesser.word_bank.encode_word(data['word'].lower())
        if np.any(np.all(wordle_guesser.word_bank.full_word_bank == ascii_data, axis=1)):
            return {"valid": True}
        return {"valid": False}

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422


def clean_board(data):
    # In-place filtering using list comprehension and enumerate
    indices_to_keep = [i for i, word in enumerate(data["words"]) if not word.isspace()]

    # Apply filtering only once per list
    data["words"] = [data["words"][i] for i in indices_to_keep]
    data["feedback"] = [data["feedback"][i] for i in indices_to_keep]

    return data


@app.post("/possible_words")
async def get_possible_words(request: Request):
    """
    Processes the current Wordle board state and returns the possible words left.
    """
    # Parse and process the incoming data
    try:
        data = await request.json()  # Try to parse the JSON request body
        data = clean_board(data)

        # Temporary fix
        data['words'] = [word.replace(" ", "⎵") for word in data['words']]
        if len(data['words']) != len(data['feedback']):
            raise ValueError("The number of guesses and feedbacks must match.")

        # Process the guess and update the word bank
        wordle_guesser.process_guesses(data['words'], data['feedback'])

        result = {'possible_words_left': str(len(wordle_guesser.word_bank.possible_word_bank))}
        return result

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422


@app.post("/generate-optimal-guess")
async def generate_optimal_guess():
    # Generating an optimal guess using the wordle solver engine
    # Parse and process the incoming data
    try:
        print(len(wordle_guesser.word_bank.possible_word_bank))

        # Get the next best guesses
        best_guesses = wordle_guesser.best_guess(1)
        print(best_guesses)
        if best_guesses:
            # convert from ascii(ish) to characters
            best_guess = [word.upper() for word in best_guesses][0]
            result = {'word': ''.join(best_guess)}
        else:
            result = {'word': "No Viable Options"}
        return result

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422


@app.post("/random-viable-guess")
async def random_viable_guess():
    # Randomly select a Viable word from the possible word bank
    try:
        random_possible_guess = "No Viable Options"
        if wordle_guesser.word_bank.possible_word_bank.size > 0:
            random_possible_guesses_row = wordle_guesser.word_bank.possible_word_bank[
                np.random.randint(wordle_guesser.word_bank.possible_word_bank.shape[0])
            ]
            random_possible_guess = wordle_guesser.word_bank.decode_word(random_possible_guesses_row)

        return {"word": random_possible_guess}

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422


@app.post("/random-guess")
async def random_word():
    # Randomly select a Viable word from the full word bank
    try:
        random_possible_guess = "No Viable Options"
        if wordle_guesser.word_bank.possible_word_bank.size > 0:
            random_possible_guesses_row = wordle_guesser.word_bank.full_word_bank[
                np.random.randint(wordle_guesser.word_bank.full_word_bank.shape[0])
            ]
            random_possible_guess = wordle_guesser.word_bank.decode_word(random_possible_guesses_row)

        return {"word": random_possible_guess}

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422


@app.post("/toggle-hardcore-mode")
async def toggle_hardcore_mode():
    # Toggle HardCore Mode
    try:
        new_mode = not wordle_guesser.scorer.hardcore_mode

        #set new mode
        wordle_guesser.scorer.toggle_mode(new_mode)

    except Exception as e:
        print(f"Error processing request: {e}")
        return {"detail": "Invalid request body"}, 422