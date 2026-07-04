const arena = document.querySelector("#arena");
const humanEl = document.querySelector("#human");
const foodEl = document.querySelector("#food");
const rexLayer = document.querySelector("#rexLayer");
const livesEl = document.querySelector("#lives");
const pointsEl = document.querySelector("#points");
const levelEl = document.querySelector("#level");
const messageEl = document.querySelector("#message");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const difficultySelect = document.querySelector("#difficultySelect");
const difficultyNote = document.querySelector("#difficultyNote");

const keys = new Set();
const difficultySettings = {
  1: { label: "Easy", baseRexes: 1, maxRexes: 1, speed: 7.2, foodPoints: 10, humanSpeed: 34 },
  2: { label: "Explorer", baseRexes: 1, maxRexes: 2, speed: 8.6, foodPoints: 20, humanSpeed: 33 },
  3: { label: "Hunter", baseRexes: 1, maxRexes: 3, speed: 10.2, foodPoints: 30, humanSpeed: 32 },
  4: { label: "Danger", baseRexes: 2, maxRexes: 4, speed: 11.8, foodPoints: 40, humanSpeed: 31 },
  5: { label: "Extinction", baseRexes: 2, maxRexes: 5, speed: 13.4, foodPoints: 50, humanSpeed: 30 }
};

const state = {
  running: false,
  lives: 3,
  points: 0,
  elapsed: 0,
  difficulty: 1,
  lastTime: 0,
  runId: 0,
  safeUntil: 0,
  human: { x: 50, y: 58, speed: 28 },
  food: { x: 73, y: 60 },
  foodActive: true,
  rexes: []
};

function arenaSize() {
  const rect = arena.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentDifficulty() {
  return difficultySettings[state.difficulty];
}

function rexCount() {
  const settings = currentDifficulty();
  const bonus = Math.floor(state.points / 220) + Math.floor(state.elapsed / 70);
  return Math.min(settings.maxRexes, settings.baseRexes + bonus);
}

function resetPositions() {
  state.human.x = 50;
  state.human.y = 58;
  state.human.speed = currentDifficulty().humanSpeed;
  const count = rexCount();
  const starts = [
    { x: 13, y: 17 },
    { x: 87, y: 21 },
    { x: 14, y: 82 },
    { x: 86, y: 78 },
    { x: 50, y: 15 },
    { x: 50, y: 88 }
  ];
  state.rexes = starts.slice(0, count).map((start, index) => ({
    ...start,
    speed: currentDifficulty().speed + index * .85 + Math.min(3, state.points * .012),
    drift: Math.random() * Math.PI * 2
  }));
  renderRexes();
  render();
}

function randomFoodPosition() {
  const size = arenaSize();
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = {
      x: 8 + Math.random() * 84,
      y: 12 + Math.random() * 76
    };
    const awayFromHuman = pixelDistance(candidate, state.human, size) > 120;
    const awayFromRexes = state.rexes.every((rex) => pixelDistance(candidate, rex, size) > 130);
    if (awayFromHuman && awayFromRexes) return candidate;
  }
  return { x: 12 + Math.random() * 76, y: 14 + Math.random() * 72 };
}

function spawnFood() {
  state.food = randomFoodPosition();
  state.foodActive = true;
  foodEl.classList.remove("is-collected");
  render();
}

function renderRexes() {
  rexLayer.innerHTML = state.rexes.map((_, index) => `<div class="rex" data-rex="${index}" aria-label="T-Rex hunter"></div>`).join("");
}

function render() {
  humanEl.style.left = `${state.human.x}%`;
  humanEl.style.top = `${state.human.y}%`;
  foodEl.style.left = `${state.food.x}%`;
  foodEl.style.top = `${state.food.y}%`;
  humanEl.classList.toggle("is-hit", performance.now() < state.safeUntil);

  state.rexes.forEach((rex, index) => {
    const el = rexLayer.querySelector(`[data-rex="${index}"]`);
    el.style.left = `${rex.x}%`;
    el.style.top = `${rex.y}%`;
    el.classList.toggle("face-left", rex.x > state.human.x);
  });

  livesEl.textContent = `Lives ${state.lives}`;
  pointsEl.textContent = `Points ${state.points}`;
  levelEl.textContent = `Difficulty ${state.difficulty}`;
  difficultySelect.value = String(state.difficulty);
  difficultyNote.textContent = `${currentDifficulty().label}: ${currentDifficulty().baseRexes}-${currentDifficulty().maxRexes} T-Rex hunters. Food gives ${currentDifficulty().foodPoints} points.`;
}

function startGame() {
  state.runId += 1;
  state.running = true;
  state.lives = 3;
  state.points = 0;
  state.elapsed = 0;
  state.difficulty = Number(difficultySelect.value);
  state.lastTime = performance.now();
  state.safeUntil = performance.now() + 1200;
  messageEl.classList.add("is-hidden");
  resetPositions();
  spawnFood();
  arena.focus();
  requestAnimationFrame((now) => tick(now, state.runId));
}

function loseLife() {
  state.lives -= 1;
  state.safeUntil = performance.now() + 1400;
  if (state.lives <= 0) {
    endGame();
    return;
  }
  resetPositions();
}

function endGame() {
  state.running = false;
  messageEl.classList.remove("is-hidden");
  messageEl.querySelector("h2").textContent = "The T-Rex caught the human";
  messageEl.querySelector("p").textContent = `You collected ${state.points} points. Press Start to try again.`;
  startButton.textContent = "Start again";
  render();
}

function moveHuman(delta) {
  let xMove = 0;
  let yMove = 0;
  if (keys.has("ArrowLeft")) xMove -= 1;
  if (keys.has("ArrowRight")) xMove += 1;
  if (keys.has("ArrowUp")) yMove -= 1;
  if (keys.has("ArrowDown")) yMove += 1;
  if (!xMove && !yMove) return;

  const length = Math.hypot(xMove, yMove);
  state.human.x = clamp(state.human.x + (xMove / length) * state.human.speed * delta, 3, 97);
  state.human.y = clamp(state.human.y + (yMove / length) * state.human.speed * delta, 8, 93);
}

function nudgeHuman(key) {
  const amount = 2.4;
  if (key === "ArrowLeft") state.human.x = clamp(state.human.x - amount, 3, 97);
  if (key === "ArrowRight") state.human.x = clamp(state.human.x + amount, 3, 97);
  if (key === "ArrowUp") state.human.y = clamp(state.human.y - amount, 8, 93);
  if (key === "ArrowDown") state.human.y = clamp(state.human.y + amount, 8, 93);
  render();
}

function moveRexes(delta) {
  state.rexes.forEach((rex) => {
    const dx = state.human.x - rex.x;
    const dy = state.human.y - rex.y;
    const distance = Math.hypot(dx, dy) || 1;
    const wobbleX = Math.cos(rex.drift + state.elapsed * 2) * .55;
    const wobbleY = Math.sin(rex.drift + state.elapsed * 2) * .55;
    rex.x = clamp(rex.x + ((dx / distance) * rex.speed + wobbleX) * delta, 4, 96);
    rex.y = clamp(rex.y + ((dy / distance) * rex.speed + wobbleY) * delta, 9, 92);
  });
}

function pixelDistance(a, b, size = arenaSize()) {
  const dx = (a.x - b.x) / 100 * size.width;
  const dy = (a.y - b.y) / 100 * size.height;
  return Math.hypot(dx, dy);
}

function checkCaught() {
  if (performance.now() < state.safeUntil) return false;
  const size = arenaSize();
  return state.rexes.some((rex) => pixelDistance(state.human, rex, size) < Math.min(42, size.width * .058));
}

function checkFood() {
  if (!state.foodActive || pixelDistance(state.human, state.food) > 34) return;
  state.foodActive = false;
  state.points += currentDifficulty().foodPoints;
  foodEl.classList.add("is-collected");
  setTimeout(spawnFood, 140);
}

function tick(now, runId) {
  if (!state.running || runId !== state.runId) return;
  const delta = Math.min(.033, (now - state.lastTime) / 1000);
  state.lastTime = now;
  state.elapsed += delta;

  const previousCount = state.rexes.length;
  moveHuman(delta);
  moveRexes(delta);
  checkFood();
  if (rexCount() !== previousCount) {
    const oldLives = state.lives;
    resetPositions();
    state.lives = oldLives;
  }

  if (checkCaught()) loseLife();
  render();
  requestAnimationFrame((nextNow) => tick(nextNow, runId));
}

window.addEventListener("keydown", (event) => {
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    keys.add(event.key);
    if (state.running) nudgeHuman(event.key);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
arena.addEventListener("click", () => arena.focus());
difficultySelect.addEventListener("change", () => {
  state.difficulty = Number(difficultySelect.value);
  const oldLives = state.lives;
  resetPositions();
  state.lives = oldLives;
  spawnFood();
});

resetPositions();
spawnFood();
