# Connect 4 Game with AI

## Overview
Connect 4 is a two-player connection game where the objective is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs.

In this version, we have implemented an AI that can play against human players.

## Features
- **Two Player Mode:** Play against another human.
- **AI Mode:** Play against a computer-controlled opponent.

## Rules
1. Players take turns dropping colored discs into a seven-column, six-row vertically suspended grid.
2. The objective is to be the first to connect four of one's own discs in a row.
3. The game ends when one player connects four discs or when the grid is full (resulting in a draw).

## How to Play
1. Choose your mode: Human vs Human or Human vs AI.
2. Select a column to drop your disc.
3. Continue until one player wins or the board is full.

## Getting Started
To get started with the Connect 4 game, clone this repository and run the main program.

```bash
// Instructions to run the game...

python -m http.server 8000
localhost:8000
```

## AI Implementation
The AI uses a heuristic approach to decide on the best move. It evaluates positions based on potential for creating a winning scenario.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.