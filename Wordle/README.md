# Wordle Game

A terminal-based implementation of the popular word-guessing game Wordle, built in C++.

## Description

Guess the 5-letter word in 6 attempts! Each guess provides colored feedback to help you find the correct word:
- 🟩 **Green** - Letter is correct and in the right position
- 🟨 **Yellow** - Letter is in the word but wrong position
- ⬜ **Gray** - Letter is not in the word

## Features

- **Live Input Display**: Letters appear in colored boxes as you type
- **Word Validation**: Only accepts valid words from the dictionary
- **Duplicate Prevention**: Won't accept the same guess twice
- **Visual Feedback**: Color-coded letters for instant feedback
- **Uppercase Display**: All letters shown in CAPS for clarity

## Requirements

- C++ compiler (g++)
- macOS or Linux terminal (uses ANSI escape codes and termios)
- Two word files:
  - `wordle-word.txt` - Possible answer words
  - `wordle-guess.txt` - Valid guess words

## Installation

1. Navigate to the Wordle directory:
```bash
cd path_to_folder/Game_C/Wordle/
```

2. Compile the game:
```bash
g++ main.cpp -o main
```

## How to Play

1. Run the game:
```bash
./main
```

2. Type a 5-letter word (letters appear in gray boxes as you type)

3. Press Enter to submit your guess

4. Observe the color feedback:
   - Green background = correct letter, correct position
   - Yellow background = correct letter, wrong position
   - Gray background = letter not in the word

5. Continue guessing until you find the word or run out of attempts (6 total)

## Game Rules

- You have **6 attempts** to guess the word
- Each guess must be a valid 5-letter word from the dictionary
- Cannot guess the same word twice
- Invalid words show a "NOT A VALID WORD!" error
- Duplicate guesses show an "ALREADY GUESSED!" error
- If you don't guess the word, it will be revealed at the end

## File Structure

```
Wordle/
├── main.cpp              # Main game source code
├── main                  # Compiled executable
├── wordle-word.txt       # Possible answer words (one per line)
├── wordle-guess.txt      # Valid guess words (one per line)
└── README.md            # This file
```

## Customization

### Adding Words

To add more words to the game:

1. **Answer words** - Add to `wordle-word.txt` (one word per line)
2. **Valid guesses** - Add to `wordle-guess.txt` (one word per line)

All words should be 5 letters long.

### Example word.txt:
```
apple
grape
peach
berry
mango
```

## Compilation and Run (One Command)

```bash
g++ main.cpp -o main && ./main
```

## Technical Details

- Uses ANSI escape codes for colors and terminal manipulation
- Uses `termios.h` for character-by-character input
- Implements real-time input display with colored boxes
- Case-insensitive word matching (displayed in uppercase)

## Tips for Playing

- Start with words that have common vowels (A, E, I, O, U)
- Use yellow letters to try different positions
- Eliminate letters shown in gray
- Pay attention to letter frequency in English

Enjoy the game! 🎮
