# Dino Quiz — Improvement Plan

Refactoring + fun/motivation roadmap for the Dino Quiz.
Target audience of the game: children ages 8–13 who love dinosaurs.

Date: 2026-07-08
Status: PROPOSED (nothing in this document is implemented yet)

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [Current State Summary](#2-current-state-summary)
3. [Part A — Refactoring](#3-part-a--refactoring)
   - A1. Unified player/leaderboard data store
   - A2. Retire or auto-generate `player-data.js`
   - A3. Split `script.js` into feature modules
   - A4. Remove dead `crop`/`view` data
   - A5. Add `package.json`
   - A6. Minor cleanups
4. [Part B — Fun & Motivation Features](#4-part-b--fun--motivation-features)
   - B1. Printable Certificate of Paleontology
   - B2. Trophy Shelf (badges)
   - B3. Dino-Dex (collection mechanic)
   - B4. Ranks & lifetime XP
   - B5. Fossil Coins + Builder unlocks
   - B6. Celebration effects ("juice")
   - B7. Sibling Duel mode
   - B8. Themed expeditions
   - B9. Boss Fossil questions
   - B10. Re-dig missed fossils (spaced repetition)
   - B11. Weekly board + Hall of Fame
5. [Data Model (target)](#5-data-model-target)
6. [Implementation Order & Milestones](#6-implementation-order--milestones)
7. [Testing Plan](#7-testing-plan)
8. [Out of Scope](#8-out-of-scope)

---

## 1. Guiding Principles

- **Kids first.** Every feature must be understandable by an 8-year-old without
  reading instructions. Big buttons, immediate feedback, no punishing mechanics.
- **Fair across ages.** The 8-year-old and the 13-year-old must both be able to
  "win" something. Difficulty handicaps and always-increasing progression (ranks,
  Dino-Dex) matter more than raw score comparison.
- **Local & self-contained.** Same constraints as
  [PERMANENT_LEADERBOARD_PLAN.md](PERMANENT_LEADERBOARD_PLAN.md): no external
  hosting, no npm dependencies, everything works from `localhost` via
  `server.js`, degraded-but-playable from `file://`.
- **Refactor before building.** The data-store refactor (A1) is the foundation
  for badges, Dino-Dex, coins, and ranks. Do it first; everything else plugs in.
- **Nothing is ever lost.** Progression data (badges, discoveries, XP, coins)
  only ever grows. Round scores can be bad; permanent progress cannot go down.

---

## 2. Current State Summary

What already exists and is reused heavily below:

| Asset | Where | Reused by |
|---|---|---|
| Named explorers + registry | `js/quiz.js` (localStorage + server) | B2, B3, B4, B5, B7 |
| Permanent leaderboard + save API | `server.js`, `data/leaderboard.json` | B2, B4, B11 |
| Print pipeline (`data-printMode` + print CSS) | `script.js`, `css/gallery-print.css` | B1 |
| 50 dinosaur images + field guide | `assets/`, `js/data.js` | B3, B8, B9 |
| `era` / `group` metadata per dinosaur | `js/data.js` | B8, B9 |
| Round titles (`quizExpertiseResult`) | `js/quiz.js` | B1, B4 |
| SVG Builder with parts/patterns/colors | `script.js` | B5 |
| Smoke test harness | `smoke-test.js` | Section 7 |

Known problems (from the code review):

1. Player/leaderboard data merged ad hoc from **three sources** in five places
   in `js/quiz.js`.
2. `js/player-data.js` duplicates `data/leaderboard.json` and has already drifted.
3. `script.js` is ~1,100 lines mixing builder, DNA lab, gallery, print, bootstrap.
4. Dead per-dinosaur `crop`/`view` data in `js/data.js` (~100 unused tuned values).
5. No `package.json` (no `npm start` / `npm test`).
6. Assorted minor issues (duplicated sort comparator, giant `elements` object,
   difficulty change wipes a running round, `startsWith(root)` path check,
   per-render listener attachment).

---

## 3. Part A — Refactoring

### A1. Unified player/leaderboard data store  `[foundation — do first]`

**Problem.** `js/quiz.js` juggles three overlapping sources — localStorage
leaderboard (`dinoQuizLeaderboard`), localStorage player registry
(`dinoQuizPlayers`), and `permanentPlayerData` (seeded from `player-data.js`,
replaced by the server fetch) — and re-merges them in `quizLeaderboard()`,
`localLeaderboard()`, `quizPlayers()`, `permanentPayload()`, and
`playerScoreCount()`. Every mutation (`forgetExplorer`, `clearExplorerScores`,
`saveQuizResult`, `savePermanentLeaderboard`) must remember to touch all three.

**Solution.** New module `js/store.js` exposing `window.createDinoStore()` with
a single canonical in-memory state:

```js
{
  players: [ { name, firstSeen, profile: {...} } ],   // profile added in Part B
  leaderboard: [ { id, name, score, maxScore, accuracy, hints,
                   difficulty, title, date } ]
}
```

API surface (all synchronous except load/save):

```js
store.load()                 // async: server GET -> localStorage -> seed -> merge once
store.save()                 // async: POST to server if available, always localStorage
store.getPlayers()           // sorted, deduped by lowercased name
store.getPlayer(name)        // single player record (or null)
store.upsertPlayer(name)     // returns the record, creates profile if missing
store.removePlayer(name)     // removes player + their leaderboard entries
store.clearScores(name)      // removes leaderboard entries only
store.getLeaderboard(limit)  // sorted by compareEntries, sliced
store.addResult(entry)       // push, sort, cap at SAVED_RESULT_LIMIT
store.isDirty()              // unsaved changes exist (drives Save button state)
```

Internal rules:

- **Merge exactly once**, inside `load()`: server data wins, then localStorage,
  then the static seed. After load, memory is the single source of truth.
- Every mutation writes localStorage immediately (crash safety) and sets a
  dirty flag; the **Save Leaderboard** button calls `store.save()`.
- Extract the triple-duplicated comparator into one exported
  `compareEntries(a, b)` (`score desc, accuracy desc, hints asc`).
- Keep `mergeById` / `mergeByName` as private helpers of the store; delete the
  copies in `quiz.js`.

**Files:** new `js/store.js`; `js/quiz.js` shrinks substantially; `index.html`
adds the script tag (before `js/quiz.js`); `smoke-test.js` gains store checks.

**Acceptance criteria:**
- All existing flows work: join, add explorer, forget, clear scores, save,
  leaderboard on landing + quiz tab.
- Grep proof: `readJsonStorage(LEADERBOARD_STORAGE_KEY` appears only inside
  `store.js`.
- Killing the server mid-session degrades exactly as today (localStorage only,
  friendly status message).

### A2. Retire or auto-generate `player-data.js`

**Problem.** `js/player-data.js` is the leftover of the pre-server
download-and-replace workflow. It duplicates `data/leaderboard.json` and the two
have already drifted.

**Decision: keep it, but make it a build artifact.** It is the only thing that
makes the leaderboard visible when the game is opened via `file://` (kids
double-clicking `index.html`), so don't delete it. Instead:

1. `server.js` `writeLeaderboard()` additionally regenerates
   `js/player-data.js` from the same payload (same IIFE wrapper, pretty-printed).
2. Add a header comment: `// AUTO-GENERATED by server.js — do not edit by hand.`
3. `smoke-test.js` asserts `player-data.js` content deep-equals
   `data/leaderboard.json` (drift detector).

**Acceptance criteria:** pressing **Save Leaderboard** updates both files;
smoke test fails if they ever diverge.

### A3. Split `script.js` into feature modules

**Problem.** ~1,100 lines mixing unrelated features; the flat global `state`
object is shared by all of them.

**Target layout** (plain scripts + window globals — same pattern as
`quiz.js`, no bundler, load order enforced in `index.html` and smoke test):

```
js/
  data.js          (exists) static dinosaur data
  store.js         (A1)     player/leaderboard/profile store
  helpers.js       (new)    escapeHtml, $, $$, titleCase, shuffle, storage wrappers
  builder.js       (new)    SVG part markup, palette, drag, randomize, field test
  dna.js           (new)    DNA lab, splice, gene report, stat badges
  gallery.js       (new)    gallery + practice grids, print page rendering
  quiz.js          (exists) quiz controller
  celebrate.js     (B6)     confetti / sfx (added later)
  app.js           (new)    state definition, tab navigation, print-mode
                            bindings, bootstrap (initializeApp)
```

State gets namespaced during the move:

```js
const state = {
  builder: { body, head, tail, legs, armor, detail, baseColor, bellyColor,
             pattern, size, posture, fossilName, offsets },
  dna:     { a, b, goal, boost, lastSplice },
  quiz:    { playerName, index, score, total, correct, streak, answered,
             potential, hintsUsed, roundHints, roundComplete, resultSaved,
             currentItem, difficulty, order },
  gallery: { page, quizPage, revealed }
};
```

**Mechanical rules for the move:** pure moves, no behavior changes, one module
per commit, smoke test green after each commit. Also fold in:

- Quiz controller queries its own DOM elements (drop the 25-key `elements`
  object from `createQuizController`; pass only `{ state, store, helpers }`).
- Replace per-button listeners in `renderQuiz` with **one delegated click
  listener** on `#quizOptions`.

**Acceptance criteria:** app behaves identically; `app.js` under ~200 lines;
no module reads another module's DOM.

### A4. Remove dead `crop`/`view` data in `data.js`

`renderQuiz` hardcodes `objectPosition = "50% 50%"` and `scale(1)` and removes
the `expert-crop` class, so the per-dinosaur `crop: {position, scale}` and the
`view` label (50 × ~3 hand-tuned values) are dead.

**Decision: delete** (do not resurrect the expert-crop feature — B9's Boss
Fossil provides "harder presentation" more cheaply). Remove the two parameters
from the `q()` factory and the `crop`/`view` keys, plus the leftover
`expert-crop` class toggles in `quiz.js` and any `.expert-crop` CSS rule.

**Acceptance criteria:** grep for `crop` in `js/` returns nothing;
smoke test passes; quiz images render unchanged.

### A5. Add `package.json`

```json
{
  "name": "dino-quiz",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "test": "node smoke-test.js"
  }
}
```

Update `README.md` to say `npm start` / `npm test` (keep the raw `node`
commands as an alternative).

### A6. Minor cleanups (batch, low risk)

| # | Item | Fix |
|---|---|---|
| 1 | Difficulty change silently wipes a running round | If `state.quiz.total > 0 && !roundComplete`, show inline confirm ("Switching difficulty starts a new round — switch?") before `startQuizRound()` |
| 2 | `server.js` path check `filePath.startsWith(root)` | Compare against `root + path.sep` |
| 3 | `mergeById` fallback key `${name}-${score}-${date}` collides for two identical legit results | Always generate a real `id` at creation time; fallback stays only for legacy entries |
| 4 | `titleCase("")` crashes | Guard for empty string |
| 5 | Server POST accepts any payload shape | Validate each leaderboard entry has `name` (string) and `score` (number); drop invalid entries server-side |
| 6 | `console.error` on data problems is invisible to kids | Fine — but also surface `validateQuizData()` failures in the smoke test (it already covers most) |

---

## 4. Part B — Fun & Motivation Features

> Ordering rationale: B1–B3 are the highest joy-per-effort; B4–B5 build the
> long-term loop; B6–B7 multiply engagement; B8–B11 are nice extras.
> B2–B5 and B7 all require the per-player `profile` object from A1.

### B1. Printable Certificate of Paleontology  `[quick win]`

**What.** After finishing a round, a **"Print My Certificate"** button prints a
diploma-style A4/Letter page.

**Certificate contents:**
- Ornate border (CSS), museum-style header: *"The Isaac Museum of Natural
  History hereby certifies that…"*
- Explorer name (large, script-style font)
- Earned title from `quizExpertiseResult` (e.g. *Expert Paleontologist*)
- Score `X / maxScore`, accuracy %, difficulty, date
- A dinosaur illustration (use the round's last correctly identified dinosaur,
  fallback `quiz-tyrannosaurus.png`)
- Signature lines: "Museum Director" + a paw/claw stamp glyph
- If the round unlocked badges (B2): small badge icons along the bottom

**How.**
- New print mode: `document.body.dataset.printMode = "certificate"` — plugs
  into the existing `bindPrintControls` / `afterprint` machinery.
- New hidden DOM section `#certificatePage`, populated by
  `renderCertificate(result)` when a round completes.
- New CSS file `css/certificate.css` added to the `styles.css` manifest
  (`@media print` rules keyed off `[data-print-mode="certificate"]`, same
  pattern as `css/gallery-print.css`).
- Button appears in the results panel (`renderQuizResults`) next to
  **Play Again**, only when a player is registered.

**Acceptance criteria:** print preview shows exactly one page, no nav/game
chrome; name/title/score/date correct; works from `file://` too (printing
needs no server).

### B2. Trophy Shelf — persistent badges  `[quick win, needs A1]`

**What.** Permanent, per-explorer achievements displayed as a "trophy shelf" on
the player card and as tiny icons next to leaderboard names.

**Badge definitions (initial set — data-driven, in `js/data.js` as `badges`):**

| id | Icon | Name | Earned when |
|---|---|---|---|
| `first-dig` | 🦴 | First Dig | Finish your first round |
| `perfect-10` | 💯 | Perfect 10 | 10/10 correct in one round |
| `no-hint-hero` | 🧠 | No-Hint Hero | Round with 0 hints and ≥8 correct |
| `streak-5` | 🔥 | Streak Master | 5 correct in a row |
| `streak-10` | ⚡ | Lightning Streak | 10 correct in a row |
| `hard-champ` | 🏆 | Hard Mode Champion | Finish Hard with ≥70% accuracy |
| `dedicated-digger` | ⛏️ | Dedicated Digger | Play on 5 different days |
| `half-dex` | 🔍 | Field Researcher | Discover 25 dinosaurs (B3) |
| `full-dex` | 🌟 | Master of the Museum | Discover all 50 dinosaurs (B3) |
| `duelist` | ⚔️ | Duelist | Win a Sibling Duel (B7) |

Each definition: `{ id, icon, name, description, check(profile, roundResult) }`.

**How.**
- Player profile (see Section 5) gains `badges: { [id]: earnedDateISO }` and
  `playDates: [isoDate…]` (capped at 60 entries).
- New `evaluateBadges(profile, roundResult)` runs in `renderQuizResults` and
  after each answer (for streak badges); returns newly earned badges.
- Newly earned badge → celebration toast (reuses B6 when it exists; plain
  animated toast until then): "🏆 New trophy: Streak Master!"
- **Trophy shelf UI:** a horizontal row under the explorer status line —
  earned badges in color with tooltip (name + description + date), unearned
  ones greyed-out silhouettes with "???" for discovery tension. Shelf also
  rendered in the Manage Explorers list (count only: "7/10 trophies").
- Leaderboard rows append up to 3 badge icons after the name.

**Persistence:** profile lives inside the player record → saved by
`store.save()` to `data/leaderboard.json` → shared across computers via Git,
exactly like scores.

**Acceptance criteria:** badges survive reload and server round-trip; each
badge can be earned exactly once; greyed shelf renders for brand-new explorers.

### B3. Dino-Dex — the collection mechanic  `[highest long-term hook, needs A1]`

**What.** Every dinosaur answered correctly is permanently **discovered** for
that explorer. The Gallery becomes a personal collection: undiscovered
dinosaurs render as dark silhouettes, discovered ones in full color with a
"COLLECTED" stamp. A progress counter ("37 / 50 discovered") shows everywhere
relevant.

**Rules:**
- Discovery happens on a **correct quiz answer** (any difficulty; hints
  allowed — discovering must feel generous). Practice-tab reveals do NOT count.
- Discoveries are per explorer, permanent, and only ever grow.
- Wrong answers change nothing — the framing is "one I still need", not failure.

**UI changes:**
- **Gallery tab:** when a player is checked in, add a header pill
  `🦕 37/50 discovered` and a filter toggle: All / Discovered / Still hidden.
  Undiscovered card: image with CSS filter `brightness(0.15) saturate(0)` +
  name replaced by "???" (era still visible as a hint). Discovered card:
  normal + corner stamp.
- **Quiz results panel:** "You discovered 2 new dinosaurs this round!" with
  their thumbnails popping in.
- **Landing page:** under the leaderboard, per-explorer mini progress bars
  ("Isaac 41/50", "Zoe 18/50") — sibling-visible progress is motivating.
- **Print:** "Print my Dino-Dex" button → reuses gallery print pages but
  silhouettes the undiscovered ones (checklist to complete on paper).

**How.**
- Profile gains `discovered: [slug…]` (Set in memory, array persisted).
- `answerQuiz` on correct: `store.discover(playerName, item.slug)` → returns
  `true` if new → queue "NEW!" flash for the results screen.
- `renderGallery` gets discovery-awareness (needs the active player from
  state; when no player checked in, gallery renders as today).

**Acceptance criteria:** discovery persists across reload + save/load cycle;
counters correct; gallery unaffected when no explorer is checked in; the
`half-dex`/`full-dex` badges (B2) trigger at 25/50.

### B4. Ranks & lifetime XP  `[needs A1]`

**What.** Cumulative, never-decreasing progression across all rounds.

- Every point scored in any round adds to the explorer's lifetime XP.
- XP maps to a rank ladder (thresholds tuned so a casual player levels every
  2–4 sessions early on):

| Rank | XP | Icon |
|---|---|---|
| Museum Intern | 0 | 🧹 |
| Junior Bone Hunter | 150 | 🦴 |
| Fossil Scout | 400 | 🔦 |
| Dino Detective | 800 | 🔍 |
| Fossil Field Captain | 1,400 | 🧭 |
| Expert Paleontologist | 2,200 | 🎓 |
| Legendary Paleontologist | 3,500 | 🌋 |

**UI:** rank icon + name next to the explorer's name everywhere (status line,
leaderboard, duel screen); progress bar "1,240 / 1,400 XP to Fossil Field
Captain" on the player card; rank-up moment gets a full celebration (B6) and
its own toast. Rank-up is also a certificate trigger (B1): "Print Rank
Certificate".

**How.** Profile gains `xp: number`. `renderQuizResults` adds
`state.quiz.score` to XP via `store.addXp(name, points)`. Rank derived, never
stored (`rankForXp(xp)` in `data.js` next to the table).

**Design note:** round titles (`quizExpertiseResult`) stay as *per-round*
feedback; ranks are the *lifetime* ladder. Reuse of the same names at the top
of both ladders is intentional (aspiration), but the UI must label them
("Round result" vs "Rank").

**Acceptance criteria:** XP survives save/load; rank recomputed from XP alone;
progress bar accurate; leaderboard shows rank icons.

### B5. Fossil Coins + Builder unlocks  `[connects quiz ↔ builder, needs A1]`

**What.** An earn-and-spend economy that gives quiz points a purpose and pulls
kids into the Builder.

**Earning (coins are separate from score/XP):**
- +1 coin per correct answer (Easy), +2 (Medium), +3 (Hard)
- +5 bonus for a perfect round, +2 for a no-hint round
- Boss Fossil correct (B9): double coins for that question

**Spending — Builder cosmetic unlocks (`builderUnlocks` table in `data.js`):**

| Unlock | Cost | Type |
|---|---|---|
| Lava pattern | 15 | new SVG pattern |
| Feather coat pattern | 15 | new SVG pattern |
| Golden skin palette | 25 | preset color pair |
| Midnight palette | 25 | preset color pair |
| Crown crest | 40 | new `detail` part |
| Battle scars | 40 | new `detail` part |
| Volcano habitat | 60 | alternate stage background (needs 1 new asset) |

**Rules for kids' sanity:** nothing playable is ever locked — only cosmetics.
Hints stay score-priced as today (do NOT price hints in coins; two currencies
on one button confuses the 8-year-old).

**UI:** coin balance chip (🪙 34) in the quiz topline and Builder panel; locked
Builder options show a padlock + price; click → "Unlock for 15 🪙?" inline
confirm; unlock plays the celebration effect (B6). Coin gains appear in the
answer feedback line ("Correct! +10 pts, +2 🪙").

**How.** Profile gains `coins: number` and `unlocks: [id…]`. Builder reads the
active player's unlocks when rendering choice buttons; if no player is checked
in, only default options show (gentle nudge to register). New patterns/palettes
are small additions to existing `slots`/pattern machinery in `builder.js`.

**Acceptance criteria:** coins & unlocks persist per player; locked items
unusable until bought; economy tables data-driven (no prices hardcoded in UI
code).

### B6. Celebration effects  `[cheap joy]`

**What.** Feedback "juice", all dependency-free, in new `js/celebrate.js` +
`css/celebrate.css`:

1. **Confetti** — 30–60 absolutely-positioned CSS-animated particles from a
   `<div id="fxLayer">` overlay. Intensity tiers: small (correct answer),
   medium (streak 3/5, badge, unlock), large (perfect round, rank-up, full-dex).
2. **Sounds** — 3–4 short effects via WebAudio oscillators (no audio files):
   soft "pop" (correct), low "thud" (wrong — gentle, never mocking), fanfare
   arpeggio (badge/rank-up), stomp (round complete). Master toggle 🔊/🔇 in the
   nav, persisted in localStorage, **default OFF** (parents' ears, classrooms).
3. **Micro-animations** — correct button pulses green; streak counter bumps
   with scale; screen edge "stomp shake" (2px, 150ms) on round completion.
   All gated behind `@media (prefers-reduced-motion: no-preference)`.

**API:** `celebrate.burst(size)`, `celebrate.sound(name)`, `celebrate.toast(html)` —
called from quiz controller and store event points.

**Acceptance criteria:** zero effect on layout; reduced-motion honored; sound
toggle persists; no jank on a low-end tablet (cap particle count, use
`transform`-only animations).

### B7. Sibling Duel mode  `[the multiplayer ask]`

**What.** Two explorers on one screen, alternating questions, head-to-head —
**each playing at their own difficulty** so an 8-year-old can fairly beat a
13-year-old.

**Flow:**
1. Quiz tab gets a mode switch: `Solo | Duel`.
2. Duel setup: pick Explorer 1 + difficulty, Explorer 2 + difficulty
   (defaults remembered per pair in localStorage).
3. 10 questions each, strictly alternating (P1 → P2 → P1 …), 20 total.
   Big banner shows whose turn it is, with their rank icon and running score.
   Each player's questions come from their own difficulty pool and are worth
   their own difficulty's points.
4. Hints allowed per the active player's difficulty rules.
5. End screen: side-by-side result cards, winner gets a big 🏆 + confetti
   (large), loser card says "Rematch?" — one tap swaps nothing and restarts.
6. Both players' XP/coins/discoveries/badges accrue exactly as in solo.
   Winner earns the `duelist` badge. Duel results do NOT enter the solo
   leaderboard (different scales); instead profile gains
   `duels: { won, played }` shown on the player card.

**How.** Mostly quiz-controller work: a `duel` sub-state
`{ active, players: [{name, difficulty, score, correct, hints}], turn, questionCount }`;
`renderQuiz` reads the *active duel player* for difficulty/pool/points;
`answerQuiz`/`nextQuiz` advance the turn. UI: a duel header component +
setup panel in `quizPanel`, ~1 new CSS section.

**Anti-frustration rules:** identical dinosaur may appear for both players
(separate shuffles) — fine; never show one player's answer feedback long enough
for the other to memorize — the "Next" click hands over the device.

**Acceptance criteria:** full duel completes with mixed difficulties; per-player
stats correct; progression (XP/coins/dex) lands on the right profiles; solo
mode untouched when duel is off.

### B8. Themed Expeditions  `[content variety]`

**What.** A rotating daily theme as an optional round type:
"Today's Expedition: **Late Cretaceous only**".

- Theme table in `data.js`: filter by `era` (`Late Cretaceous`, `Jurassic`
  (Early+Late), `Early Cretaceous`) and by `group` clusters
  (Spiky Specialists = stegosaur+ankylosaur; Giant Sauropods = sauropod;
  Fierce Hunters = tyrannosaur+carcharodontosaur+abelisaurid+dromaeosaur;
  Crested Callers = hadrosaur+oviraptorid; Ostrich Runners = ornithomimid…).
- Deterministic rotation: `themes[dayOfYear % themes.length]` — same theme all
  day, new one tomorrow ("come back tomorrow" hook), no server needed.
- Quiz tab shows an expedition card: theme name, blurb, 🪙 +50% coin bonus.
  Clicking starts a round whose pool = theme filter ∩ (min 8 dinosaurs;
  if a theme has <8, pad from the full set and say so).
- Completing today's expedition sets `profile.expeditions[isoDate] = themeId`
  (used later for a possible calendar/streak view — store the data now).

**Acceptance criteria:** same theme all day; pool filter correct; coin bonus
applied; falls back gracefully for small pools.

### B9. Boss Fossil  `[drama]`

**What.** The 10th question of every solo round is a **Boss Fossil**: drawn
from the rarest third of the pool (dinos NOT in the easy/medium slug lists),
worth **double points and double coins**, with a special presentation —
darkened image frame, red "BOSS FOSSIL" banner, drumroll sound (B6), and one
extra wrong answer choice (+1 to `choiceCount`).

**How.** In `startQuizRound`, reserve index 9 for a shuffled pick from the
boss pool (excluding dinos already in this round). `renderQuiz` checks
`state.quiz.index === 9` for the boss styling/points. On Easy, the boss is
still a boss but drawn from the *medium* list (age-appropriate ceiling).

**Acceptance criteria:** exactly one boss per round, always question 10;
double scoring verified; boss never duplicates an earlier question.

### B10. Re-dig missed fossils  `[learning loop]`

**What.** Light spaced repetition: dinosaurs answered wrong go into the
explorer's `redig` queue. The next solo round at the same difficulty includes
up to 3 queued dinos (marked with a small "Re-dig ⛏️" tag on the question so
the kid recognizes the second chance). Correct on a re-dig → removed from the
queue + a warm "Got it this time!" note; wrong again → stays queued (max 2
re-appearances, then drop it — never let the queue feel like homework).

**How.** Profile gains `redig: [{slug, misses, lastSeen}]` (cap 10, FIFO).
`startQuizRound` splices up to 3 queue slugs into the round order (never the
boss slot). Result feedback line acknowledges re-dig successes.

**Acceptance criteria:** wrong answer enqueues; re-dig items appear next round;
success dequeues; cap respected; boss slot never a re-dig.

### B11. Weekly board + Hall of Fame  `[fairness]`

**What.** Keep the all-time board, add a **This Week** board that resets every
Monday — younger kids periodically get to be #1.

- Week key derived from the entry's date: ISO year+week (`2026-W28`). No new
  data needed beyond storing `dateISO` on new entries (keep the old `date`
  display string for backward compatibility).
- Leaderboard card gets tabs: `This Week | All-Time`. Weekly = filter entries
  where `isoWeek(entry.dateISO) === currentWeek`. All-time = today's behavior,
  renamed **Hall of Fame** with a 👑 on the #1 row.
- Landing page shows This Week by default (freshest competition), with the
  Hall of Fame beneath it.

**Acceptance criteria:** legacy entries without `dateISO` appear only in
all-time; week rollover verified by unit check in smoke test (pure function
`isoWeek()`); no server change needed.

---

## 5. Data Model (target)

Single persisted document — `data/leaderboard.json` (server), mirrored to
localStorage and auto-generated `js/player-data.js` (A2):

```jsonc
{
  "version": 2,                      // migration marker; absent/1 = legacy
  "players": [
    {
      "name": "Isaac",
      "firstSeen": "7/8/2026",
      "profile": {
        "xp": 1240,                  // B4
        "coins": 34,                 // B5
        "unlocks": ["lava-pattern"], // B5
        "badges": { "first-dig": "2026-07-08", "streak-5": "2026-07-08" }, // B2
        "discovered": ["tyrannosaurus", "triceratops"],                    // B3
        "redig": [{ "slug": "torosaurus", "misses": 1, "lastSeen": "2026-07-08" }], // B10
        "playDates": ["2026-07-08"], // B2 (dedicated-digger), capped 60
        "expeditions": { "2026-07-08": "late-cretaceous" },                // B8
        "duels": { "won": 2, "played": 5 }                                 // B7
      }
    }
  ],
  "leaderboard": [
    {
      "id": "1783492285672-4f3502acfbee88",
      "name": "Papi",
      "score": 90, "maxScore": 100, "accuracy": 90, "hints": 0,
      "difficulty": "Easy", "title": "Expert Paleontologist",
      "date": "7/8/2026",            // legacy display string (kept)
      "dateISO": "2026-07-08"        // new; enables B11 weekly boards
    }
  ]
}
```

**Migration (in `store.load()`):** documents without `version` get
`profile` objects created empty per player, `dateISO` left absent on old
entries. Migration is idempotent and runs in memory; persisted on next save.

**Size sanity:** 10 players × full profiles ≈ a few KB. No limits needed
beyond existing caps (`SAVED_RESULT_LIMIT`, redig cap, playDates cap).

---

## 6. Implementation Order & Milestones

Each milestone is independently shippable; smoke test green at every step.

**M1 — Foundation (refactor)**
1. A5 `package.json` + README update *(5 min)*
2. A6 minor cleanups batch
3. A1 data store (the big one)
4. A2 `player-data.js` auto-generation + drift check
5. A4 delete dead crop/view data
6. A3 module split (mechanical, one module per commit)

**M2 — Quick-win joy** *(the "wow" release for the kids)*
7. B1 Certificate
8. B2 Trophy Shelf
9. B3 Dino-Dex
10. B6 Celebrations (drop in last so badges/dex can trigger it)

**M3 — The loop**
11. B4 Ranks & XP
12. B5 Fossil Coins + Builder unlocks
13. B11 Weekly board / Hall of Fame

**M4 — Together & variety**
14. B7 Sibling Duel
15. B9 Boss Fossil
16. B10 Re-dig queue
17. B8 Themed Expeditions

**Suggested cut lines:** if effort must be trimmed, ship M1+M2 only — the
certificate, trophies, and Dino-Dex deliver most of the motivation value.
B8 and B10 are the first candidates to drop entirely.

---

## 7. Testing Plan

Extend `smoke-test.js` (still zero dependencies, still `node smoke-test.js`):

- **Existing checks** stay (50 items, guides, assets, script order, CSS manifest).
- **Store:** run `js/store.js` in a `vm` context with a stubbed
  `localStorage` + seed data; assert merge precedence (server > local > seed),
  dedupe, `compareEntries` ordering, migration of a `version`-less document,
  dirty-flag behavior.
- **Drift check (A2):** `js/player-data.js` deep-equals `data/leaderboard.json`.
- **Data-driven tables:** every badge `check` is a function; every
  `builderUnlocks` id unique and priced > 0; every expedition theme resolves
  to ≥ 1 dinosaur; rank table strictly increasing XP.
- **Pure functions:** `rankForXp` boundaries, `isoWeek` around a Sunday/Monday
  rollover, boss-pool selection excludes easy slugs.
- **Manual checklist per milestone** (kid-testable): finish a round → print
  certificate; earn `first-dig`; discover a dino and see it in the gallery;
  play a duel Easy-vs-Hard and verify fair point values; toggle sound; reload
  and confirm nothing was lost; `git pull` on the second computer and confirm
  profiles arrived.

---

## 8. Out of Scope

Deliberately excluded (revisit only on explicit request):

- Any external hosting, accounts, or cloud sync (Git remains the sync channel).
- Real-time networked multiplayer (duel is same-device by design).
- Audio *files* (WebAudio synthesis only, keeps the repo small).
- Timed/lightning modes — considered, but time pressure punishes the
  8-year-old and conflicts with the "reading the field guide is the point"
  learning goal. Could become an opt-in later for the 13-year-old.
- Framework/bundler adoption; the plain-scripts-plus-window-globals pattern
  stays.
