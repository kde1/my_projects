const canvas = document.getElementById("swissMap");
const ctx = canvas.getContext("2d");

// Fixed logical drawing space. All map art and coordinates live in this
// 2400x1600 "world"; it is letterboxed into the real (DPR-scaled) canvas so the
// map keeps its aspect ratio and stays crisp on high-DPI screens.
const WORLD = { w: 2400, h: 1600 };

const viewport = { cssW: 0, cssH: 0, dpr: 1, fitScale: 1, baseX: 0, baseY: 0 };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  viewport.cssW = rect.width;
  viewport.cssH = rect.height;
  viewport.dpr = dpr;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  // Uniform scale so Switzerland is never stretched; centered (letterboxed).
  viewport.fitScale = Math.min(rect.width / WORLD.w, rect.height / WORLD.h);
  viewport.baseX = (rect.width - WORLD.w * viewport.fitScale) / 2;
  viewport.baseY = (rect.height - WORLD.h * viewport.fitScale) / 2;
  clampMapView();
  drawMap();
}

const mapView = {
  scale: 1,
  x: 0,
  y: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  moved: false
};

const bounds = {
  minLon: 5.75,
  maxLon: 10.75,
  minLat: 45.65,
  maxLat: 47.95
};

const swissOutline = [
  [6.03, 46.23], [6.08, 46.48], [6.02, 46.84], [6.27, 46.98], [6.47, 47.16],
  [6.85, 47.36], [7.18, 47.49], [7.55, 47.58], [7.89, 47.52], [8.25, 47.68],
  [8.58, 47.81], [8.94, 47.72], [9.24, 47.55], [9.58, 47.55], [9.66, 47.35],
  [9.55, 47.09], [9.78, 46.9], [10.12, 46.86], [10.43, 46.62], [10.22, 46.36],
  [10.03, 46.17], [9.74, 46.02], [9.41, 46.18], [9.12, 46.11], [8.74, 45.92],
  [8.38, 46.0], [8.06, 46.18], [7.75, 45.93], [7.38, 45.88], [7.07, 46.04],
  [6.76, 46.13], [6.45, 46.01], [6.18, 46.1]
];

const lakes = [
  { name: "Lake Geneva", label: [6.47, 46.38], points: [[5.96, 46.25], [6.18, 46.33], [6.45, 46.43], [6.78, 46.47], [6.92, 46.39], [6.66, 46.27], [6.31, 46.2], [6.05, 46.17]] },
  { name: "Lake Neuchatel", label: [6.84, 46.96], points: [[6.57, 46.83], [6.78, 46.98], [7.04, 47.08], [7.08, 46.98], [6.84, 46.82], [6.64, 46.74]] },
  { name: "Lake Biel", label: [7.16, 47.09], points: [[7.04, 47.04], [7.16, 47.12], [7.31, 47.13], [7.24, 47.04]] },
  { name: "Lake Thun", label: [7.69, 46.69], points: [[7.52, 46.66], [7.73, 46.74], [7.89, 46.72], [7.8, 46.62], [7.59, 46.58]] },
  { name: "Lake Brienz", label: [8.02, 46.73], points: [[7.88, 46.72], [8.08, 46.78], [8.22, 46.76], [8.12, 46.67], [7.94, 46.66]] },
  { name: "Lake Lucerne", label: [8.39, 47.0], points: [[8.17, 47.01], [8.32, 47.08], [8.5, 47.05], [8.63, 46.95], [8.45, 46.88], [8.25, 46.93]] },
  { name: "Lake Zurich", label: [8.66, 47.27], points: [[8.48, 47.41], [8.57, 47.34], [8.72, 47.24], [8.85, 47.14], [8.75, 47.1], [8.58, 47.24], [8.48, 47.34]] },
  { name: "Lake Constance", label: [9.42, 47.58], points: [[8.98, 47.55], [9.28, 47.66], [9.7, 47.68], [9.78, 47.58], [9.38, 47.48], [9.08, 47.48]] },
  { name: "Lake Lugano", label: [8.98, 45.99], points: [[8.81, 45.98], [8.96, 46.02], [9.1, 45.98], [9.03, 45.91], [8.86, 45.91]] },
  { name: "Lake Maggiore", label: [8.65, 46.13], points: [[8.49, 46.19], [8.63, 46.17], [8.78, 46.1], [8.68, 45.96], [8.51, 46.03]] },
  { name: "Engadin lakes", label: [9.79, 46.45], points: [[9.66, 46.41], [9.79, 46.49], [9.96, 46.51], [9.9, 46.42], [9.74, 46.37]] }
];

const rivers = [
  { name: "Rhine", points: [[8.63, 46.95], [8.9, 47.12], [9.22, 47.42], [9.55, 47.54], [9.73, 47.58]] },
  { name: "Aare", points: [[8.25, 46.76], [7.88, 46.74], [7.45, 46.94], [7.24, 47.13], [7.08, 47.24], [7.58, 47.55]] },
  { name: "Rhone", points: [[8.28, 46.32], [7.82, 46.27], [7.34, 46.24], [6.86, 46.39], [6.18, 46.2]] },
  { name: "Reuss", points: [[8.58, 46.64], [8.44, 46.83], [8.31, 47.04], [8.28, 47.39]] },
  { name: "Inn", points: [[9.74, 46.42], [9.84, 46.49], [9.96, 46.6], [10.15, 46.75]] },
  { name: "Ticino", points: [[8.58, 46.55], [8.72, 46.32], [8.78, 46.17], [8.67, 46.0]] }
];

const transportLines = [
  ["geneva", "lausanne", "montreux", "bern", "zurich", "stgallen"],
  ["basel", "bern", "interlaken", "jungfraujoch"],
  ["zurich", "lucerne", "andermatt", "lugano"],
  ["chur", "davos", "zuoz", "stmoritz", "silvaplana", "sils"],
  ["zermatt", "matterhorn", "interlaken", "lucerne"]
];

const places = [
  {
    id: "zurich", name: "Zurich", type: "city", canton: "Zurich", lon: 8.5417, lat: 47.3769, badge: "ZH",
    language: "Swiss German is most common here.", skill: "Largest city, north of the Alps, beside Lake Zurich.",
    fact: "Zurich is Switzerland's largest city and a major hub for trains, universities, finance, museums, and lake life.",
    clue: "Look north of the Alps beside a long narrow lake.", tags: ["German-speaking", "lake", "largest city"]
  },
  {
    id: "bern", name: "Bern", type: "city", canton: "Bern", lon: 7.4474, lat: 46.948, badge: "BE",
    language: "Swiss German is spoken here.", skill: "Federal capital, west of the center.",
    fact: "Bern is Switzerland's federal capital. Its old town sits inside a dramatic bend of the Aare River.",
    clue: "Find the capital in the middle-west, wrapped by a river.", tags: ["capital", "Aare", "UNESCO"]
  },
  {
    id: "geneva", name: "Geneva", type: "city", canton: "Geneva", lon: 6.1432, lat: 46.2044, badge: "GE",
    language: "French is the main language here.", skill: "Far southwest, on Lake Geneva.",
    fact: "Geneva is a global diplomacy city near the Jet d'Eau and many international organizations.",
    clue: "Search the far southwest corner by the big crescent-shaped lake.", tags: ["French-speaking", "diplomacy", "lake"]
  },
  {
    id: "basel", name: "Basel", type: "city", canton: "Basel-Stadt", lon: 7.5886, lat: 47.5596, badge: "BS",
    language: "Swiss German is spoken here.", skill: "Northwest corner on the Rhine, near France and Germany.",
    fact: "Basel sits where Switzerland meets France and Germany, and it is famous for museums and the Rhine.",
    clue: "Look at the northwest edge, on the Rhine.", tags: ["Rhine", "border", "museums"]
  },
  {
    id: "lausanne", name: "Lausanne", type: "city", canton: "Vaud", lon: 6.6323, lat: 46.5197, badge: "LA",
    language: "French is the main language here.", skill: "On the north shore of Lake Geneva.",
    fact: "Lausanne is home to the Olympic Museum and climbs steeply from Lake Geneva into the hills.",
    clue: "Find the French-speaking city above Lake Geneva, east of Geneva.", tags: ["Olympics", "French-speaking", "lake"]
  },
  {
    id: "lucerne", name: "Lucerne", type: "city", canton: "Lucerne", lon: 8.3093, lat: 47.0502, badge: "LU",
    language: "Swiss German is spoken here.", skill: "Central Switzerland, beside Lake Lucerne.",
    fact: "Lucerne is known for its wooden Chapel Bridge, lake views, and nearby mountains Pilatus and Rigi.",
    clue: "Look near the center by a branching lake.", tags: ["Chapel Bridge", "central", "lake"]
  },
  {
    id: "lugano", name: "Lugano", type: "city", canton: "Ticino", lon: 8.9511, lat: 46.0037, badge: "TI",
    language: "Italian is the main language here.", skill: "South of the Alps, near Italy.",
    fact: "Lugano has palm-lined lakefronts, Italian-speaking culture, and mountains rising above the water.",
    clue: "Search the warm-looking southern lake district.", tags: ["Italian-speaking", "Ticino", "lake"]
  },
  {
    id: "stgallen", name: "St. Gallen", type: "city", canton: "St. Gallen", lon: 9.3767, lat: 47.4245, badge: "SG",
    language: "Swiss German is spoken here.", skill: "Northeast Switzerland, south of Lake Constance.",
    fact: "St. Gallen is famous for its Abbey Library, one of Europe's great historic libraries.",
    clue: "Look in the northeast, below Lake Constance.", tags: ["Abbey Library", "northeast", "UNESCO"]
  },
  {
    id: "interlaken", name: "Interlaken", type: "town", canton: "Bern", lon: 7.8632, lat: 46.6863, badge: "IN",
    language: "Swiss German is spoken here.", skill: "Between Lake Thun and Lake Brienz.",
    fact: "Interlaken means 'between lakes' and is a gateway to the Jungfrau region.",
    clue: "Find the town squeezed between two blue lakes.", tags: ["between lakes", "Jungfrau", "adventure"]
  },
  {
    id: "zermatt", name: "Zermatt", type: "town", canton: "Valais", lon: 7.7491, lat: 46.0207, badge: "ZE",
    language: "Swiss German is spoken here.", skill: "Southern Valais, below the Matterhorn.",
    fact: "Zermatt is a car-free alpine village famous for views of the Matterhorn.",
    clue: "Look in the southern Alps under the famous pyramid mountain.", tags: ["Matterhorn", "car-free", "Alps"]
  },
  {
    id: "matterhorn", name: "Matterhorn", type: "attraction", canton: "Valais", lon: 7.6586, lat: 45.9763, badge: "MT",
    language: "German and French are both nearby in Valais.", skill: "Iconic peak on the Swiss-Italian border.",
    fact: "The Matterhorn is one of the world's most recognizable mountains, with a sharp pyramid shape.",
    clue: "Find the famous mountain just southwest of Zermatt.", tags: ["peak", "border", "Alps"]
  },
  {
    id: "jungfraujoch", name: "Jungfraujoch", type: "attraction", canton: "Bern/Valais", lon: 7.982, lat: 46.547, badge: "JF",
    language: "Swiss German is common on the Bern side.", skill: "High pass in the Bernese Alps.",
    fact: "Jungfraujoch is reached by a high mountain railway and is often called the Top of Europe.",
    clue: "Look south of Interlaken in the high Bernese Alps.", tags: ["railway", "glacier", "high Alps"]
  },
  {
    id: "rhinefalls", name: "Rhine Falls", type: "attraction", canton: "Schaffhausen", lon: 8.615, lat: 47.677, badge: "RF",
    language: "Swiss German is spoken here.", skill: "Northern Switzerland on the Rhine.",
    fact: "Rhine Falls is Europe's most powerful waterfall by water flow.",
    clue: "Find the northern waterfall near the Rhine and Germany.", tags: ["waterfall", "Rhine", "north"]
  },
  {
    id: "chillon", name: "Chillon Castle", type: "attraction", canton: "Vaud", lon: 6.928, lat: 46.414, badge: "CC",
    language: "French is the main language here.", skill: "On Lake Geneva near Montreux.",
    fact: "Chillon Castle stands on a rocky island-like shore of Lake Geneva and is one of Switzerland's most visited castles.",
    clue: "Look on Lake Geneva near Montreux.", tags: ["castle", "Lake Geneva", "history"]
  },
  {
    id: "montreux", name: "Montreux", type: "town", canton: "Vaud", lon: 6.91, lat: 46.431, badge: "MX",
    language: "French is the main language here.", skill: "Eastern Lake Geneva, near Chillon Castle.",
    fact: "Montreux is known for its lakeside promenade and world-famous jazz festival.",
    clue: "Find the town at the eastern end of Lake Geneva.", tags: ["music", "French-speaking", "lake"]
  },
  {
    id: "gruyeres", name: "Gruyeres", type: "attraction", canton: "Fribourg", lon: 7.082, lat: 46.584, badge: "GR",
    language: "French is the main language here.", skill: "Foothills between Lake Geneva and Bern.",
    fact: "Gruyeres is a medieval hill town linked with Gruyere cheese and chocolate nearby.",
    clue: "Look northeast of Lake Geneva, before the higher Alps.", tags: ["cheese", "medieval", "Fribourg"]
  },
  {
    id: "chur", name: "Chur", type: "city", canton: "Graubunden", lon: 9.532, lat: 46.852, badge: "CH",
    language: "German and Romansh both matter in the canton.", skill: "Old alpine city at the gateway to Graubunden.",
    fact: "Chur is often described as Switzerland's oldest city and is a gateway to the Rhaetian Railway.",
    clue: "Find the city north of the Engadin valley.", tags: ["Graubunden", "railway", "old city"]
  },
  {
    id: "davos", name: "Davos", type: "town", canton: "Graubunden", lon: 9.835, lat: 46.802, badge: "DV",
    language: "German is common here.", skill: "High alpine town in eastern Switzerland.",
    fact: "Davos is a high-altitude resort town known for skiing and international meetings.",
    clue: "Look east, north of St. Moritz, in Graubunden.", tags: ["skiing", "Graubunden", "high town"]
  },
  {
    id: "stmoritz", name: "St. Moritz", type: "town", canton: "Graubunden", lon: 9.8355, lat: 46.4908, badge: "SM",
    language: "German and Romansh are part of the region's mix.", skill: "High in the Engadin valley of the Alps.",
    fact: "St. Moritz is a famous alpine resort and has hosted the Winter Olympics twice.",
    clue: "Go southeast into the Alps, close to a chain of small lakes.", tags: ["Winter Olympics", "Engadin", "skiing"]
  },
  {
    id: "zuoz", name: "Zuoz", type: "village", canton: "Graubunden", lon: 9.9597, lat: 46.6022, badge: "ZU",
    language: "Romansh is especially important in this valley.", skill: "East of St. Moritz in the Upper Engadin.",
    fact: "Zuoz is known for beautiful Engadin houses with painted walls called sgraffiti.",
    clue: "Find the village just northeast of St. Moritz.", tags: ["Romansh", "sgraffiti", "Engadin"]
  },
  {
    id: "silvaplana", name: "Silvaplana", type: "village", canton: "Graubunden", lon: 9.798, lat: 46.458, badge: "SP",
    language: "German, Italian, and Romansh influences meet nearby.", skill: "On Lake Silvaplana, southwest of St. Moritz.",
    fact: "Silvaplana is loved by windsurfers and kitesurfers because the Maloja wind often blows across the lake.",
    clue: "Look southwest of St. Moritz on the Engadin lake chain.", tags: ["Maloja wind", "Engadin", "lake"]
  },
  {
    id: "sils", name: "Sils", type: "village", canton: "Graubunden", lon: 9.7629, lat: 46.4294, badge: "SI",
    language: "The Romansh name is Segl.", skill: "Between Lake Sils and Lake Silvaplana.",
    fact: "Sils sits between sparkling alpine lakes and is linked with writers, artists, and mountain walks.",
    clue: "Find the westernmost of the Engadin lake villages.", tags: ["Segl", "Engadin", "lakes"]
  },
  {
    id: "swisspark", name: "Swiss National Park", type: "attraction", canton: "Graubunden", lon: 10.167, lat: 46.666, badge: "NP",
    language: "Romansh and German are both heard in the wider region.", skill: "Far eastern Alps near Zernez.",
    fact: "Swiss National Park is Switzerland's oldest national park and protects wild alpine landscapes.",
    clue: "Look in the far eastern Alps, beyond Zuoz.", tags: ["national park", "wildlife", "Graubunden"]
  },
  {
    id: "andermatt", name: "Andermatt", type: "town", canton: "Uri", lon: 8.594, lat: 46.635, badge: "AM",
    language: "Swiss German is spoken here.", skill: "Alpine crossroads near several mountain passes.",
    fact: "Andermatt sits near the Gotthard Pass, a historic north-south route through the Alps.",
    clue: "Find the central alpine crossroads south of Lake Lucerne.", tags: ["Gotthard", "passes", "central Alps"]
  },
  {
    id: "bellinzona", name: "Bellinzona", type: "city", canton: "Ticino", lon: 9.022, lat: 46.195, badge: "BZ",
    language: "Italian is the main language here.", skill: "Ticino valley city north of Lugano.",
    fact: "Bellinzona is famous for three medieval castles guarding routes through the Alps.",
    clue: "Look north of Lugano in the Italian-speaking canton.", tags: ["Italian-speaking", "castles", "Ticino"]
  },
  {
    id: "appenzell", name: "Appenzell", type: "town", canton: "Appenzell Innerrhoden", lon: 9.409, lat: 47.331, badge: "AP",
    language: "Swiss German is spoken here.", skill: "Northeast foothills below the Alpstein mountains.",
    fact: "Appenzell is known for painted houses, traditions, cheese, and the nearby Ebenalp mountain area.",
    clue: "Look in the northeast, south of St. Gallen.", tags: ["traditions", "cheese", "foothills"]
  }
];

const quizBank = [
  { question: "Zoe is planning a route from German-speaking Zurich to Italian-speaking Lugano. Which natural barrier does she mostly cross?", answer: "The Alps", options: ["The Alps", "The Jura", "Lake Geneva", "The Rhine"], explanation: "The main north-south journey crosses the Alpine barrier toward Ticino." },
  { question: "Which pair best matches a place with its language region?", answer: "Geneva - French", options: ["Geneva - French", "Lugano - Romansh", "Zurich - Italian", "Basel - French only"], explanation: "Geneva is in French-speaking western Switzerland." },
  { question: "A clue says 'Europe's most powerful waterfall on the Rhine.' Which marker should Zoe choose?", answer: "Rhine Falls", options: ["Rhine Falls", "Chillon Castle", "Jungfraujoch", "Lake Lucerne"], explanation: "Rhine Falls is on the Rhine in northern Switzerland." },
  { question: "Which destination is most closely linked to the Rhaetian Railway and the canton of Graubunden?", answer: "Chur", options: ["Chur", "Basel", "Lausanne", "Gruyeres"], explanation: "Chur is a gateway to Graubunden and its famous mountain rail routes." },
  { question: "Which group is entirely in or strongly linked to the Engadin?", answer: "Sils, Silvaplana, St. Moritz, Zuoz", options: ["Sils, Silvaplana, St. Moritz, Zuoz", "Geneva, Lausanne, Montreux, Basel", "Lucerne, Zurich, Bern, Lugano", "Gruyeres, Chillon, Basel, Appenzell"], explanation: "Those four are clustered in the Upper Engadin valley." },
  { question: "If Zoe wants a medieval castle directly on Lake Geneva, where should she go?", answer: "Chillon Castle", options: ["Chillon Castle", "Bellinzona", "Gruyeres", "Bern"], explanation: "Chillon Castle sits on the shore of Lake Geneva near Montreux." },
  { question: "Which city is at Switzerland's northwest corner near both France and Germany?", answer: "Basel", options: ["Basel", "Lugano", "St. Gallen", "Geneva"], explanation: "Basel sits by the tri-border area and the Rhine." },
  { question: "Which place is a car-free village famous for Matterhorn views?", answer: "Zermatt", options: ["Zermatt", "Davos", "Interlaken", "Appenzell"], explanation: "Zermatt is the village below the Matterhorn." },
  { question: "What does Interlaken's name help Zoe remember?", answer: "It is between two lakes", options: ["It is between two lakes", "It is the capital", "It is in Ticino", "It is on the Rhine"], explanation: "Interlaken lies between Lake Thun and Lake Brienz." },
  { question: "Which canton is the best answer for Lugano and Bellinzona?", answer: "Ticino", options: ["Ticino", "Vaud", "Zurich", "Uri"], explanation: "Both are in Italian-speaking Ticino." },
  { question: "Which attraction is the 'Top of Europe' railway destination in the Bernese Alps?", answer: "Jungfraujoch", options: ["Jungfraujoch", "Matterhorn", "Rhine Falls", "Swiss National Park"], explanation: "Jungfraujoch is reached by a high mountain railway." },
  { question: "Which route order moves from Lake Geneva into the Bernese Alps?", answer: "Geneva, Lausanne, Montreux, Interlaken, Jungfraujoch", options: ["Geneva, Lausanne, Montreux, Interlaken, Jungfraujoch", "Basel, Lugano, Zurich, Sils, Geneva", "Davos, Basel, Matterhorn, Zurich, Bern", "Appenzell, Chillon, Lugano, Rhine Falls, Bern"], explanation: "That path travels along Lake Geneva, then toward Interlaken and the high Alps." }
];

const routeOrder = ["geneva", "lausanne", "montreux", "chillon", "gruyeres", "bern", "interlaken", "jungfraujoch", "lucerne", "zurich", "basel", "rhinefalls", "stgallen", "appenzell", "chur", "davos", "zuoz", "stmoritz", "silvaplana", "sils", "andermatt", "bellinzona", "lugano", "zermatt", "matterhorn"];

const labelOffsets = {
  geneva: { x: 48, y: -18, align: "left" },
  lausanne: { x: 0, y: -42, align: "center" },
  montreux: { x: 44, y: 34, align: "left" },
  chillon: { x: 74, y: -8, align: "left" },
  gruyeres: { x: 48, y: 34, align: "left" },
  bern: { x: -28, y: -34, align: "right" },
  interlaken: { x: 58, y: 28, align: "left" },
  jungfraujoch: { x: 40, y: 46, align: "left" },
  lucerne: { x: -54, y: -20, align: "right" },
  zurich: { x: 0, y: -42, align: "center" },
  basel: { x: -18, y: 38, align: "right" },
  rhinefalls: { x: 52, y: -12, align: "left" },
  stgallen: { x: -54, y: -28, align: "right" },
  appenzell: { x: -48, y: 34, align: "right" },
  lugano: { x: 42, y: 36, align: "left" },
  bellinzona: { x: 48, y: -28, align: "left" },
  andermatt: { x: -62, y: 24, align: "right" },
  zermatt: { x: 38, y: -28, align: "left" },
  matterhorn: { x: -44, y: 42, align: "right" },
  chur: { x: -46, y: -28, align: "right" },
  davos: { x: 46, y: -18, align: "left" },
  swisspark: { x: -58, y: 40, align: "right" },
  stmoritz: { x: -86, y: -4, align: "right" },
  zuoz: { x: 28, y: -48, align: "left" },
  silvaplana: { x: 88, y: 18, align: "left" },
  sils: { x: -68, y: 44, align: "right" }
};

const state = {
  mode: "explore",
  selected: null,
  score: 0,
  collected: new Set(),
  target: null,
  quiz: null,
  hintVisible: false,
  lastMessage: "",
  quizIndex: 0
};

const els = {
  missionText: document.getElementById("missionText"),
  placeBadge: document.getElementById("placeBadge"),
  placeName: document.getElementById("placeName"),
  placeRegion: document.getElementById("placeRegion"),
  placeFact: document.getElementById("placeFact"),
  languageFact: document.getElementById("languageFact"),
  mapSkill: document.getElementById("mapSkill"),
  score: document.getElementById("score"),
  stampCount: document.getElementById("stampCount"),
  stampTotal: document.getElementById("stampTotal"),
  challengeTitle: document.getElementById("challengeTitle"),
  challengePrompt: document.getElementById("challengePrompt"),
  quizOptions: document.getElementById("quizOptions"),
  hintButton: document.getElementById("hintButton"),
  feedback: document.getElementById("feedback"),
  passport: document.getElementById("passport"),
  placeJumpList: document.getElementById("placeJumpList"),
  srStatus: document.getElementById("srStatus")
};

function announce(message) {
  if (els.srStatus) els.srStatus.textContent = message;
}

// Keyboard / screen-reader path: a real button per place that collects it,
// mirroring what clicking the canvas marker does.
function renderPlaceJumpList() {
  if (!els.placeJumpList) return;
  els.placeJumpList.innerHTML = places.map((place) => `
    <button type="button" data-place="${escapeHtml(place.id)}">
      Visit ${escapeHtml(place.name)} (${escapeHtml(place.canton)})
    </button>
  `).join("");
  els.placeJumpList.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = placeById(button.dataset.place);
      if (place) selectPlace(place, true);
    });
  });
}

function project(lon, lat) {
  return {
    x: ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * WORLD.w,
    y: WORLD.h - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * WORLD.h
  };
}

// World point -> CSS-pixel point (base letterbox transform, then user pan/zoom).
function worldToCss(point) {
  return {
    x: mapView.x + mapView.scale * (viewport.baseX + viewport.fitScale * point.x),
    y: mapView.y + mapView.scale * (viewport.baseY + viewport.fitScale * point.y)
  };
}

// CSS-pixel point (relative to canvas) -> world point.
function cssToWorld(point) {
  const px = (point.x - mapView.x) / mapView.scale;
  const py = (point.y - mapView.y) / mapView.scale;
  return {
    x: (px - viewport.baseX) / viewport.fitScale,
    y: (py - viewport.baseY) / viewport.fitScale
  };
}

function clampScale() {
  mapView.scale = Math.min(4.5, Math.max(1, mapView.scale));
}

function clampMapView() {
  clampScale();
  const minX = viewport.cssW - viewport.cssW * mapView.scale;
  const minY = viewport.cssH - viewport.cssH * mapView.scale;
  mapView.x = Math.min(0, Math.max(minX, mapView.x));
  mapView.y = Math.min(0, Math.max(minY, mapView.y));
  canvas.dataset.zoom = mapView.scale.toFixed(2);
}

function zoomAt(factor, centerCss) {
  const beforeWorld = cssToWorld(centerCss);
  // Clamp the scale to its final value first, then solve for the pan that keeps
  // the point under the cursor fixed. (Avoids the old double-clamp drift.)
  mapView.scale = Math.min(4.5, Math.max(1, mapView.scale * factor));
  const baseX = viewport.baseX + viewport.fitScale * beforeWorld.x;
  const baseY = viewport.baseY + viewport.fitScale * beforeWorld.y;
  mapView.x = centerCss.x - baseX * mapView.scale;
  mapView.y = centerCss.y - baseY * mapView.scale;
  clampMapView();
  drawMap();
}

function resetMapView() {
  mapView.scale = 1;
  mapView.x = 0;
  mapView.y = 0;
  canvas.dataset.zoom = "1.00";
  drawMap();
}

function pseudoNoise(x, y) {
  return (
    Math.sin(x * 0.013 + y * 0.021) +
    Math.sin(x * 0.037 - y * 0.018) * 0.55 +
    Math.cos(x * 0.071 + y * 0.043) * 0.28
  ) / 1.83;
}

function elevationAt(x, y) {
  const south = y / WORLD.h;
  const east = x / WORLD.w;
  const alpineArc = Math.exp(-Math.pow((y - (980 + Math.sin(east * 8) * 115)) / 230, 2));
  const valais = Math.exp(-Math.pow((x - 730) / 420, 2) - Math.pow((y - 1370) / 240, 2));
  const grisons = Math.exp(-Math.pow((x - 1810) / 470, 2) - Math.pow((y - 1040) / 330, 2));
  const jura = Math.exp(-Math.pow((x - 370) / 360, 2) - Math.pow((y - 440) / 240, 2));
  return Math.min(1, Math.max(0, south * 0.28 + alpineArc * 0.48 + valais * 0.42 + grisons * 0.36 + jura * 0.17 + pseudoNoise(x, y) * 0.12));
}

function placeById(id) {
  return places.find((place) => place.id === id);
}

function drawPath(points, options) {
  ctx.beginPath();
  points.forEach(([lon, lat], index) => {
    const p = project(lon, lat);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  if (options.close) ctx.closePath();
  if (options.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  if (options.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.lineWidth || 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (options.dash) ctx.setLineDash(options.dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawTerrain() {
  const sky = ctx.createLinearGradient(0, 0, WORLD.w, WORLD.h);
  sky.addColorStop(0, "#cfe5e7");
  sky.addColorStop(0.33, "#e8ead6");
  sky.addColorStop(0.64, "#d9d6b8");
  sky.addColorStop(1, "#b8c3a7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  for (let band = 0; band < 34; band += 1) {
    const y = 620 + band * 23;
    ctx.beginPath();
    for (let x = -80; x <= WORLD.w + 80; x += 80) {
      const wave = Math.sin(x * 0.008 + band * 0.65) * 36 + Math.cos(x * 0.004 + band) * 28;
      if (x === -80) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = `rgba(72, 92, 79, ${0.08 + band * 0.004})`;
    ctx.lineWidth = 5 + band * 0.12;
    ctx.stroke();
  }

  const alpineRidges = [
    [[6.15, 46.18], [6.8, 46.35], [7.25, 46.21], [7.82, 46.38], [8.28, 46.24], [8.86, 46.46], [9.44, 46.3], [10.35, 46.55]],
    [[6.45, 46.03], [7.16, 46.18], [7.75, 45.98], [8.25, 46.2], [8.8, 46.02], [9.38, 46.2], [9.95, 46.1]],
    [[7.2, 46.68], [7.75, 46.82], [8.12, 46.72], [8.6, 46.9], [9.2, 46.78], [9.86, 46.9]]
  ];
  alpineRidges.forEach((ridge, ridgeIndex) => {
    ridge.forEach(([lon, lat], index) => {
      if (index === ridge.length - 1) return;
      const a = project(lon, lat);
      const b = project(ridge[index + 1][0], ridge[index + 1][1]);
      const peakX = (a.x + b.x) / 2;
      const baseY = (a.y + b.y) / 2 + 170;
      const peakY = (a.y + b.y) / 2 - 120 - ridgeIndex * 35;
      ctx.beginPath();
      ctx.moveTo(peakX - 180, baseY);
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + 190, baseY);
      ctx.closePath();
      const shade = ctx.createLinearGradient(peakX - 120, peakY, peakX + 160, baseY);
      shade.addColorStop(0, "rgba(245, 248, 242, 0.82)");
      shade.addColorStop(0.42, "rgba(111, 130, 119, 0.38)");
      shade.addColorStop(1, "rgba(71, 88, 82, 0.32)");
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.strokeStyle = "rgba(79, 94, 86, 0.18)";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  });

  for (let i = 0; i < 420; i += 1) {
    const x = (i * 149) % WORLD.w;
    const y = 520 + ((i * 83) % 880);
    const alpha = 0.035 + ((i % 7) * 0.008);
    ctx.fillStyle = `rgba(48, 68, 58, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawSatelliteTexture() {
  const cell = mapView.scale > 2.7 ? 22 : mapView.scale > 1.6 ? 30 : 42;
  for (let y = 0; y < WORLD.h; y += cell) {
    for (let x = 0; x < WORLD.w; x += cell) {
      const e = elevationAt(x, y);
      const n = pseudoNoise(x * 1.7, y * 1.7);
      const forest = Math.max(0, 1 - Math.abs(e - 0.46) * 3.2) + n * 0.18;
      const snow = Math.max(0, e - 0.72) * 3.3;
      const valley = Math.max(0, 0.38 - e) * 1.4;
      let color;
      if (snow > 0.45) {
        const shade = 226 + Math.round(snow * 22 + n * 8);
        color = `rgba(${shade}, ${shade + 4}, ${shade + 2}, 0.78)`;
      } else if (forest > 0.62) {
        const g = 91 + Math.round(n * 18);
        color = `rgba(${55 + Math.round(e * 38)}, ${g}, ${54 + Math.round(e * 28)}, 0.52)`;
      } else if (valley > 0.3) {
        color = `rgba(${171 + Math.round(n * 14)}, ${164 + Math.round(n * 10)}, ${116 + Math.round(n * 10)}, 0.42)`;
      } else {
        color = `rgba(${132 + Math.round(e * 48)}, ${128 + Math.round(e * 32)}, ${98 + Math.round(n * 12)}, 0.46)`;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cell + 1, cell + 1);
    }
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (let y = 240; y < WORLD.h - 40; y += 34) {
      ctx.beginPath();
      for (let x = -40; x <= WORLD.w + 40; x += 48) {
        const e = elevationAt(x, y);
        const contour = y + Math.sin(x * 0.012 + pass) * 18 + (e - 0.5) * 46;
        if (x === -40) ctx.moveTo(x, contour);
        else ctx.lineTo(x, contour);
      }
      ctx.strokeStyle = pass === 0 ? "rgba(74, 79, 67, 0.13)" : "rgba(255, 255, 255, 0.13)";
      ctx.lineWidth = pass === 0 ? 3 : 2;
      ctx.stroke();
    }
  }

  const glacierZones = [
    [7.82, 46.54, 150, 84],
    [7.66, 45.98, 145, 92],
    [8.42, 46.55, 120, 78],
    [9.82, 46.43, 126, 70]
  ];
  glacierZones.forEach(([lon, lat, w, h]) => {
    const p = project(lon, lat);
    const grad = ctx.createRadialGradient(p.x, p.y, 12, p.x, p.y, w);
    grad.addColorStop(0, "rgba(249, 252, 252, 0.8)");
    grad.addColorStop(0.65, "rgba(228, 239, 236, 0.36)");
    grad.addColorStop(1, "rgba(228, 239, 236, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, w, h, -0.35, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLakes() {
  lakes.forEach((lake) => {
    drawPath(lake.points, { close: true, fill: "rgba(69, 152, 184, 0.78)", stroke: "rgba(32, 95, 128, 0.48)", lineWidth: 3 });
    const p = project(lake.label[0], lake.label[1]);
    ctx.font = "700 19px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(17, 72, 101, 0.74)";
    ctx.strokeStyle = "rgba(245, 250, 246, 0.72)";
    ctx.lineWidth = 6;
    ctx.strokeText(lake.name, p.x, p.y);
    ctx.fillText(lake.name, p.x, p.y);
  });
}

function drawRivers() {
  rivers.forEach((river) => {
    drawPath(river.points, { stroke: "rgba(53, 138, 177, 0.62)", lineWidth: 7 });
    drawPath(river.points, { stroke: "rgba(222, 244, 247, 0.65)", lineWidth: 2 });
  });
}

function drawTransport() {
  transportLines.forEach((line) => {
    const points = line.map(placeById).filter(Boolean).map((place) => [place.lon, place.lat]);
    drawPath(points, { stroke: "rgba(75, 80, 85, 0.35)", lineWidth: 4, dash: [18, 13] });
  });
}

function drawRoute() {
  if (state.mode !== "route") return;
  const points = routeOrder.map(placeById).filter(Boolean).map((place) => [place.lon, place.lat]);
  drawPath(points, { stroke: "rgba(227, 61, 69, 0.82)", lineWidth: 9, dash: [24, 16] });
}

function applyWorldTransform() {
  // world -> css: base letterbox, then user pan/zoom (applied around css origin).
  ctx.translate(mapView.x, mapView.y);
  ctx.scale(mapView.scale, mapView.scale);
  ctx.translate(viewport.baseX, viewport.baseY);
  ctx.scale(viewport.fitScale, viewport.fitScale);
}

function drawMap() {
  if (!viewport.cssW) return;
  // Draw in CSS pixels; the DPR scale keeps everything crisp on retina.
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.clearRect(0, 0, viewport.cssW, viewport.cssH);
  ctx.fillStyle = "#cfe5e7";
  ctx.fillRect(0, 0, viewport.cssW, viewport.cssH);

  ctx.save();
  applyWorldTransform();
  drawTerrain();
  drawPath(swissOutline, { close: true, fill: "rgba(244, 241, 214, 0.86)", stroke: "rgba(23, 48, 65, 0.5)", lineWidth: 7 });
  ctx.save();
  drawPath(swissOutline, { close: true });
  ctx.clip();
  drawSatelliteTexture();
  drawLakes();
  drawRivers();
  drawTransport();
  drawRoute();
  drawMajorRegionLabels();
  places.forEach(drawPlace);
  ctx.restore();
  ctx.restore();

  // Fixed overlays: uniform base scale, but not affected by pan/zoom.
  ctx.save();
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.translate(viewport.baseX, viewport.baseY);
  ctx.scale(viewport.fitScale, viewport.fitScale);
  drawCompass();
  drawScale();
  drawLegend();
  ctx.restore();
}

function drawMajorRegionLabels() {
  const labels = [
    ["Jura", 6.75, 47.25],
    ["Swiss Plateau", 7.9, 47.22],
    ["Bernese Alps", 7.75, 46.43],
    ["Valais Alps", 7.45, 46.04],
    ["Ticino", 8.9, 46.1],
    ["Graubunden", 9.62, 46.72]
  ];
  labels.forEach(([text, lon, lat]) => {
    const p = project(lon, lat);
    ctx.font = "800 34px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(65, 80, 73, 0.2)";
    ctx.fillText(text, p.x, p.y);
  });
}

function markerColor(place, collected, isSelected) {
  if (collected) return "#d99a28";
  if (isSelected) return "#2d7fb8";
  if (place.type === "city") return "#e33d45";
  if (place.type === "attraction") return "#4f8f56";
  return "#6f58a8";
}

function drawPlace(place) {
  const p = project(place.lon, place.lat);
  const isSelected = state.selected?.id === place.id;
  const isTarget = state.mode === "find" && state.target?.id === place.id;
  const collected = state.collected.has(place.id);
  const radius = place.type === "city" ? 20 : place.type === "attraction" ? 18 : 16;
  const activeRadius = isSelected || isTarget ? radius + 7 : radius;
  const label = labelOffsets[place.id] || { x: 0, y: -activeRadius - 14, align: "center" };
  const labelX = p.x + label.x;
  const labelY = p.y + label.y;

  ctx.beginPath();
  ctx.arc(p.x, p.y, activeRadius + 9, 0, Math.PI * 2);
  ctx.fillStyle = isTarget && state.hintVisible ? "rgba(227, 61, 69, 0.24)" : "rgba(255, 255, 255, 0.72)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(p.x, p.y, activeRadius, 0, Math.PI * 2);
  ctx.fillStyle = markerColor(place, collected, isSelected);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fffaf0";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = `${place.badge.length > 2 ? "800 14px" : "800 18px"} Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(place.badge, p.x, p.y + 1);

  const isDense = place.lon > 9.55 && place.lat < 46.9;
  ctx.font = `${isDense ? "800 22px" : "800 25px"} Segoe UI, sans-serif`;
  ctx.textAlign = label.align;
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(255, 250, 240, 0.86)";
  ctx.strokeText(place.name, labelX, labelY);
  ctx.fillStyle = "#173041";
  ctx.fillText(place.name, labelX, labelY);
}

function drawCompass() {
  ctx.save();
  ctx.translate(WORLD.w - 150, WORLD.h - 150);
  ctx.fillStyle = "rgba(255, 250, 240, 0.84)";
  ctx.strokeStyle = "rgba(23, 48, 65, 0.24)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e33d45";
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.lineTo(15, 8);
  ctx.lineTo(0, -4);
  ctx.lineTo(-15, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#173041";
  ctx.font = "900 24px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("N", 0, -72);
  ctx.restore();
}

function drawScale() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 250, 240, 0.84)";
  ctx.strokeStyle = "rgba(23, 48, 65, 0.28)";
  ctx.lineWidth = 3;
  ctx.fillRect(105, WORLD.h - 128, 300, 74);
  ctx.strokeRect(105, WORLD.h - 128, 300, 74);
  ctx.strokeStyle = "#173041";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(142, WORLD.h - 82);
  ctx.lineTo(330, WORLD.h - 82);
  ctx.stroke();
  ctx.fillStyle = "#173041";
  ctx.font = "800 23px Segoe UI, sans-serif";
  ctx.fillText("about 100 km", 142, WORLD.h - 95);
  ctx.restore();
}

function drawLegend() {
  const x = WORLD.w - 470;
  const y = 180;
  const rows = [
    ["#e33d45", "city"],
    ["#6f58a8", "town or village"],
    ["#4f8f56", "tourist attraction"],
    ["rgba(75, 80, 85, 0.5)", "major rail or route"]
  ];
  ctx.save();
  ctx.fillStyle = "rgba(255, 250, 240, 0.78)";
  ctx.strokeStyle = "rgba(23, 48, 65, 0.18)";
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, 330, 142);
  ctx.strokeRect(x, y, 330, 142);
  ctx.font = "800 22px Segoe UI, sans-serif";
  ctx.fillStyle = "#173041";
  ctx.fillText("Map key", x + 22, y + 34);
  rows.forEach(([color, label], index) => {
    const rowY = y + 60 + index * 22;
    ctx.fillStyle = color;
    if (index === 3) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(x + 24, rowY - 4);
      ctx.lineTo(x + 52, rowY - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.arc(x + 38, rowY - 4, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#173041";
    ctx.font = "700 18px Segoe UI, sans-serif";
    ctx.fillText(label, x + 68, rowY + 2);
  });
  ctx.restore();
}

// Show a place in the side panel WITHOUT collecting it or awarding points.
function showPlace(place) {
  state.selected = place;
  els.placeBadge.textContent = place.badge;
  els.placeName.textContent = place.name;
  els.placeRegion.textContent = `${place.canton} - ${place.type}`;
  els.placeFact.textContent = place.fact;
  els.languageFact.textContent = place.language;
  els.mapSkill.textContent = place.skill;
}

// Collect a place: this is the scoring action, only triggered by actually
// choosing a marker (click, keyboard, or a correct Find).
function selectPlace(place, fromClick = false) {
  showPlace(place);

  if (!state.collected.has(place.id)) {
    state.collected.add(place.id);
    state.score += place.type === "attraction" ? 15 : 10;
    state.lastMessage = `Stamp collected: ${place.name}.`;
  } else {
    state.lastMessage = `${place.name} is already in your passport.`;
  }

  if (state.mode === "find" && fromClick) {
    if (place.id === state.target?.id) {
      state.score += 25;
      state.lastMessage = `Excellent, Zoe. ${place.name} matches the clue.`;
      nextFindTarget();
    } else {
      state.lastMessage = `${place.name} is interesting, but the clue points somewhere else.`;
    }
  }

  announce(state.lastMessage);
  updateUI();
  drawMap();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

// Nearest marker within a fixed on-screen radius, so hit accuracy is the same
// at every zoom level and clustered markers (e.g. the Engadin) resolve to the
// closest one rather than the first in array order.
function placeAt(cssPoint) {
  let best = null;
  let bestDist = Infinity;
  places.forEach((place) => {
    const c = worldToCss(project(place.lon, place.lat));
    const d = Math.hypot(cssPoint.x - c.x, cssPoint.y - c.y);
    if (d < bestDist) {
      bestDist = d;
      best = place;
    }
  });
  return bestDist <= 28 ? best : null;
}

function setMode(mode) {
  state.mode = mode;
  state.hintVisible = false;
  document.querySelectorAll(".mode").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (mode === "find") {
    state.target = nextUncollected();
    state.lastMessage = state.target ? "" : "Every stamp is collected — try another mode!";
  }
  if (mode === "quiz") buildQuiz();
  updateUI();
  drawMap();
}

function nextUncollected() {
  return places.find((place) => !state.collected.has(place.id)) || null;
}

function nextFindTarget() {
  // Pick a random uncollected place that isn't the current target, so Find mode
  // actually covers the whole map and reaches a clean "all found" state.
  const remaining = places.filter((place) => !state.collected.has(place.id) && place.id !== state.target?.id);
  state.target = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
  state.hintVisible = false;
}

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuiz() {
  state.quiz = quizBank[state.quizIndex % quizBank.length];
  state.quizIndex += 1;
  const answers = shuffle(state.quiz.options);
  els.quizOptions.innerHTML = "";
  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => answerQuiz(answer));
    els.quizOptions.appendChild(button);
  });
}

function answerQuiz(answer) {
  if (answer === state.quiz.answer) {
    state.score += 35;
    // Highlight the matching place if there is one, but do NOT collect its stamp
    // — quiz points and stamp collection are kept separate.
    const matchedPlace = places.find((place) => place.name === answer);
    if (matchedPlace) showPlace(matchedPlace);
    state.lastMessage = `Correct. ${state.quiz.explanation}`;
    buildQuiz();
  } else {
    state.score = Math.max(0, state.score - 5);
    state.lastMessage = `Not quite. Answer: ${state.quiz.answer}. ${state.quiz.explanation}`;
  }
  announce(state.lastMessage);
  updateUI();
  drawMap();
}

function updateUI() {
  els.score.textContent = state.score;
  els.stampCount.textContent = state.collected.size;
  els.stampTotal.textContent = places.length;
  els.feedback.textContent = state.lastMessage;
  els.quizOptions.hidden = state.mode !== "quiz";
  els.hintButton.textContent = state.hintVisible ? "Hide hint" : "Show hint";

  if (state.mode === "explore") {
    els.missionText.textContent = "Tap markers to collect city, village, and attraction stamps.";
    els.challengeTitle.textContent = "Explorer Challenge";
    els.challengePrompt.textContent = "Collect stamps from cities, alpine villages, castles, waterfalls, mountain passes, and lake towns.";
  } else if (state.mode === "find") {
    els.challengeTitle.textContent = "Find The Place";
    if (state.target) {
      els.missionText.textContent = `Find ${state.target.name} on the realistic map.`;
      els.challengePrompt.textContent = state.hintVisible ? state.target.clue : `Zoe's target: ${state.target.name}`;
    } else {
      els.missionText.textContent = "You've found every place on the map!";
      els.challengePrompt.textContent = "All stamps collected. Try Quiz or Route mode next.";
    }
  } else if (state.mode === "quiz") {
    els.missionText.textContent = "Harder questions now use geography, language, culture, and routes.";
    els.challengeTitle.textContent = "Swiss Master Quiz";
    els.challengePrompt.textContent = state.quiz.question;
  } else {
    els.missionText.textContent = "Follow a grand tour from Lake Geneva to the Alps, Rhine, Ticino, and Engadin.";
    els.challengeTitle.textContent = "Grand Tour Route";
    els.challengePrompt.textContent = "Trace the red route through major cities, attractions, mountain regions, and Zoe's Engadin villages.";
  }

  renderPassport();
}

function renderPassport() {
  els.passport.innerHTML = "";
  places.forEach((place) => {
    const stamp = document.createElement("div");
    stamp.className = `stamp ${state.collected.has(place.id) ? "collected" : ""}`;
    stamp.innerHTML = `<strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(state.collected.has(place.id) ? place.skill : `${place.type} stamp waiting`)}</span>`;
    els.passport.appendChild(stamp);
  });
}

// Pointer Events unify mouse, touch, and pen. Two active pointers = pinch zoom.
const activePointers = new Map();
const DRAG_THRESHOLD = 5; // css px before a press counts as a drag, not a tap
let pinchStartDist = 0;
let pinchStartScale = 1;

function pointerDistance() {
  const pts = [...activePointers.values()];
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

function pointerMidpoint() {
  const pts = [...activePointers.values()];
  return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
}

canvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);
  activePointers.set(event.pointerId, point);
  if (activePointers.size === 2) {
    pinchStartDist = pointerDistance();
    pinchStartScale = mapView.scale;
    mapView.dragging = false;
    return;
  }
  mapView.dragging = true;
  mapView.moved = false;
  mapView.lastX = point.x;
  mapView.lastY = point.y;
  canvas.style.cursor = "grabbing";
  if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  const point = canvasPoint(event);
  if (activePointers.has(event.pointerId)) activePointers.set(event.pointerId, point);

  if (activePointers.size === 2 && pinchStartDist > 0) {
    event.preventDefault();
    const factor = (pointerDistance() / pinchStartDist) * (pinchStartScale / mapView.scale);
    zoomAt(factor, pointerMidpoint());
    return;
  }

  if (mapView.dragging) {
    const dx = point.x - mapView.lastX;
    const dy = point.y - mapView.lastY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) mapView.moved = true;
    mapView.x += dx;
    mapView.y += dy;
    mapView.lastX = point.x;
    mapView.lastY = point.y;
    clampMapView();
    drawMap();
    return;
  }

  if (event.pointerType === "mouse") {
    canvas.style.cursor = placeAt(point) ? "pointer" : "grab";
  }
});

function endPointer(event) {
  const wasDragging = mapView.dragging;
  const point = canvasPoint(event);
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) pinchStartDist = 0;

  if (wasDragging && !mapView.moved) {
    // A press that didn't move past the threshold is a tap → try to collect.
    const hit = placeAt(point);
    if (hit) selectPlace(hit, true);
  }
  mapView.dragging = false;
  mapView.moved = false;
  canvas.style.cursor = "grab";
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", (event) => {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) pinchStartDist = 0;
  mapView.dragging = false;
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomAt(event.deltaY < 0 ? 1.22 : 0.82, canvasPoint(event));
}, { passive: false });

document.getElementById("zoomIn").addEventListener("click", () => {
  zoomAt(1.28, { x: viewport.cssW / 2, y: viewport.cssH / 2 });
});

document.getElementById("zoomOut").addEventListener("click", () => {
  zoomAt(0.78, { x: viewport.cssW / 2, y: viewport.cssH / 2 });
});

document.getElementById("zoomReset").addEventListener("click", () => {
  resetMapView();
});

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.getElementById("hintButton").addEventListener("click", () => {
  state.hintVisible = !state.hintVisible;
  updateUI();
  drawMap();
});

document.getElementById("nextChallenge").addEventListener("click", () => {
  if (state.mode === "quiz") {
    buildQuiz();
  } else if (state.mode === "find") {
    nextFindTarget();
  } else {
    // Preview the next place without auto-collecting its stamp.
    const start = state.selected || places[0];
    showPlace(places[(places.indexOf(start) + 1) % places.length]);
  }
  state.lastMessage = "New challenge ready.";
  updateUI();
  drawMap();
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeCanvas, 120);
});

// Redraw whenever the canvas actually gets/changes size — robust to late layout
// (size 0 at script run) and to the responsive breakpoints reflowing the stage.
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(resizeCanvas).observe(canvas);
}

state.target = places[0];
canvas.dataset.zoom = "1.00";
buildQuiz();
renderPassport();
renderPlaceJumpList();
updateUI();
resizeCanvas();
