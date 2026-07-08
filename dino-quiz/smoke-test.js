const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const dataPath = path.join(root, "js", "data.js");
const playerDataPath = path.join(root, "js", "player-data.js");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dataCode = fs.readFileSync(dataPath, "utf8");
const playerDataCode = fs.readFileSync(playerDataPath, "utf8");
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

const playerData = context.window.DinoPlayerData;
if (!playerData) throw new Error("DinoPlayerData was not exposed on window.");
if (!Array.isArray(playerData.players)) throw new Error("DinoPlayerData.players must be an array.");
if (!Array.isArray(playerData.leaderboard)) throw new Error("DinoPlayerData.leaderboard must be an array.");

const scriptOrder = [
  'src="js/data.js"',
  'src="js/player-data.js"',
  'src="js/quiz.js"',
  'src="script.js"'
].map((needle) => html.indexOf(needle));
if (scriptOrder.some((index) => index < 0) || scriptOrder.join() !== [...scriptOrder].sort((a, b) => a - b).join()) {
  throw new Error("Expected script load order: js/data.js, js/player-data.js, js/quiz.js, script.js.");
}

const cssManifest = fs.readFileSync(path.join(root, "styles.css"), "utf8");
["base-landing", "app-builder", "quiz", "gallery-print", "responsive", "focus"].forEach((name) => {
  if (!cssManifest.includes(`css/${name}.css`)) throw new Error(`Missing CSS import for ${name}.`);
});

console.log("dino-quiz smoke test passed");
