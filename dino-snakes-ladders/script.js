const board = document.querySelector("#board");
const trackSvg = document.querySelector("#trackSvg");
const rollButton = document.querySelector("#rollButton");
const dieFace = document.querySelector("#dieFace");
const message = document.querySelector("#message");
const playersEl = document.querySelector("#players");
const turnPill = document.querySelector("#turnPill");
const resetButton = document.querySelector("#resetButton");
const twoPlayerButton = document.querySelector("#twoPlayerButton");

const dinoImages = [
  "quiz-tyrannosaurus.png",
  "quiz-triceratops.png",
  "quiz-stegosaurus.png",
  "quiz-brachiosaurus.png",
  "quiz-velociraptor.png",
  "quiz-spinosaurus.png",
  "quiz-ankylosaurus.png",
  "quiz-parasaurolophus.png",
  "quiz-allosaurus.png",
  "quiz-diplodocus.png",
  "quiz-carnotaurus.png",
  "quiz-iguanodon.png",
  "quiz-pachycephalosaurus.png",
  "quiz-therizinosaurus.png",
  "quiz-giganotosaurus.png",
  "quiz-maiasaura.png",
  "quiz-styracosaurus.png",
  "quiz-baryonyx.png",
  "quiz-apatosaurus.png",
  "quiz-dilophosaurus.png"
];

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
  8: "a tall apatosaurus neck",
  17: "a gentle diplodocus neck",
  28: "a friendly brachiosaurus neck",
  40: "a leafy sauropod neck",
  58: "a lookout dinosaur neck",
  70: "a golden longneck",
  97: "a sweeping tyrannosaur tail",
  88: "a slippery spinosaurus tail",
  76: "a curling allosaurus tail",
  65: "a sneaky raptor tail",
  52: "a muddy dinosaur tail",
  43: "a swinging tyrannosaur tail",
  35: "a heavy stegosaurus tail",
  25: "a fern-covered dinosaur tail"
};

const playerSets = [
  [
    { name: "Carnotaurus", mark: "C", avatar: "../dino-builder/assets/quiz-carnotaurus.png", position: 1 },
    { name: "Mosasaurus", mark: "M", avatar: "assets/avatar-mosasaurus.png", position: 1 }
  ],
  [
    { name: "Carnotaurus", mark: "C", avatar: "../dino-builder/assets/quiz-carnotaurus.png", position: 1 },
    { name: "Mosasaurus Bot", mark: "M", avatar: "assets/avatar-mosasaurus.png", position: 1, bot: true }
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
    const dinoImage = dinoImages[(square - 1) % dinoImages.length];
    cell.className = "cell";
    cell.dataset.square = square;
    if (square === 100) cell.classList.add("is-nest");
    if (jumps[square] > square) cell.classList.add("is-ladder");
    if (jumps[square] < square) cell.classList.add("is-slide");
    cell.innerHTML = `
      <span class="num">${square}</span>
      <img class="square-dino" src="../dino-builder/assets/${dinoImage}" alt="" aria-hidden="true">
    `;
    board.appendChild(cell);
  });

  players.forEach((player, index) => {
    const token = document.createElement("div");
    token.className = "token";
    token.dataset.player = index;
    token.innerHTML = `<img src="${player.avatar}" alt="${player.name}">`;
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
    if (to > from) drawNeck(start, end);
    else drawTail(start, end);
  });
}

function drawNeck(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const midX = (start.x + dx * .48) * 10;
  const midY = (start.y + dy * .48) * 10;
  const bend = dx >= 0 ? 42 : -42;
  const d = `M ${start.x * 10} ${start.y * 10} Q ${midX + bend} ${midY} ${end.x * 10} ${end.y * 10}`;
  const neck = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const belly = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  const eye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  neck.setAttribute("d", d);
  neck.setAttribute("class", "connector-neck");
  belly.setAttribute("d", d);
  belly.setAttribute("class", "connector-neck-highlight");
  head.setAttribute("cx", end.x * 10);
  head.setAttribute("cy", end.y * 10 - 16);
  head.setAttribute("rx", 28);
  head.setAttribute("ry", 18);
  head.setAttribute("class", "connector-neck-head");
  eye.setAttribute("cx", end.x * 10 + 8);
  eye.setAttribute("cy", end.y * 10 - 21);
  eye.setAttribute("r", 3.5);
  eye.setAttribute("class", "connector-eye");
  trackSvg.append(neck, belly, head, eye);
}

function drawTail(start, end) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const hi = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const tip = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  const midX = (start.x + end.x) * 5;
  const midY = (start.y + end.y) * 5;
  const d = `M ${start.x * 10} ${start.y * 10} Q ${midX + 55} ${midY - 20} ${end.x * 10} ${end.y * 10}`;
  path.setAttribute("d", d);
  path.setAttribute("class", "connector-tail");
  hi.setAttribute("d", d);
  hi.setAttribute("class", "connector-tail-highlight");
  tip.setAttribute("cx", end.x * 10);
  tip.setAttribute("cy", end.y * 10);
  tip.setAttribute("r", 10);
  tip.setAttribute("class", "connector-tail-tip");
  trackSvg.append(path, hi, tip);
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
      <span class="player-chip"><img src="${player.avatar}" alt="${player.name}"></span>
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
      ? `${player.name} climbs up ${jumpNames[from]} to square ${to}.`
      : `${player.name} slides down ${jumpNames[from]} to square ${to}.`;
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
