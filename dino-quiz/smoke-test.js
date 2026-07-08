const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = __dirname;
const dataPath = path.join(root, "js", "data.js");
const playerDataPath = path.join(root, "js", "player-data.js");
const leaderboardPath = path.join(root, "data", "leaderboard.json");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dataCode = fs.readFileSync(dataPath, "utf8");
const playerDataCode = fs.readFileSync(playerDataPath, "utf8");
const leaderboardData = JSON.parse(fs.readFileSync(leaderboardPath, "utf8"));
const context = { window: {} };

vm.createContext(context);
vm.runInContext(dataCode, context, { filename: dataPath });
vm.runInContext(playerDataCode, context, { filename: playerDataPath });

const data = context.window.DinoData;
if (!data) throw new Error("DinoData was not exposed on window.");
if (data.quizItems.length !== 50) throw new Error(`Expected 50 quiz items, found ${data.quizItems.length}.`);

const missingGuides = data.quizItems.filter((item) => !data.quizFieldGuide[item.slug]);
if (missingGuides.length) {
  throw new Error(`Missing field-guide entries: ${missingGuides.map((item) => item.slug).join(", ")}`);
}

const missingAssets = data.quizItems
  .map((item) => item.image)
  .filter((asset) => !fs.existsSync(path.join(root, asset)));
if (missingAssets.length) {
  throw new Error(`Missing quiz assets: ${missingAssets.join(", ")}`);
}

// Dead crop/view data should be gone (A4).
data.quizItems.forEach((item) => {
  if ("crop" in item || "view" in item) {
    throw new Error(`Quiz item ${item.slug} still carries removed crop/view fields.`);
  }
});

const playerData = context.window.DinoPlayerData;
if (!playerData) throw new Error("DinoPlayerData was not exposed on window.");
if (!Array.isArray(playerData.players)) throw new Error("DinoPlayerData.players must be an array.");
if (!Array.isArray(playerData.leaderboard)) throw new Error("DinoPlayerData.leaderboard must be an array.");
if (!Array.isArray(leaderboardData.players)) throw new Error("data/leaderboard.json players must be an array.");
if (!Array.isArray(leaderboardData.leaderboard)) throw new Error("data/leaderboard.json leaderboard must be an array.");

// Drift check (A2): the auto-generated player-data.js must mirror leaderboard.json.
assert.deepStrictEqual(
  playerData,
  leaderboardData,
  "js/player-data.js is out of sync with data/leaderboard.json — press Save Leaderboard to regenerate."
);

[
  'id="quizPlayerSelect"',
  'id="addExplorerBtn"',
  'id="manageExplorersBtn"',
  'id="explorerManagerList"'
].forEach((needle) => {
  if (!html.includes(needle)) throw new Error(`Missing explorer control: ${needle}.`);
});

const scriptOrder = [
  'src="js/data.js"',
  'src="js/player-data.js"',
  'src="js/helpers.js"',
  'src="js/store.js"',
  'src="js/quiz.js"',
  'src="js/builder.js"',
  'src="js/dna.js"',
  'src="js/gallery.js"',
  'src="js/app.js"'
].map((needle) => html.indexOf(needle));
if (scriptOrder.some((index) => index < 0) || scriptOrder.join() !== [...scriptOrder].sort((a, b) => a - b).join()) {
  throw new Error("Expected script load order: data, player-data, helpers, store, quiz, builder, dna, gallery, app.");
}

const cssManifest = fs.readFileSync(path.join(root, "styles.css"), "utf8");
["base-landing", "app-builder", "quiz", "gallery-print", "responsive", "celebrate", "certificate", "focus"].forEach((name) => {
  if (!cssManifest.includes(`css/${name}.css`)) throw new Error(`Missing CSS import for ${name}.`);
});

// --- Store tests (A1) --------------------------------------------------------

const storeModule = require("./js/store.js");
const { compareEntries, mergeProfiles, defaultProfile } = storeModule;

// compareEntries: score desc, accuracy desc, hints asc.
assert.deepStrictEqual(
  [
    { score: 10, accuracy: 50, hints: 0 },
    { score: 30, accuracy: 50, hints: 2 },
    { score: 30, accuracy: 90, hints: 1 },
    { score: 30, accuracy: 90, hints: 0 }
  ].sort(compareEntries).map((e) => `${e.score}/${e.accuracy}/${e.hints}`),
  ["30/90/0", "30/90/1", "30/50/2", "10/50/0"],
  "compareEntries ordering is wrong."
);

// mergeProfiles: scalars max, collections union.
const merged = mergeProfiles(
  { xp: 100, coins: 5, discovered: ["a", "b"], unlocks: ["x"], badges: { first: "2026-01-02" } },
  { xp: 60, coins: 12, discovered: ["b", "c"], unlocks: ["y"], badges: { first: "2026-01-01", second: "2026-01-03" } }
);
assert.strictEqual(merged.xp, 100, "mergeProfiles should take max xp.");
assert.strictEqual(merged.coins, 12, "mergeProfiles should take max coins.");
assert.deepStrictEqual(merged.discovered.sort(), ["a", "b", "c"], "mergeProfiles should union discovered.");
assert.deepStrictEqual(merged.unlocks.sort(), ["x", "y"], "mergeProfiles should union unlocks.");
assert.strictEqual(merged.badges.first, "2026-01-01", "mergeProfiles should keep earliest badge date.");
assert.ok(merged.badges.second, "mergeProfiles should keep both badges.");

// A fresh profile has all progression fields.
const fresh = defaultProfile();
["xp", "coins", "unlocks", "badges", "discovered", "redig", "playDates", "expeditions", "duels"].forEach((key) => {
  if (!(key in fresh)) throw new Error(`defaultProfile missing ${key}.`);
});

// Store instance: load (server unavailable in Node), mutate, dedupe, migrate.
function makeStore(seed) {
  const cache = {};
  return storeModule.createDinoStore({
    cleanPlayerName: (v) => String(v || "").replace(/[^\w \-'.]/g, "").replace(/\s+/g, " ").trim().slice(0, 18),
    readJsonStorage: (key, fallback) => (key in cache ? cache[key] : fallback),
    writeJsonStorage: (key, value) => { cache[key] = JSON.parse(JSON.stringify(value)); },
    seed,
    todayDisplay: () => "1/1/2026",
    todayISO: () => "2026-01-01"
  });
}

(async function storeInstanceTests() {
  // Legacy seed without version: players get backfilled from the board.
  const store = makeStore({
    players: [],
    leaderboard: [{ id: "seed-1", name: "Papi", score: 90, accuracy: 90, hints: 0, difficulty: "Easy" }]
  });
  await store.load();
  assert.ok(store.getPlayer("Papi"), "Player should be backfilled from a leaderboard entry.");
  assert.strictEqual(store.getLeaderboard().length, 1, "Leaderboard should contain the seed entry.");

  // addResult dedupes by id and keeps sorted order.
  store.addResult({ id: "r-1", name: "Zoe", score: 50, accuracy: 60, hints: 1, difficulty: "Easy" });
  store.addResult({ id: "r-1", name: "Zoe", score: 50, accuracy: 60, hints: 1, difficulty: "Easy" });
  assert.strictEqual(store.getLeaderboard().filter((e) => e.id === "r-1").length, 1, "addResult should dedupe by id.");
  assert.strictEqual(store.getLeaderboard()[0].name, "Papi", "Top entry should be the highest score.");

  // Profile mutations.
  assert.strictEqual(store.discover("Zoe", "tyrannosaurus"), true, "First discovery returns true.");
  assert.strictEqual(store.discover("Zoe", "tyrannosaurus"), false, "Repeat discovery returns false.");
  assert.strictEqual(store.awardBadge("Zoe", "first-dig"), true, "First badge award returns true.");
  assert.strictEqual(store.awardBadge("Zoe", "first-dig"), false, "Repeat badge award returns false.");
  store.addXp("Zoe", 120);
  assert.strictEqual(store.getPlayer("Zoe").profile.xp, 120, "addXp accumulates.");
  store.addCoins("Zoe", 10);
  assert.strictEqual(store.spendCoins("Zoe", 4), true, "spendCoins succeeds when affordable.");
  assert.strictEqual(store.spendCoins("Zoe", 999), false, "spendCoins fails when too expensive.");
  assert.strictEqual(store.getPlayer("Zoe").profile.coins, 6, "coins reflect spend.");

  // removePlayer clears their board entries too.
  store.removePlayer("Zoe");
  assert.strictEqual(store.getPlayer("Zoe"), null, "removePlayer removes the player.");
  assert.strictEqual(store.getLeaderboard().some((e) => e.name === "Zoe"), false, "removePlayer clears board entries.");
})().then(() => {
  console.log("dino-quiz smoke test passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
