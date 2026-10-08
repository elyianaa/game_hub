# 🎮 Game Hub

A small mobile-friendly game hub built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies.

It contains two games:

- **🧩 Sudoku**: 200 levels (Beginner and Intermediate) with answer sheets
- **🍓 Tile Match**: tap tiles into a tray, match 3 to clear them, empty the pile to win

## Features

### Sudoku
- 200 levels: 120 Beginner and 80 Intermediate, shuffled in a fixed random order
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
- A random mix of scattered tiles, half-overlapping tiles and exact stacks, arranged inside a shape that changes every level (Heart, Diamond, Triangle, Cross, Lines, Circle, Columns, and a full-board layout). A tile can only be tapped if nothing is on top of it, and clearing the top of a stack reveals the next tile underneath
- From level 26 the layout changes to a "hidden pattern" style: random tiles on top hide a small pattern of stacks, and 2–3 tall towers sit at the bottom (grey edges show how many tiles are left in a tower)
- Every level is solvable: the fruit are dealt in a valid clearing order (Shuffle can break this)
- 7-slot tray: 3 matching tiles are cleared, and the game is lost if the tray fills up
- Power-ups per level: 2 × Undo, 1 × Shuffle, 1 × Move out (sends the leftmost tray tile back to a random spot on the board)
- Unlimited levels with rising difficulty:

| Levels | Tiles | Fruit types |
|---|---|---|
| 1–10 | 21 rising to 60 | 4 rising to 12 |
| 11–20 | 63 rising to 90 | 12 |
| 21–30 | 96 rising to 150 | 12 |
| 31–40 | 156 rising to 210 | 12 |
| 41–50 | 219 rising to 300 | 12 |
| 51 onwards | 450 | 12 |

The board gets bigger on later levels, so tiles get smaller.

## Run locally

Keep all files in the same folder, then either:

- double-click `index.html`, or
- use the **Live Server** extension in VS Code, or
- run a local server, e.g. `npx serve` or `python3 -m http.server`, and open the address it prints.

## Deploy to GitHub Pages

1. Create a new public repository on GitHub.
2. Upload the six website files (`index.html`, `style.css`, `sudoku.js`, `tile.js`, `leaderboard.js`, `hub.js`) to the root of the repo.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute or two the game is live at `https://<your-username>.github.io/<repo-name>/`.

> **Note:** GitHub Pages file names are case-sensitive. Use exactly the lowercase names above, otherwise a file that works on your computer may fail to load online.

Players can add the page to their phone's home screen (Share → *Add to Home Screen* on iPhone, ⋮ → *Add to Home screen* on Android).

## Global leaderboard (optional)

The hub can show a shared ranking for all players, with **no login**: players just type a nickname. Scores are stored in a free **Google Sheet** through a small **Google Apps Script**. Without this setup the leaderboard is simply hidden and everything else works as normal.

- **Sudoku score** = number of levels solved. **Tile Match score** = highest level cleared.
- A nickname is the same ranking row on any device or browser. Only the best score is kept for each nickname.
- Saving a nickname also uploads the player's existing progress.

**Setup (about 5 minutes):**

1. Create a new Google Sheet (any name).
2. Open **Extensions → Apps Script**, delete the sample code, paste everything from `apps-script.gs`, and save.
3. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* = **Me** and *Who has access* = **Anyone**, then **Deploy**. Approve the permission prompts.
4. Copy the **Web app URL** (it ends with `/exec`).
5. Open `leaderboard.js` and paste the URL into `const API_URL = '';`.
6. Upload the updated `leaderboard.js` to GitHub. The 🏆 Leaderboard card now appears on the home screen.

If you later edit `apps-script.gs`, use **Deploy → Manage deployments → Edit → New version** so the change goes live.

**Limits:** there is no login, so anyone can type any nickname, and scores are sent from the browser, so a technically skilled person could submit fake scores. The script rejects impossible values and only lets scores go up. This is fine for a casual game, but not for prizes. The leaderboard works on GitHub Pages, but not on the claude.ai preview link.

## Project structure

| File | Purpose |
|---|---|
| `index.html` | Page structure for the hub, Sudoku and Tile Match screens |
| `style.css` | All styling, including automatic dark mode |
| `sudoku.js` | Sudoku generator, solver, game UI, level list and answer sheets |
| `tile.js` | Tile Match game (self-contained) |
| `hub.js` | Switching between games and the progress counters on the home screen |
| `leaderboard.js` | Optional global leaderboard (set `API_URL` to turn it on) |
| `apps-script.gs` | Backend code to paste into Google Apps Script. Not loaded by the website |

Scripts are loaded in this order at the bottom of `index.html`: `sudoku.js`, `tile.js`, `leaderboard.js`, `hub.js`.

## How it works

- **Sudoku puzzles are generated in the browser** from the level number, so the same level is always the same puzzle. A solved grid is shuffled, then clues are removed one by one while checking the puzzle still has a single solution.
- **Tile Match layouts are generated from the level number** too, so retrying a level gives the same layout. Levels are built so a solution always exists, but they can still be hard, so use the power-ups wisely.
- **Progress is saved in the browser** using `localStorage` (keys `sdk100` for Sudoku and `tile1` for Tile Match). It stays on that device and browser, and is lost if the player clears site data or uses private mode.

## Customising

- **Tile Match difficulty:** edit the `AN` array and `size()` function at the top of `tile.js` (tile counts per level), and the `kinds` and grid-size lines in `begin()`. Change how tiles are placed in `layout()`: the numbers `.25` and `.55` set how often a tile lands exactly on a stack, half a tile off, or at a spot far from the others. The last number in `begin()` limits how tall piles can get. The shapes are in `PATS` and `MASK`.
- **Sudoku difficulty:** in `gen()` in `sudoku.js`, change `target` (number of clues kept) and the `isBeg()` rule that decides which levels are Beginner.
- **Fruit icons:** edit the `E` array in `tile.js`.
- **Colours:** edit the CSS variables at the top of `style.css`.

## Troubleshooting: progress not saving

- **Progress is stored per device and per browser.** Sudoku levels and your Tile Match level live in that browser only. A different phone, a different browser, or the same game opened inside another app (WhatsApp, Instagram, Facebook, TikTok in-app browsers) has its own separate progress.
- **Private or blocked storage:** in private mode, or if the browser blocks site data, nothing can be saved. The home screen then shows a warning.
- **Clearing browser data** removes progress. Leaderboard scores stay, because they are kept in the Google Sheet (best score only).
- After each Tile Match win the game shows whether progress was saved and whether the leaderboard accepted the score. After a Sudoku win it warns if saving failed.
- Tell players to always open the game from the same browser (for example Chrome) and to avoid in-app browsers.
- **Two tabs or windows of the game:** progress from all of them is now merged (the highest Tile Match level and every solved Sudoku level are kept), so an older tab can no longer overwrite newer progress.
- **"Could not load the ranking":** the device cannot reach the Google Sheet (offline, VPN, school or office network, ad blocker, or the Apps Script deployment is not set to *Anyone*). Open your Web app URL followed by `?action=top&game=tile` in a browser. It should show JSON.
- **Changing the number of Sudoku levels:** also update `MAX` (`sudoku: 200`) in `apps-script.gs`, then redeploy a new version, otherwise the leaderboard rejects scores above the old limit.
