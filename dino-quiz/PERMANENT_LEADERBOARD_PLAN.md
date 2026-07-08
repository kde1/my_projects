# Dino Quiz Permanent Leaderboard Plan

## Summary

Dino Quiz should keep a permanent leaderboard without using an external host and without requiring the user to manually replace downloaded files. The best self-contained approach is to add a tiny local server inside the repo. The browser game will run from `localhost`, and the **Save Leaderboard** button will write directly to a Git-tracked JSON file in the repo.

This keeps the project self-contained, avoids cloud services, and makes the leaderboard shareable through normal Git commits and pulls.

## Goals

- Keep the repo self-contained.
- Avoid external hosting, cloud databases, Firebase, Supabase, or GitHub API tokens.
- Let the player press **Save Leaderboard** on the web page.
- Save leaderboard data directly into the repo.
- Avoid the current download/replace `player-data.js` workflow.
- Keep the game usable for kids and simple to operate.
- Make the saved leaderboard appear on another computer after `git pull`.

## Current Problem

The current implementation uses:

- Browser `localStorage` for local scores.
- `dino-quiz/js/player-data.js` for Git-tracked leaderboard data.
- A **Save Leaderboard** button that downloads a replacement file.

This works, but it is not smooth because the browser cannot directly write to files in the repo. A downloaded file still needs to be copied into the project, committed, and pushed.

## Recommended Architecture

Add a local-only Node.js server using built-in Node APIs.

No external npm packages are required.

The server will:

- Serve the Dino Quiz files in the browser.
- Provide an endpoint to read leaderboard data.
- Provide an endpoint to save leaderboard data.
- Write the saved data into a Git-tracked JSON file.

The browser will:

- Load leaderboard data from the local server when available.
- Continue to use local browser storage as a temporary backup.
- Send leaderboard/player data to the server when **Save Leaderboard** is pressed.
- Show a friendly message when permanent saving succeeds or fails.

## Data Storage

Create a Git-tracked file:

```text
dino-quiz/data/leaderboard.json
```

Initial contents:

```json
{
  "players": [],
  "leaderboard": []
}
```

The file should store:

- Registered player names.
- Quiz result entries.
- Score.
- Max score.
- Accuracy.
- Hints used.
- Difficulty.
- Paleontologist title.
- Date.
- Unique result id.

The existing score shape can be reused so the app does not need a major quiz logic rewrite.

## Local Server

Add a server file, for example:

```text
dino-quiz/server.js
```

The server should use Node's built-in modules:

- `http`
- `fs`
- `path`
- `url`

No `express`, no SQLite dependency, and no package install required.

The server should support:

```text
GET /api/leaderboard
```

Returns the contents of `dino-quiz/data/leaderboard.json`.

```text
POST /api/leaderboard
```

Accepts JSON data from the browser and writes it into `dino-quiz/data/leaderboard.json`.

```text
GET /...
```

Serves static files from `dino-quiz`.

## Save Button Behavior

Rename the behavior of **Save Leaderboard** so it no longer downloads a file.

When clicked:

1. Gather current local players and leaderboard entries.
2. Merge them with the loaded permanent leaderboard.
3. Send the merged result to `POST /api/leaderboard`.
4. If saving succeeds, show a success message such as:
   `Leaderboard saved to this repo. Commit and push when ready.`
5. If the local server is not running, show:
   `Permanent saving needs the Dino Quiz local server. Your score is still saved in this browser.`

## Browser Fallback

The game should still open as a static HTML page if someone double-clicks `index.html`.

In that mode:

- The game should still work.
- Quiz scores should still save to browser storage.
- The permanent save button should not break.
- If pressed, it should explain that permanent saving requires the local server.

This avoids making the game fragile.

## Git Workflow

After pressing **Save Leaderboard**, the JSON file changes inside the repo.

Then the normal workflow is:

```bash
git add dino-quiz/data/leaderboard.json
git commit -m "Save quiz leaderboard"
git push
```

On another computer:

```bash
git pull
```

Then the leaderboard appears there too.

## Why JSON Instead Of SQLite

JSON is the best fit for this exact requirement.

Reasons:

- Git can track it clearly.
- It is easy to inspect in GitHub.
- Merge conflicts are easier to understand than with a binary database file.
- No extra dependencies are needed.
- The leaderboard is small.
- It keeps the repo simple for a child-friendly game.

SQLite would be useful later if:

- The leaderboard becomes very large.
- There are many simultaneous players.
- More complex queries are needed.
- The game becomes a proper app with a longer-running backend.

For now, JSON is simpler, more transparent, and more Git-friendly.

## Implementation Changes

- Add `dino-quiz/data/leaderboard.json`.
- Add `dino-quiz/server.js`.
- Update quiz loading logic to try `GET /api/leaderboard`.
- Update **Save Leaderboard** to use `POST /api/leaderboard`.
- Keep localStorage as a backup.
- Remove the file-download behavior from the save button.
- Keep `player-data.js` temporarily only if needed for compatibility, then remove it once JSON loading is stable.
- Update the smoke test to validate the new JSON data file.
- Add a short usage note, either in a README or visible repo instruction file.

## Suggested Start Command

Because there is no `package.json` today, the simplest first version can be:

```bash
node dino-quiz/server.js
```

The server should print:

```text
Dino Quiz running at http://localhost:3000/
```

If port `3000` is busy, it should either:

- Use the next available port, or
- Print a clear error.

Recommended default: start at port `3000`.

## Optional Convenience Files

A later improvement could add:

```text
start-dino-quiz.bat
```

For Windows users, double-clicking this file could start the server.

It could run:

```bat
node dino-quiz\server.js
```

This is optional but would make the game easier for non-technical use.

## Test Plan

- Start the local server.
- Open `http://localhost:3000/`.
- Confirm the game loads.
- Confirm the home page leaderboard loads from `leaderboard.json`.
- Play one quiz round.
- Confirm score appears in the leaderboard.
- Press **Save Leaderboard**.
- Confirm `dino-quiz/data/leaderboard.json` changes.
- Refresh the browser.
- Confirm the leaderboard is still visible.
- Stop the server.
- Open `index.html` directly.
- Confirm the game still works.
- Press **Save Leaderboard** while not using the server.
- Confirm a helpful message appears instead of a broken download.
- Run the smoke test.
- Commit and push the JSON file.
- Pull on another computer.
- Confirm the saved leaderboard appears there.

## Acceptance Criteria

- A user can save the leaderboard by pressing one button on the web page.
- No downloaded replacement file is needed.
- No external host is needed.
- The repo remains self-contained.
- The permanent leaderboard data is stored in a Git-tracked file.
- Another computer can receive the leaderboard using `git pull`.
- The static fallback does not break the quiz.

## Assumptions

- Running a tiny local server is acceptable.
- The leaderboard does not need to update live across multiple computers at the same time.
- Git is still the way leaderboard data moves between computers.
- JSON is acceptable as the permanent data format.
- Automatic commit/push from the browser is not required.
