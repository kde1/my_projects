const colors = [
  { name: "Bubblegum", value: "#f84fa7" },
  { name: "Sky", value: "#37a7ff" },
  { name: "Mint", value: "#34c989" },
  { name: "Sunshine", value: "#ffc738" },
  { name: "Lilac", value: "#a874ff" },
  { name: "Coral", value: "#ff735c" },
  { name: "Teal", value: "#23b9b0" },
  { name: "Cherry", value: "#dd2d4a" }
];

const themes = [
  "Royal Candy Runway",
  "Pop Star Sleepover",
  "Magical Garden Party",
  "Rainbow Red Carpet",
  "Cozy Winter Sparkle",
  "Beach Birthday Bash"
];

const closet = {
  hair: [
    { name: "Chocolate Bob", color: "#5a3525", shape: "bob" },
    { name: "Blonde Buns", color: "#f4c85f", shape: "buns" },
    { name: "Pink Ponytail", color: "#fa5ba9", shape: "ponytail" },
    { name: "Black Waves", color: "#27202b", shape: "bob" },
    { name: "Aqua Curls", color: "#32bfd0", shape: "buns" },
    { name: "Purple Ponytail", color: "#8963e8", shape: "ponytail" }
  ],
  tops: [
    { name: "Heart Tee", color: "#ff5ba7", accent: "#ffe369", shape: "tee" },
    { name: "Star Jacket", color: "#45c8be", accent: "#f8f1ff", shape: "jacket" },
    { name: "Cloud Sweater", color: "#89bfff", accent: "#ffffff", shape: "sweater" },
    { name: "Sparkle Blouse", color: "#ffe369", accent: "#ff7cc2", shape: "sparkle" },
    { name: "Lavender Hoodie", color: "#a874ff", accent: "#e9dcff", shape: "sweater" },
    { name: "Cherry Cardigan", color: "#dd2d4a", accent: "#ffd7ec", shape: "jacket" }
  ],
  bottoms: [
    { name: "Tutu Skirt", color: "#ff93c7", shape: "skirt" },
    { name: "Jeans", color: "#4f80d9", shape: "pants" },
    { name: "Royal Dress", color: "#a874ff", shape: "dress" },
    { name: "Sun Dress", color: "#ffc738", shape: "dress" },
    { name: "Mint Shorts", color: "#34c989", shape: "pants" },
    { name: "Red Carpet Skirt", color: "#dd2d4a", shape: "skirt" }
  ],
  shoes: [
    { name: "Glitter Boots", color: "#f84fa7", shape: "shoes" },
    { name: "Comfy Sneakers", color: "#37a7ff", shape: "shoes" },
    { name: "Golden Flats", color: "#ffc738", shape: "shoes" },
    { name: "Mint Sandals", color: "#23b9b0", shape: "shoes" },
    { name: "Lilac Heels", color: "#a874ff", shape: "shoes" },
    { name: "Cherry Boots", color: "#dd2d4a", shape: "shoes" }
  ],
  accessories: [
    { name: "Tiny Crown", color: "#ffd83d", shape: "crown" },
    { name: "Big Bow", color: "#f84fa7", shape: "bow" },
    { name: "Heart Glasses", color: "#2d2530", shape: "glasses" },
    { name: "Mini Bag", color: "#23b9b0", shape: "bag" },
    { name: "Star Crown", color: "#a874ff", shape: "crown" },
    { name: "Candy Bow", color: "#ffc738", shape: "bow" }
  ],
  extras: [
    { name: "Pearl Glow", color: "#fff4fd", accent: "#f84fa7" },
    { name: "Rainbow Glow", color: "#e8fbff", accent: "#23b9b0" },
    { name: "Golden Glow", color: "#fff5c1", accent: "#ffc738" },
    { name: "Lilac Glow", color: "#f2eaff", accent: "#a874ff" }
  ]
};

const state = {
  playerCount: 2,
  activePlayer: 0,
  activeCategory: "hair",
  players: [],
  timerId: null,
  secondsLeft: 300
};

const defaultOutfit = () => ({
  hair: 0,
  tops: 0,
  bottoms: 0,
  shoes: 0,
  accessories: 0,
  extras: 0
});

const setupScreen = document.querySelector("#setupScreen");
const gameScreen = document.querySelector("#gameScreen");
const voteScreen = document.querySelector("#voteScreen");
const playersPanel = document.querySelector("#playersPanel");
const playerTemplate = document.querySelector("#playerFormTemplate");
const setupError = document.querySelector("#setupError");
const playerRail = document.querySelector("#playerRail");
const avatar = document.querySelector("#avatar");
const categoryTabs = document.querySelector("#categoryTabs");
const closetGrid = document.querySelector("#closetGrid");
const activePlayerName = document.querySelector("#activePlayerName");
const outfitSummary = document.querySelector("#outfitSummary");
const timerText = document.querySelector("#timerText");
const voteCards = document.querySelector("#voteCards");
const ballots = document.querySelector("#ballots");
const winnerBox = document.querySelector("#winnerBox");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showScreen(screen) {
  [setupScreen, gameScreen, voteScreen].forEach((item) => item.classList.remove("is-active"));
  screen.classList.add("is-active");
}

function renderPlayerForms() {
  playersPanel.innerHTML = "";
  const selectedColors = state.players.map((player) => player.color);

  for (let index = 0; index < state.playerCount; index += 1) {
    const saved = state.players[index] || {};
    const node = playerTemplate.content.firstElementChild.cloneNode(true);
    const input = node.querySelector("input");
    input.value = saved.name || `Player ${index + 1}`;
    input.addEventListener("input", () => {
      ensurePlayer(index).name = input.value.trim();
    });

    const colorChoices = node.querySelector(".color-choices");
    colors.forEach((color) => {
      const takenByOther = selectedColors.includes(color.value) && saved.color !== color.value;
      const button = document.createElement("button");
      button.className = "color-dot";
      button.type = "button";
      button.title = color.name;
      button.setAttribute("aria-label", color.name);
      button.style.setProperty("--dot", color.value);
      button.disabled = takenByOther;
      button.classList.toggle("is-selected", saved.color === color.value);
      button.addEventListener("click", () => {
        ensurePlayer(index).color = color.value;
        renderPlayerForms();
      });
      colorChoices.appendChild(button);
    });

    playersPanel.appendChild(node);
  }
}

function ensurePlayer(index) {
  if (!state.players[index]) {
    state.players[index] = {
      name: `Player ${index + 1}`,
      color: colors[index].value,
      outfit: defaultOutfit()
    };
  }
  return state.players[index];
}

function setPlayerCount(count) {
  state.playerCount = count;
  state.players = state.players.slice(0, count);
  for (let index = 0; index < count; index += 1) ensurePlayer(index);
  document.querySelectorAll("#playerCountButtons button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.count) === count);
  });
  renderPlayerForms();
}

function validateSetup() {
  const players = state.players.slice(0, state.playerCount);
  const names = players.map((player, index) => player.name || `Player ${index + 1}`);
  const colorValues = players.map((player) => player.color);
  if (players.length < 2 || players.length > 4) return "Choose 2, 3, or 4 players.";
  if (names.some((name) => !name.trim())) return "Every player needs a nickname.";
  if (new Set(colorValues).size !== players.length) return "Every player needs a different color.";
  return "";
}

function startGame() {
  const error = validateSetup();
  setupError.textContent = error;
  if (error) return;
  state.players = state.players.slice(0, state.playerCount).map((player, index) => ({
    ...player,
    name: player.name || `Player ${index + 1}`,
    outfit: player.outfit || defaultOutfit()
  }));
  state.activePlayer = 0;
  state.activeCategory = "hair";
  state.secondsLeft = 300;
  document.querySelector("#themeTitle").textContent = themes[Math.floor(Math.random() * themes.length)];
  showScreen(gameScreen);
  renderGame();
  startTimer();
}

function startTimer() {
  clearInterval(state.timerId);
  updateTimer();
  state.timerId = setInterval(() => {
    state.secondsLeft -= 1;
    updateTimer();
    if (state.secondsLeft <= 0) finishRound();
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(Math.max(0, state.secondsLeft) / 60);
  const seconds = String(Math.max(0, state.secondsLeft) % 60).padStart(2, "0");
  timerText.textContent = `${minutes}:${seconds}`;
}

function finishRound() {
  clearInterval(state.timerId);
  renderVoting();
  showScreen(voteScreen);
}

function activePlayer() {
  return state.players[state.activePlayer];
}

function renderGame() {
  renderPlayerRail();
  renderCategoryTabs();
  renderCloset();
  renderAvatar(avatar, activePlayer(), false);
  renderCaption();
}

function renderPlayerRail() {
  playerRail.innerHTML = state.players.map((player, index) => `
    <button class="player-tab ${index === state.activePlayer ? "is-active" : ""}" type="button" data-player="${index}">
      <span class="player-swatch" style="--player-color:${player.color}"></span>
      <span>${escapeHtml(player.name)}</span>
    </button>
  `).join("");
  playerRail.querySelectorAll(".player-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePlayer = Number(button.dataset.player);
      renderGame();
    });
  });
}

function renderCategoryTabs() {
  categoryTabs.innerHTML = Object.keys(closet).map((category) => `
    <button class="category-tab ${category === state.activeCategory ? "is-active" : ""}" type="button" data-category="${category}" role="tab" aria-selected="${category === state.activeCategory}">
      ${escapeHtml(category)}
    </button>
  `).join("");
  categoryTabs.querySelectorAll(".category-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      renderCategoryTabs();
      renderCloset();
    });
  });
}

function renderCloset() {
  const player = activePlayer();
  const category = state.activeCategory;
  closetGrid.innerHTML = closet[category].map((item, index) => `
    <button class="closet-item ${player.outfit[category] === index ? "is-selected" : ""}" type="button" data-index="${index}">
      <span class="item-preview ${item.shape || ""}" style="--item-color:${item.color}"></span>
      <b>${escapeHtml(item.name)}</b>
    </button>
  `).join("");
  closetGrid.querySelectorAll(".closet-item").forEach((button) => {
    button.addEventListener("click", () => {
      player.outfit[category] = Number(button.dataset.index);
      renderCloset();
      renderAvatar(avatar, player, false);
      renderCaption();
    });
  });
}

function outfitItem(player, category) {
  return closet[category][player.outfit[category]];
}

function renderAvatar(target, player, compact) {
  const hair = outfitItem(player, "hair");
  const top = outfitItem(player, "tops");
  const bottom = outfitItem(player, "bottoms");
  const shoes = outfitItem(player, "shoes");
  const accessory = outfitItem(player, "accessories");
  const extra = outfitItem(player, "extras");
  target.style.setProperty("--hair", hair.color);
  target.style.setProperty("--top", top.color);
  target.style.setProperty("--bottom", bottom.color);
  target.style.setProperty("--shoes", shoes.color);
  target.style.setProperty("--accent", accessory.color || top.accent || player.color);
  target.style.background = `radial-gradient(circle at 50% 48%, ${extra.color}, transparent 58%)`;
  target.innerHTML = `
    <span class="avatar-part hair ${hair.shape}"></span>
    <span class="avatar-part head"></span>
    <span class="avatar-part neck"></span>
    <span class="avatar-part arms"></span>
    <span class="avatar-part top ${top.shape}"></span>
    <span class="avatar-part bottom ${bottom.shape}"></span>
    <span class="avatar-part legs"></span>
    <span class="avatar-part shoes"></span>
    <span class="avatar-part accessory ${accessory.shape}"></span>
  `;
  target.setAttribute("aria-label", `${player.name}'s outfit${compact ? " for voting" : ""}`);
}

function renderCaption() {
  const player = activePlayer();
  activePlayerName.textContent = player.name;
  outfitSummary.textContent = [
    outfitItem(player, "hair").name,
    outfitItem(player, "tops").name,
    outfitItem(player, "bottoms").name,
    outfitItem(player, "shoes").name,
    outfitItem(player, "accessories").name
  ].join(" + ");
}

function randomOutfit() {
  const player = activePlayer();
  Object.keys(closet).forEach((category) => {
    player.outfit[category] = Math.floor(Math.random() * closet[category].length);
  });
  renderGame();
}

function renderVoting() {
  winnerBox.innerHTML = "";
  voteCards.innerHTML = "";
  state.players.forEach((player) => {
    const card = document.createElement("article");
    card.className = "vote-card";
    card.innerHTML = `<div class="avatar"></div><h2>${escapeHtml(player.name)}</h2>`;
    renderAvatar(card.querySelector(".avatar"), player, true);
    voteCards.appendChild(card);
  });

  ballots.innerHTML = state.players.map((player, index) => `
    <div class="ballot">
      <label>
        ${escapeHtml(player.name)} votes for
        <select data-voter="${index}">
          <option value="">Choose a player</option>
          ${state.players.map((candidate, candidateIndex) => candidateIndex === index ? "" : `<option value="${candidateIndex}">${escapeHtml(candidate.name)}</option>`).join("")}
        </select>
      </label>
    </div>
  `).join("");
}

function showWinner() {
  const votes = Array.from(ballots.querySelectorAll("select")).map((select) => select.value);
  if (votes.some((vote) => vote === "")) {
    winnerBox.textContent = "Every player needs to vote before the winner is shown.";
    return;
  }
  const totals = state.players.map(() => 0);
  votes.forEach((vote) => {
    totals[Number(vote)] += 1;
  });
  const highest = Math.max(...totals);
  const winners = totals
    .map((total, index) => total === highest ? state.players[index].name : null)
    .filter(Boolean);
  winnerBox.innerHTML = winners.length === 1
    ? `<strong>${escapeHtml(winners[0])} wins!</strong><br>Final score: ${totals.join(" - ")}`
    : `<strong>It's a tie!</strong><br>${escapeHtml(winners.join(" and "))} share the crown. Final score: ${totals.join(" - ")}`;
}

document.querySelectorAll("#playerCountButtons button").forEach((button) => {
  button.addEventListener("click", () => setPlayerCount(Number(button.dataset.count)));
});

document.querySelector("#startGameBtn").addEventListener("click", startGame);
document.querySelector("#finishEarlyBtn").addEventListener("click", finishRound);
document.querySelector("#randomOutfitBtn").addEventListener("click", randomOutfit);
document.querySelector("#showWinnerBtn").addEventListener("click", showWinner);
document.querySelector("#newRoundBtn").addEventListener("click", () => {
  clearInterval(state.timerId);
  showScreen(setupScreen);
});

setPlayerCount(2);
