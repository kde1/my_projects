# Dino Quiz

Isaac's Dino Quiz — identify 50 dinosaurs from photorealistic images, build your
own dinosaur, splice DNA, and collect trophies.

## Play

Open `index.html` directly in a browser to play with browser-only score saving.

## Permanent leaderboard (recommended)

For a permanent leaderboard that can be committed and shared through Git, start
the local server from this folder:

```bash
npm start
```

(or `node server.js`)

Then open the printed `localhost` address. The **Save Leaderboard** button writes
to `data/leaderboard.json`, which can be committed and pushed with the rest of the
repo. Saving also regenerates `js/player-data.js` so scores still appear when the
game is opened directly from a file.

## Test

```bash
npm test
```

(or `node smoke-test.js`) — validates the dinosaur data, assets, script load
order, CSS manifest, the data store, and leaderboard-file consistency.
