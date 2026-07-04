const movements = [
  {
    id: "impressionism",
    name: "Impressionism",
    date: "France, 1870s",
    map: { left: 43, top: 32 },
    color: "#80b7d9",
    className: "art-impressionism",
    summary: "Artists painted quick flashes of light, weather, water, and everyday life. Up close the brush marks look loose; far away they shimmer together.",
    facts: [
      ["Look for", "Visible dabs of color and outdoor scenes"],
      ["Artists", "Claude Monet, Berthe Morisot, Pierre-Auguste Renoir"],
      ["Big idea", "Capture a moment before the light changes"]
    ],
    activity: {
      title: "Dot-Dash Garden",
      prompt: "Tap or drag to make tiny color marks. Try building a pond, sky, or flower field without drawing outlines.",
      tools: ["Water", "Sun", "Petal", "Leaf"]
    },
    quiz: {
      question: "Why do many Impressionist paintings look sparkly or blurry up close?",
      options: ["They use loose brush marks of color", "They are carved from stone", "They avoid outdoor light"],
      answer: 0
    }
  },
  {
    id: "surrealism",
    name: "Surrealism",
    date: "Europe and beyond, 1920s",
    map: { left: 39, top: 49 },
    color: "#e45f92",
    className: "art-surrealism",
    summary: "Surrealists mixed dreams, jokes, strange objects, and impossible scenes to make art feel like a puzzle from the sleeping mind.",
    facts: [
      ["Look for", "Unexpected objects in impossible places"],
      ["Artists", "Salvador Dali, Rene Magritte, Leonora Carrington"],
      ["Big idea", "Let dreams break ordinary rules"]
    ],
    activity: {
      title: "Dream Collage Machine",
      prompt: "Tap the canvas to drop odd dream objects. Make the scene impossible but still balanced.",
      tools: ["Clock", "Eye", "Moon", "Door"]
    },
    quiz: {
      question: "Which phrase best fits Surrealism?",
      options: ["Dream logic and surprising combinations", "Perfectly measured factory design", "Only comic-book dots"],
      answer: 0
    }
  },
  {
    id: "pop",
    name: "Pop Art",
    date: "US and UK, 1950s-1960s",
    map: { left: 19, top: 42 },
    color: "#d84e3b",
    className: "art-pop",
    summary: "Pop artists grabbed images from ads, comics, packaging, and celebrities, then made them loud, repeatable, and larger than life.",
    facts: [
      ["Look for", "Bold outlines, bright colors, repeated images"],
      ["Artists", "Andy Warhol, Roy Lichtenstein, Yayoi Kusama"],
      ["Big idea", "Turn popular culture into museum art"]
    ],
    activity: {
      title: "Comic Pop Poster",
      prompt: "Choose a sound bubble or dot stamp, then tap to make a poster that feels loud enough to shout.",
      tools: ["WOW", "Zap", "Dots", "Star"]
    },
    quiz: {
      question: "Pop Art often borrowed images from what?",
      options: ["Advertisements, comics, and everyday products", "Ancient cave shadows only", "Secret maps of rivers"],
      answer: 0
    }
  },
  {
    id: "ukiyo",
    name: "Japanese Prints",
    date: "Japan, 1600s-1800s",
    map: { left: 80, top: 37 },
    color: "#2066b2",
    className: "art-ukiyo",
    summary: "Ukiyo-e woodblock prints used crisp shapes, flat color, waves, actors, landscapes, and clever composition that later inspired European artists.",
    facts: [
      ["Look for", "Flat color, strong outlines, dramatic cropping"],
      ["Artists", "Hokusai, Hiroshige, Utamaro"],
      ["Big idea", "Make everyday scenes elegant and graphic"]
    ],
    activity: {
      title: "Wave Print Builder",
      prompt: "Drag to add curling wave lines and stamp a red sun. Keep shapes bold and clean.",
      tools: ["Wave", "Foam", "Sun", "Mountain"]
    },
    quiz: {
      question: "What printing method helped make many Japanese prints?",
      options: ["Woodblocks carved for each color", "Glowing computer screens", "Spray paint on trains"],
      answer: 0
    }
  },
  {
    id: "islamic",
    name: "Islamic Geometric Art",
    date: "Middle East, North Africa, Spain, 700s onward",
    map: { left: 55, top: 55 },
    color: "#2f8a6d",
    className: "art-islamic",
    summary: "Artists built stunning patterns from circles, stars, tiles, and repeating symmetry, often decorating mosques, books, ceramics, and architecture.",
    facts: [
      ["Look for", "Stars, tessellations, symmetry, interlacing lines"],
      ["Places", "Cordoba, Cairo, Isfahan, Istanbul"],
      ["Big idea", "Use geometry to create endless beauty"]
    ],
    activity: {
      title: "Symmetry Tile Lab",
      prompt: "Tap to place a star tile. The lab mirrors it around the center to make a repeating pattern.",
      tools: ["Star", "Diamond", "Circle", "Line"]
    },
    quiz: {
      question: "What is a key ingredient in Islamic geometric art?",
      options: ["Repeating symmetry", "Random splashes only", "Photographs of soup cans"],
      answer: 0
    }
  },
  {
    id: "bauhaus",
    name: "Bauhaus",
    date: "Germany, 1919-1933",
    map: { left: 47, top: 26 },
    color: "#f2c94c",
    className: "art-bauhaus",
    summary: "The Bauhaus school blended art, craft, architecture, and design. It loved useful objects, clean shapes, primary colors, and bold experiments.",
    facts: [
      ["Look for", "Circles, squares, triangles, grids, primary colors"],
      ["Artists", "Anni Albers, Wassily Kandinsky, Paul Klee"],
      ["Big idea", "Make art and design work together"]
    ],
    activity: {
      title: "Shape Workshop",
      prompt: "Build a balanced design from circles, squares, and triangles. Think like an artist-engineer.",
      tools: ["Circle", "Square", "Triangle", "Line"]
    },
    quiz: {
      question: "The Bauhaus is famous for connecting art with what?",
      options: ["Design, craft, and architecture", "Pirate treasure maps", "Only royal portraits"],
      answer: 0
    }
  }
];

const state = {
  selected: movements[0],
  view: "map",
  tool: "",
  earned: JSON.parse(localStorage.getItem("zoe-art-sparks") || "[]"),
  drawing: false,
  lastPoint: null
};

const elements = {
  sparkCount: document.querySelector("#sparkCount"),
  sparkGrid: document.querySelector("#sparkGrid"),
  questText: document.querySelector("#questText"),
  randomStop: document.querySelector("#randomStop"),
  resetProgress: document.querySelector("#resetProgress"),
  stageTitle: document.querySelector("#stageTitle"),
  eraLabel: document.querySelector("#eraLabel"),
  worldBoard: document.querySelector("#worldBoard"),
  mapView: document.querySelector("#mapView"),
  timelineView: document.querySelector("#timelineView"),
  movementArt: document.querySelector("#movementArt"),
  movementDate: document.querySelector("#movementDate"),
  movementName: document.querySelector("#movementName"),
  movementSummary: document.querySelector("#movementSummary"),
  factRow: document.querySelector("#factRow"),
  activityTitle: document.querySelector("#activityTitle"),
  activityPrompt: document.querySelector("#activityPrompt"),
  activityControls: document.querySelector("#activityControls"),
  canvas: document.querySelector("#studioCanvas"),
  clearCanvas: document.querySelector("#clearCanvas"),
  completeActivity: document.querySelector("#completeActivity"),
  quizQuestion: document.querySelector("#quizQuestion"),
  quizOptions: document.querySelector("#quizOptions")
};

const ctx = elements.canvas.getContext("2d");

function saveSparks() {
  localStorage.setItem("zoe-art-sparks", JSON.stringify(state.earned));
}

function renderNavigation() {
  elements.worldBoard.innerHTML = movements.map((movement) => `
    <button class="map-pin ${state.selected.id === movement.id ? "active" : ""}" data-id="${movement.id}" style="left:${movement.map.left}%;top:${movement.map.top}%">
      <span class="pin-dot" style="background:${movement.color}"></span>
      <strong>${movement.name}</strong>
    </button>
  `).join("");

  elements.timelineView.innerHTML = `
    <div class="timeline-line">
      ${movements.map((movement) => `
        <button class="time-card ${state.selected.id === movement.id ? "active" : ""}" data-id="${movement.id}">
          <span>${movement.date.split(",")[1]?.trim() || movement.date}</span>
          <strong>${movement.name}</strong>
          <p>${movement.summary.slice(0, 82)}...</p>
        </button>
      `).join("")}
    </div>
  `;

  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => selectMovement(button.dataset.id));
  });
}

function renderPassport() {
  elements.sparkCount.textContent = state.earned.length;
  elements.sparkGrid.innerHTML = movements.map((movement) => `
    <span class="spark ${state.earned.includes(movement.id) ? "earned" : ""}" title="${movement.name}">
      ${state.earned.includes(movement.id) ? "*" : movement.name[0]}
    </span>
  `).join("");
}

function renderDetail() {
  const movement = state.selected;
  elements.stageTitle.textContent = `${movement.name} portal`;
  elements.eraLabel.textContent = movement.date;
  elements.questText.textContent = `Quest: try ${movement.activity.title.toLowerCase()}, then answer the spark quiz.`;
  elements.movementArt.className = `movement-art ${movement.className}`;
  elements.movementDate.textContent = movement.date;
  elements.movementName.textContent = movement.name;
  elements.movementSummary.textContent = movement.summary;
  elements.factRow.innerHTML = movement.facts.map(([label, value]) => `
    <div class="fact"><b>${label}</b>${value}</div>
  `).join("");
}

function renderActivity() {
  const movement = state.selected;
  state.tool = movement.activity.tools[0];
  elements.activityTitle.textContent = movement.activity.title;
  elements.activityPrompt.textContent = movement.activity.prompt;
  elements.activityControls.innerHTML = movement.activity.tools.map((tool, index) => `
    <button class="control-chip ${index === 0 ? "active" : ""}" type="button" data-tool="${tool}">${tool}</button>
  `).join("");

  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tool = button.dataset.tool;
      document.querySelectorAll("[data-tool]").forEach((item) => item.classList.toggle("active", item === button));
    });
  });

  clearCanvas();
  drawStarter(movement.id);
}

function renderQuiz() {
  const { quiz } = state.selected;
  elements.quizQuestion.textContent = quiz.question;
  elements.quizOptions.innerHTML = quiz.options.map((option, index) => `
    <button class="quiz-option" type="button" data-answer="${index}">${option}</button>
  `).join("");

  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = Number(button.dataset.answer) === quiz.answer;
      button.classList.add(correct ? "correct" : "wrong");
      if (correct) earnSpark();
    });
  });
}

function selectMovement(id) {
  state.selected = movements.find((movement) => movement.id === id) || movements[0];
  renderNavigation();
  renderDetail();
  renderActivity();
  renderQuiz();
}

function clearCanvas() {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function drawStarter(id) {
  if (id === "surrealism") {
    ctx.fillStyle = "#8cc4df";
    ctx.fillRect(0, 0, 900, 245);
    ctx.fillStyle = "#f5d2a0";
    ctx.fillRect(0, 245, 900, 215);
  }
  if (id === "ukiyo") {
    ctx.fillStyle = "#f9f0dc";
    ctx.fillRect(0, 0, 900, 460);
    ctx.fillStyle = "#d84e3b";
    ctx.beginPath();
    ctx.arc(720, 96, 58, 0, Math.PI * 2);
    ctx.fill();
  }
  if (id === "islamic") {
    ctx.strokeStyle = "#d8cbb4";
    ctx.lineWidth = 2;
    for (let x = 0; x < 900; x += 60) {
      for (let y = 0; y < 460; y += 60) {
        ctx.strokeRect(x, y, 60, 60);
      }
    }
  }
}

function getPoint(event) {
  const rect = elements.canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  return {
    x: (source.clientX - rect.left) * (elements.canvas.width / rect.width),
    y: (source.clientY - rect.top) * (elements.canvas.height / rect.height)
  };
}

function drawAt(point) {
  const id = state.selected.id;
  if (id === "impressionism") return drawImpression(point);
  if (id === "surrealism") return drawSurreal(point);
  if (id === "pop") return drawPop(point);
  if (id === "ukiyo") return drawUkiyo(point);
  if (id === "islamic") return drawIslamic(point);
  return drawBauhaus(point);
}

function drawImpression({ x, y }) {
  const colors = { Water: "#4f9bc9", Sun: "#f2c94c", Petal: "#e45f92", Leaf: "#2f8a6d" };
  ctx.fillStyle = colors[state.tool];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI);
  ctx.fillRect(-12, -4, 24, 8);
  ctx.restore();
}

function drawSurreal({ x, y }) {
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  ctx.fillStyle = state.tool === "Moon" ? "#f2c94c" : state.tool === "Eye" ? "#fff" : "#e45f92";
  if (state.tool === "Clock") {
    ctx.beginPath();
    ctx.ellipse(x, y, 38, 24, .3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y - 10);
    ctx.stroke();
  } else if (state.tool === "Door") {
    ctx.fillRect(x - 24, y - 48, 48, 96);
    ctx.strokeRect(x - 24, y - 48, 48, 96);
  } else {
    ctx.beginPath();
    ctx.ellipse(x, y, 42, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
  }
}

function drawPop({ x, y }) {
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 5;
  if (state.tool === "Dots") {
    ctx.fillStyle = "#2066b2";
    for (let dx = -28; dx <= 28; dx += 18) {
      for (let dy = -28; dy <= 28; dy += 18) {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (state.tool === "Star") {
    drawStar(x, y, 34, "#f2c94c");
  } else {
    ctx.fillStyle = state.tool === "WOW" ? "#f2c94c" : "#d84e3b";
    ctx.fillRect(x - 48, y - 26, 96, 52);
    ctx.strokeRect(x - 48, y - 26, 96, 52);
    ctx.fillStyle = "#111";
    ctx.font = "700 24px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.fillText(state.tool.toUpperCase(), x, y + 8);
  }
}

function drawUkiyo(point) {
  const { x, y } = point;
  ctx.strokeStyle = state.tool === "Foam" ? "#ffffff" : "#2066b2";
  ctx.fillStyle = state.tool === "Sun" ? "#d84e3b" : "#8bb8d8";
  ctx.lineWidth = state.tool === "Foam" ? 5 : 8;
  if (state.tool === "Sun") {
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
  } else if (state.tool === "Mountain") {
    ctx.fillStyle = "#6c7f9f";
    ctx.beginPath();
    ctx.moveTo(x - 48, y + 34);
    ctx.lineTo(x, y - 42);
    ctx.lineTo(x + 55, y + 34);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 48, Math.PI, Math.PI * 1.85);
    ctx.stroke();
  }
}

function drawIslamic({ x, y }) {
  const centerX = 450;
  const centerY = 230;
  const points = [
    [x, y],
    [900 - x, y],
    [x, 460 - y],
    [900 - x, 460 - y],
    [centerX + (y - centerY), centerY + (x - centerX)],
    [centerX - (y - centerY), centerY - (x - centerX)]
  ];
  points.forEach(([px, py]) => {
    if (state.tool === "Star") drawStar(px, py, 22, "#f2c94c");
    if (state.tool === "Diamond") drawDiamond(px, py);
    if (state.tool === "Circle") {
      ctx.strokeStyle = "#2066b2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (state.tool === "Line") {
      ctx.strokeStyle = "#2f8a6d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
  });
}

function drawBauhaus({ x, y }) {
  const colors = ["#d84e3b", "#2066b2", "#f2c94c", "#111"];
  ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  if (state.tool === "Circle") {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (state.tool === "Square") {
    ctx.fillRect(x - 28, y - 28, 56, 56);
    ctx.strokeRect(x - 28, y - 28, 56, 56);
  } else if (state.tool === "Triangle") {
    ctx.beginPath();
    ctx.moveTo(x, y - 36);
    ctx.lineTo(x - 36, y + 32);
    ctx.lineTo(x + 36, y + 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x - 42, y);
    ctx.lineTo(x + 42, y);
    ctx.stroke();
  }
}

function drawStar(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? radius : radius * .42;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDiamond(x, y) {
  ctx.fillStyle = "#2f8a6d";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x + 24, y);
  ctx.lineTo(x, y + 24);
  ctx.lineTo(x - 24, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function earnSpark() {
  if (!state.earned.includes(state.selected.id)) {
    state.earned.push(state.selected.id);
    saveSparks();
    renderPassport();
  }
}

function setView(view) {
  state.view = view;
  elements.mapView.classList.toggle("active", view === "map");
  elements.timelineView.classList.toggle("active", view === "timeline");
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

elements.canvas.addEventListener("pointerdown", (event) => {
  state.drawing = true;
  state.lastPoint = getPoint(event);
  drawAt(state.lastPoint);
});

elements.canvas.addEventListener("pointermove", (event) => {
  if (!state.drawing) return;
  drawAt(getPoint(event));
});

window.addEventListener("pointerup", () => {
  state.drawing = false;
});

elements.clearCanvas.addEventListener("click", () => {
  clearCanvas();
  drawStarter(state.selected.id);
});

elements.completeActivity.addEventListener("click", earnSpark);

elements.randomStop.addEventListener("click", () => {
  const currentIndex = movements.findIndex((movement) => movement.id === state.selected.id);
  selectMovement(movements[(currentIndex + 1 + Math.floor(Math.random() * 5)) % movements.length].id);
});

elements.resetProgress.addEventListener("click", () => {
  state.earned = [];
  saveSparks();
  renderPassport();
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

renderPassport();
renderNavigation();
renderDetail();
renderActivity();
renderQuiz();
