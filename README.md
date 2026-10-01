# 🎮 Game Hub

A small mobile-friendly game hub built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies.

It contains two games:

- **🧩 Sudoku**: 100 levels (Beginner and Intermediate) with answer sheets
- **🍓 Tile Match**: tap tiles into a tray, match 3 to clear them, empty the pile to win

## Features

### Sudoku
- 100 levels: 60 Beginner and 40 Intermediate, mixed together
- Every puzzle has exactly one solution. Beginner puzzles can be solved with simple "only one possibility" logic
- Number pad, keyboard input, pencil notes, erase and hints
- Live highlighting of conflicts and matching numbers
- Timer starts only when you first click a box, enter a number or use a hint
- **Pause** button (the board is hidden while paused). The timer also auto-pauses if you leave the Sudoku screen
- Completed levels are saved: reopening one shows your finished board and best time
- **Replay** button to solve a completed level again (best time is kept)
- **Levels** tab to jump to any level (✓ marks solved ones)
- **Answers** tab with the full solution for every level, filterable by difficulty

### Tile Match
- Layered tile piles: a tile can only be tapped if nothing is on top of it
- 7-slot tray: 3 matching tiles are cleared, and the game is lost if the tray fills up
- Power-ups per level: 2 × Undo, 1 × Shuffle, 1 × Move out (returns the first 3 tray tiles to the board)
- Unlimited levels with rising difficulty:

| Levels | Tiles | Fruit types |
|---|---|---|
| 1–10 | 21 rising to 60 | 4 rising to 12 |
| 11–20 | 63 rising to 90 | 12 |
| 21–30 | 96 rising to 150 | 12 |
| 31–40 | 156 rising to 210 | 12 |
| 41–50 | 219 rising to 300 | 12 |
| 51 onwards | 450 | 12 |

The board grid grows with the tile count, so tiles get smaller on later levels.

## Run locally

Keep all files in the same folder, then either:

- double-click `index.html`, or
- use the **Live Server** extension in VS Code, or
- run a local server, e.g. `npx serve` or `python3 -m http.server`, and open the address it prints.

## Deploy to GitHub Pages

1. Create a new public repository on GitHub.
2. Upload all five files (`index.html`, `style.css`, `sudoku.js`, `tile.js`, `hub.js`) to the root of the repo.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute or two the game is live at `https://<your-username>.github.io/<repo-name>/`.

> **Note:** GitHub Pages file names are case-sensitive. Use exactly the lowercase names above, otherwise a file that works on your computer may fail to load online.

Players can add the page to their phone's home screen (Share → *Add to Home Screen* on iPhone, ⋮ → *Add to Home screen* on Android).

## Project structure

| File | Purpose |
|---|---|
| `index.html` | Page structure for the hub, Sudoku and Tile Match screens |
| `style.css` | All styling, including automatic dark mode |
| `sudoku.js` | Sudoku generator, solver, game UI, level list and answer sheets |
| `tile.js` | Tile Match game (self-contained) |
| `hub.js` | Switching between games and the progress counters on the home screen |

Scripts are loaded in this order at the bottom of `index.html`: `sudoku.js`, `tile.js`, `hub.js`.

## How it works

- **Sudoku puzzles are generated in the browser** from the level number, so the same level is always the same puzzle. A solved grid is shuffled, then clues are removed one by one while checking the puzzle still has a single solution.
- **Tile Match layouts are generated from the level number** too, so retrying a level gives the same layout. Layouts are random, so some high levels may be very hard or unwinnable. Use Shuffle or Restart.
- **Progress is saved in the browser** using `localStorage` (keys `sdk100` for Sudoku and `tile1` for Tile Match). It stays on that device and browser, and is lost if the player clears site data or uses private mode.

## Customising

- **Tile Match difficulty:** edit the `AN` array and `size()` function at the top of `tile.js` (tile counts per level), and the `kinds` and grid-size lines in `begin()`.
- **Sudoku difficulty:** in `gen()` in `sudoku.js`, change `target` (number of clues kept) and the `isBeg()` rule that decides which levels are Beginner.
- **Fruit icons:** edit the `E` array in `tile.js`.
- **Colours:** edit the CSS variables at the top of `style.css`.
