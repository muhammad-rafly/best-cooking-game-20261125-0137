# Warung Rush — Dapur Kilat

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/muhammad-rafly/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/muhammad-rafly/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete 2D canvas cooking game: run a busy Indonesian street-food
warung. Orders land on the board, each with its own recipe and a patience
bar. Grab ingredients from the counter, cook them at the right station —
wok, grill, pot or chopping board — assemble the plate, and serve it
through the window before the customer walks away.

## How to play

- **Click an order ticket** on the board to make it active.
- **Click ingredient bins** (or keys 1–8) to take ingredients. Direct
  ingredients land on the plate at once; the rest wait on the tray.
- **Click a station** (or Q/W/E/R) to cook what is on the tray. Wrong
  station? The kitchen buzzes — check the recipe on the ticket.
- **Serve** when the plate matches the recipe: click the yellow serve
  window or press Space. Faster service earns a bigger tip.
- Orders lose patience and expire. Three failed orders close the warung.
  The shift lasts 3 minutes; new orders keep coming, faster and faster.

## Dishes

Nasi Goreng, Mie Goreng, Sate Ayam, Soto Ayam, Gado-Gado — five recipes
that combine the same eight ingredients in different ways.

## Play it

Open `game/index.html` in desktop Chrome (or serve `game/` with any
static server). No network, no build step, no assets to download — all
art is drawn in code and all sound is synthesized with WebAudio.

## Screenshots

Four real renders of the game in headless Chrome: the busy kitchen
(cover), a plate ready to serve, the end-of-shift rush, and the title
screen. Each shows the order board, the ingredient counter, the cooking
stations, the timer and the plate.

## Files

- `game/index.html` — the page and canvas
- `game/css/kitchen.css` — page styling
- `game/src/recipes.js` — dishes, ingredients, stations
- `game/src/state.js` — orders, plate, timer, scoring
- `game/src/render.js` — all canvas drawing
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — synthesized sound effects
- `game/src/main.js` — game loop and demo states
- `main.ts` — hands the game in to make.fun

Entry for the make.fun bounty
[best-cooking-game-20261125-0137](https://make.fun/bounty/best-cooking-game-20261125-0137).
MIT licensed.
