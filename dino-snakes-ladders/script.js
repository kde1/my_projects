const board = document.querySelector("#board");
const trackSvg = document.querySelector("#trackSvg");
const rollButton = document.querySelector("#rollButton");
const dieFace = document.querySelector("#dieFace");
const message = document.querySelector("#message");
const playersEl = document.querySelector("#players");
const turnPill = document.querySelector("#turnPill");
const resetButton = document.querySelector("#resetButton");
const twoPlayerButton = document.querySelector("#twoPlayerButton");

const terrain = {
  4: "V", 9: "F", 14: "B", 19: "E", 24: "T", 29: "F", 34: "B", 39: "V", 44: "E", 49: "T",
  54: "F", 59: "B", 64: "V", 69: "E", 74: "T", 79: "F", 84: "B", 89: "V", 94: "E", 100: "N"
};

const jumps = {
  3: 22,
  8: 30,
  17: 47,
  28: 55,
  40: 62,
  58: 77,
  70: 91,
  97: 79,
  88: 53,
  76: 45,
  65: 42,
  52: 31,
  43: 18,
  35: 12,
  25: 6
};

const jumpNames = {
  3: "a baby brachiosaurus neck",
  8: "a stack of fossil ribs",
  17: "a vine ladder",
  28: "a friendly stegosaurs tail",
  40: "a cliff of dino footprints",
  58: "a pterosaur updraft",
  70: "a golden bone bridge",
  97: "a slippery tar pit",
  88: "a spinosaurus splash zone",
  76: "a crumbling volcano path",
  65: "a sneaky raptor trail",
  52: "a mudslide",
  43: "a tyrannosaur scare",
  35: "a broken egg detour",
  25: "a fern-covered sinkhole"
};

const playerSets = [
  [
    { name: "Amber", mark: "A", position: 1 },
    { name: "Blue", mark: "B", position: 1 }
  ],
  [
    { name: "Amber", mark: "A", position: 1 },
    { name: "Rex Bot", mark: "R", position: 1, bot: true }
  ]
];

let players = clonePlayers(playerSets[1]);
let currentPlayer = 0;
let busy = false;
let gameOver = false;

function clonePlayers(source) {
  return source.map((player) => ({ ...player }));
}

function cellPosition(square) {
  const rowFromBottom = Math.floor((square - 1) / 10);
  const row = 9 - rowFromBottom;
  const index = (square - 1) % 10;
  const col = rowFromBottom % 2 === 0 ? index : 9 - index;
  return { row, col, x: col * 10 + 5, y: row * 10 + 5 };
}

function buildBoard() {
  board.innerHTML = "";
  const cellsByGrid = [];
  for (let square = 1; square <= 100; square += 1) {
    const pos = cellPosition(square);
    cellsByGrid[pos.row * 10 + pos.col] = square;
  }

  cellsByGrid.forEach((square) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.square = square;
    if (square === 100) cell.classList.add("is-nest");
    if (jumps[square] > square) cell.classList.add("is-ladder");
    if (jumps[square] < square) cell.classList.add("is-slide");
    cell.innerHTML = `<span class="num">${square}</span><span class="terrain">${terrain[square] || ""}</span>`;
    board.appendChild(cell);
  });

  players.forEach((player, index) => {
    const token = document.createElement("div");
    token.className = "token";
    token.dataset.player = index;
    token.textContent = player.mark;
    board.appendChild(token);
  });

  drawConnectors();
  render();
}

function drawConnectors() {
  trackSvg.innerHTML = "";
  Object.entries(jumps).forEach(([fromText, to]) => {
    const from = Number(fromText);
    const start = cellPosition(from);
    const end = cellPosition(to);
    if (to > from) drawLadder(start, end);
    else drawSlide(start, end);
  });
}

function svgLine(x1, y1, x2, y2, className) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", className);
  trackSvg.appendChild(line);
}

function drawLadder(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (-dy / length) * 1.7;
  const offsetY = (dx / length) * 1.7;
  svgLine(start.x * 10 - offsetX * 10, start.y * 10 - offsetY * 10, end.x * 10 - offsetX * 10, end.y * 10 - offsetY * 10, "connector-ladder");
  svgLine(start.x * 10 + offsetX * 10, start.y * 10 + offsetY * 10, end.x * 10 + offsetX * 10, end.y * 10 + offsetY * 10, "connector-ladder");
  for (let step = 1; step < 6; step += 1) {
    const t = step / 6;
    const x = (start.x + dx * t) * 10;
    const y = (start.y + dy * t) * 10;
    svgLine(x - offsetX * 19, y - offsetY * 19, x + offsetX * 19, y + offsetY * 19, "connector-ladder-rung");
  }
}

function drawSlide(start, end) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const hi = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const midX = (start.x + end.x) * 5;
  const midY = (start.y + end.y) * 5;
  const d = `M ${start.x * 10} ${start.y * 10} Q ${midX + 55} ${midY - 20} ${end.x * 10} ${end.y * 10}`;
  path.setAttribute("d", d);
  path.setAttribute("class", "connector-slide");
  hi.setAttribute("d", d);
  hi.setAttribute("class", "connector-slide-highlight");
  trackSvg.append(path, hi);
}

function render() {
  players.forEach((player, index) => {
    const token = board.querySelector(`.token[data-player="${index}"]`);
    const pos = cellPosition(player.position);
    const crowdOffset = index === 0 ? -1.8 : 1.8;
    token.style.left = `${pos.col * 10 + 5 + crowdOffset}%`;
    token.style.top = `${pos.row * 10 + 5}%`;
  });

  playersEl.innerHTML = players.map((player, index) => `
    <article class="player-card ${index === currentPlayer && !gameOver ? "is-active" : ""}" data-player="${index}">
      <span class="player-chip">${player.mark}</span>
      <div>
        <div class="player-name">${player.name}</div>
        <div class="player-pos">Square ${player.position}</div>
      </div>
      <b>${index === currentPlayer && !gameOver ? "Turn" : ""}</b>
    </article>
  `).join("");

  const active = players[currentPlayer];
  turnPill.textContent = gameOver ? "Hatchery reached" : `${active.name}'s turn`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function roll() {
  if (busy || gameOver) return;
  busy = true;
  rollButton.disabled = true;
  const player = players[currentPlayer];
  message.textContent = `${player.name} shakes the fossil die...`;

  let result = 1;
  for (let i = 0; i < 10; i += 1) {
    result = Math.floor(Math.random() * 6) + 1;
    dieFace.textContent = result;
    await sleep(54);
  }

  await movePlayer(player, result);
  if (!gameOver) nextTurn();
  busy = false;
  rollButton.disabled = false;

  if (!gameOver && players[currentPlayer].bot) {
    await sleep(650);
    roll();
  }
}

async function movePlayer(player, steps) {
  const target = player.position + steps;
  if (target > 100) {
    message.textContent = `${player.name} rolled ${steps}, but needs an exact path to nest 100.`;
    return;
  }

  message.textContent = `${player.name} rolled ${steps}.`;
  while (player.position < target) {
    player.position += 1;
    bounceToken(currentPlayer);
    render();
    await sleep(185);
  }

  if (player.position === 100) {
    gameOver = true;
    message.textContent = `${player.name} reaches the hatchery and wins the Dino Ladders race.`;
    render();
    return;
  }

  if (jumps[player.position]) {
    const from = player.position;
    const to = jumps[from];
    const up = to > from;
    message.textContent = up
      ? `${player.name} climbs ${jumpNames[from]} to square ${to}.`
      : `${player.name} hits ${jumpNames[from]} and slides to square ${to}.`;
    await sleep(520);
    player.position = to;
    bounceToken(currentPlayer);
    render();
    await sleep(320);
  }
}

function bounceToken(index) {
  const token = board.querySelector(`.token[data-player="${index}"]`);
  token.classList.add("is-jumping");
  setTimeout(() => token.classList.remove("is-jumping"), 170);
}

function nextTurn() {
  currentPlayer = (currentPlayer + 1) % players.length;
  render();
}

function resetGame(nextPlayers = players) {
  players = clonePlayers(nextPlayers).map((player) => ({ ...player, position: 1 }));
  currentPlayer = 0;
  gameOver = false;
  busy = false;
  dieFace.textContent = "1";
  message.textContent = `${players[0].name} starts at the fossil gate.`;
  buildBoard();
}

rollButton.addEventListener("click", roll);
resetButton.addEventListener("click", () => resetGame(players));
twoPlayerButton.addEventListener("click", () => {
  const isTwoPlayer = players.every((player) => !player.bot);
  resetGame(isTwoPlayer ? playerSets[1] : playerSets[0]);
  twoPlayerButton.textContent = isTwoPlayer ? "Two players" : "Play bot";
});

buildBoard();
