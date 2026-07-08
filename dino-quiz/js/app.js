(function () {
  "use strict";

  const helpers = window.DinoHelpers;
  const { $, $$, shuffle, escapeHtml, cleanPlayerName, readJsonStorage, writeJsonStorage, readTextStorage, writeTextStorage, todayDisplay, todayISO, isoWeek } = helpers;

  const { slots, speciesLab, quizItems, quizFieldGuide, quizChoicePools, geneGoals } = window.DinoData;

  const state = {
    body: 0,
    head: 0,
    tail: 2,
    legs: 2,
    armor: 0,
    detail: 0,
    baseColor: "#5f7f45",
    bellyColor: "#d0c09a",
    pattern: "scales",
    size: 100,
    posture: 0,
    fossilName: true,
    dnaA: "tyrannosaurus",
    dnaB: "velociraptor",
    dnaGoal: "speed",
    dnaBoost: { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 },
    lastSplice: null,
    playerName: "",
    quizIndex: 0,
    quizScore: 0,
    quizTotal: 0,
    quizCorrect: 0,
    quizStreak: 0,
    quizAnswered: false,
    quizPotential: 10,
    quizHintsUsed: 0,
    quizRoundHints: 0,
    quizRoundComplete: false,
    quizResultSaved: false,
    currentItem: null,
    quizDifficulty: "easy",
    quizOrder: [],
    galleryPage: 0,
    galleryQuizPage: 0,
    galleryQuizRevealed: new Set(),
    offsets: {}
  };

  const FALLBACK_GUIDE = { lived: "Unknown", where: "Unknown", habitat: "Unknown", diet: "Unknown", facts: [] };

  // Never let a missing field-guide entry crash a render; surface it instead.
  function getGuide(slug) {
    return quizFieldGuide[slug] || FALLBACK_GUIDE;
  }

  function getSpecies(id) {
    return speciesLab.find((species) => species.id === id) || speciesLab[0];
  }

  // One-time check that the quiz data is internally consistent. Logs loudly rather
  // than failing silently (or crashing) if an item's slug/name gets out of sync.
  function validateQuizData() {
    const names = new Set();
    quizItems.forEach((item) => {
      if (names.has(item.name)) console.error(`Duplicate quiz name: ${item.name}`);
      names.add(item.name);
      if (!quizFieldGuide[item.slug]) console.error(`Missing field guide for slug: ${item.slug}`);
    });
  }

  // Shared context passed to every feature module. Module instances are assigned
  // below after creation, so cross-module calls (builder <-> dna) resolve lazily.
  const ctx = {
    state,
    helpers,
    slots,
    speciesLab,
    quizItems,
    quizFieldGuide,
    quizChoicePools,
    geneGoals,
    getGuide,
    getSpecies,
    showTab,
    builder: null,
    dna: null,
    gallery: null
  };

  const store = window.createDinoStore({
    cleanPlayerName,
    readJsonStorage,
    writeJsonStorage,
    seed: window.DinoPlayerData || { players: [], leaderboard: [] },
    todayDisplay,
    todayISO
  });

  const celebrate = window.DinoCelebrate || null;
  const progression = window.createProgression({
    store,
    data: window.DinoData,
    helpers,
    celebrate
  });
  ctx.store = store;
  ctx.progression = progression;

  ctx.builder = window.createBuilder(ctx);
  ctx.dna = window.createDna(ctx);
  ctx.gallery = window.createGallery(ctx);

  const quizController = window.createQuizController({
    state,
    store,
    progression,
    quizItems,
    quizChoicePools,
    getGuide,
    shuffle,
    escapeHtml,
    $,
    $$,
    cleanPlayerName,
    readTextStorage,
    writeTextStorage,
    isoWeek,
    celebrate
  });

  function showTab(tabName) {
    document.body.classList.remove("landing-active");
    $(".game-shell").classList.toggle("quiz-focus", tabName === "quiz");
    $(".game-shell").classList.toggle("gallery-focus", tabName === "gallery" || tabName === "galleryQuiz");
    if (tabName === "gallery") ctx.gallery.renderGallery();
    if (tabName === "galleryQuiz") ctx.gallery.renderGallery({ quizMode: true });
    if (tabName === "parts") ctx.builder.renderShop();
    $$(".app-nav-button").forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });
    $$(".app-nav-button[data-tab]").forEach((item) => {
      const active = item.dataset.tab === tabName;
      if (active) {
        item.classList.add("is-active");
        item.setAttribute("aria-current", "page");
      }
    });
    $$(".tab-panel").forEach((panel) => panel.classList.remove("is-active"));
    $(`#${tabName}Panel`).classList.add("is-active");
  }

  function showLanding() {
    document.body.classList.add("landing-active");
    $(".game-shell").classList.remove("quiz-focus", "gallery-focus");
    $$(".app-nav-button").forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });
    $("[data-nav-home]").classList.add("is-active");
    $("[data-nav-home]").setAttribute("aria-current", "page");
  }

  function bindNavigation() {
    $$(".app-nav-button[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => showTab(tab.dataset.tab));
    });
    $("[data-nav-home]").addEventListener("click", showLanding);
  }

  function bindPrintControls() {
    $("#landingPrint").addEventListener("click", () => {
      document.body.dataset.printMode = "landing";
      window.print();
    });
    $("#galleryPrint").addEventListener("click", () => {
      document.body.dataset.printMode = "gallery";
      window.print();
    });
    $("#galleryQuizPrint").addEventListener("click", () => {
      document.body.dataset.printMode = "galleryQuiz";
      window.print();
    });
    window.addEventListener("afterprint", () => {
      delete document.body.dataset.printMode;
    });
  }

  function bindAppEvents() {
    bindNavigation();
    ctx.builder.bindBuilderControls();
    ctx.dna.bindDnaControls();
    quizController.bindQuizControls();
    bindPrintControls();
  }

  async function initializeApp() {
    validateQuizData();
    ctx.builder.buildControls();
    ctx.dna.buildDnaLab();
    bindAppEvents();
    await quizController.loadPermanentLeaderboard();
    quizController.renderPlayerProfile();
    quizController.renderLeaderboard();
    quizController.startQuizRound();
    ctx.gallery.renderGallery();
    ctx.gallery.renderGallery({ quizMode: true });
    ctx.builder.syncInputs();
    ctx.builder.renderDino();
  }

  initializeApp();
})();
