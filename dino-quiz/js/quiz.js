(function () {
  "use strict";

  const PLAYER_STORAGE_KEY = "dinoQuizPlayerName";
  const LEADERBOARD_LIMIT = 5;

  window.createQuizController = function createQuizController(deps) {
    const {
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
    } = deps;

    // Quiz controller owns its own DOM lookups (no giant elements bag passed in).
    const el = {
      quizImage: $("#quizImage"),
      quizOptions: $("#quizOptions"),
      quizFeedback: $("#quizFeedback"),
      quizScore: $("#quizScore"),
      quizTotal: $("#quizTotal"),
      quizStreak: $("#quizStreak"),
      quizPlayerForm: $("#quizPlayerForm"),
      quizPlayerSelect: $("#quizPlayerSelect"),
      quizPlayerName: $("#quizPlayerName"),
      quizPlayerStatus: $("#quizPlayerStatus"),
      addExplorerBtn: $("#addExplorerBtn"),
      manageExplorersBtn: $("#manageExplorersBtn"),
      explorerManager: $("#explorerManager"),
      explorerManagerList: $("#explorerManagerList"),
      quizLeaderboardList: $("#quizLeaderboardList"),
      quizLeaderboardTag: $("#quizLeaderboardTag"),
      landingLeaderboardList: $("#landingLeaderboardList"),
      landingLeaderboardTag: $("#landingLeaderboardTag"),
      exportLeaderboardBtn: $("#exportLeaderboardBtn"),
      leaderboardSaveStatus: $("#leaderboardSaveStatus"),
      nextQuizBtn: $("#nextQuizBtn"),
      quizDifficulty: $("#quizDifficulty"),
      quizPotential: $("#quizPotential"),
      hintQuizBtn: $("#hintQuizBtn"),
      quizEra: $("#quizEra"),
      quizView: $("#quizView"),
      quizPrompt: $("#quizPrompt"),
      trophyShelf: $("#trophyShelf"),
      quizDexProgress: $("#quizDexProgress"),
      quizDexPill: $("#quizDexPill"),
      quizDexBar: $("#quizDexBar"),
      quizRankBar: $("#quizRankBar"),
      quizCoinChip: $("#quizCoinChip"),
      quizCoinValue: $("#quizCoinValue"),
      lbScope: $("#lbScope"),
      expeditionCard: $("#expeditionCard"),
      expeditionName: $("#expeditionName"),
      expeditionBlurb: $("#expeditionBlurb"),
      expeditionBtn: $("#expeditionBtn")
    };

    state.lbScope = state.lbScope || "week";
    state.quizExpedition = state.quizExpedition || null;
    const expeditions = (window.DinoData && window.DinoData.expeditions) || [];

    state.playerName = cleanPlayerName(readTextStorage(PLAYER_STORAGE_KEY) || "");

    const quizDifficultySettings = {
      easy: {
        label: "Easy",
        points: 10,
        hintCost: 3,
        choiceCount: 4,
        slugs: [
          "tyrannosaurus",
          "triceratops",
          "stegosaurus",
          "velociraptor",
          "brachiosaurus",
          "spinosaurus",
          "ankylosaurus",
          "parasaurolophus",
          "allosaurus",
          "archaeopteryx"
        ]
      },
      medium: {
        label: "Medium",
        points: 15,
        hintCost: 4,
        choiceCount: 4,
        slugs: [
          "tyrannosaurus",
          "triceratops",
          "spinosaurus",
          "parasaurolophus",
          "allosaurus",
          "brachiosaurus",
          "stegosaurus",
          "ankylosaurus",
          "velociraptor",
          "carnotaurus",
          "dilophosaurus",
          "gallimimus",
          "pachycephalosaurus",
          "iguanodon",
          "diplodocus",
          "apatosaurus",
          "deinonychus",
          "microraptor",
          "archaeopteryx",
          "therizinosaurus",
          "oviraptor",
          "corythosaurus",
          "lambeosaurus",
          "edmontosaurus"
        ]
      },
      hard: {
        label: "Hard",
        points: 25,
        hintCost: 6,
        choiceCount: 6,
        slugs: null
      }
    };

    const QUIZ_ROUND_SIZE = 10;

    function quizDifficultySetting() {
      return quizDifficultySettings[state.quizDifficulty] || quizDifficultySettings.easy;
    }

    function dayOfYear() {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      return Math.floor((now - start) / 86400000);
    }

    // Deterministic daily theme: same all day, new one tomorrow.
    function todaysExpedition() {
      if (!expeditions.length) return null;
      return expeditions[dayOfYear() % expeditions.length];
    }

    function renderExpeditionCard() {
      const theme = todaysExpedition();
      if (!el.expeditionCard) return;
      if (!theme) {
        el.expeditionCard.hidden = true;
        return;
      }
      el.expeditionCard.hidden = false;
      const active = Boolean(state.quizExpedition);
      el.expeditionName.textContent = `🧭 ${theme.name}`;
      el.expeditionBlurb.textContent = active
        ? "Expedition in progress · +50% Fossil Coins"
        : `${theme.blurb} · +50% Fossil Coins`;
      el.expeditionBtn.textContent = active ? "Exit Expedition" : "Start Expedition";
      el.expeditionCard.classList.toggle("is-active", active);
    }

    function toggleExpedition() {
      state.quizExpedition = state.quizExpedition ? null : todaysExpedition();
      renderExpeditionCard();
      startQuizRound();
    }

    function setSaveStatus(message) {
      if (el.leaderboardSaveStatus) el.leaderboardSaveStatus.textContent = message;
    }

    async function loadPermanentLeaderboard() {
      const { serverAvailable } = await store.load();
      setSaveStatus(serverAvailable
        ? "Permanent leaderboard loaded."
        : "Permanent saving needs the Dino Quiz local server.");
    }

    function renderPlayerSelect() {
      if (!el.quizPlayerSelect) return;
      const players = store.getPlayers();
      el.quizPlayerSelect.innerHTML = [
        `<option value="">Choose explorer</option>`,
        ...players.map((player) => {
          const selected = player.name === state.playerName ? " selected" : "";
          return `<option value="${escapeHtml(player.name)}"${selected}>${escapeHtml(player.name)}</option>`;
        })
      ].join("");
    }

    function renderExplorerManager() {
      if (!el.explorerManagerList) return;
      const players = store.getPlayers();
      el.explorerManagerList.innerHTML = players.length ? players.map((player) => {
        const scoreCount = store.playerScoreCount(player.name);
        return `
          <li>
            <span>${escapeHtml(player.name)}${scoreCount ? ` (${scoreCount} score${scoreCount === 1 ? "" : "s"})` : ""}</span>
            <button class="secondary-button" type="button" data-action="use" data-name="${escapeHtml(player.name)}">Use</button>
            <button class="secondary-button" type="button" data-action="forget" data-name="${escapeHtml(player.name)}">Remove</button>
            <button class="secondary-button" type="button" data-action="clear" data-name="${escapeHtml(player.name)}">Clear Scores</button>
          </li>
        `;
      }).join("") : `
        <li class="is-empty">No explorers yet.</li>
      `;
    }

    function refreshExplorerControls() {
      renderPlayerSelect();
      renderExplorerManager();
    }

    function renderDexProgress() {
      if (!el.quizDexProgress) return;
      if (!state.playerName || !progression) {
        el.quizDexProgress.hidden = true;
        return;
      }
      const count = progression.dexCount(state.playerName);
      const total = progression.totalDinos || 50;
      el.quizDexProgress.hidden = false;
      el.quizDexPill.textContent = `🦕 ${count}/${total} discovered`;
      el.quizDexBar.style.setProperty("--dex", `${Math.round((count / total) * 100)}%`);
    }

    function renderCoins() {
      if (!el.quizCoinChip) return;
      if (!state.playerName || !progression) {
        el.quizCoinChip.hidden = true;
        return;
      }
      el.quizCoinChip.hidden = false;
      el.quizCoinValue.textContent = progression.coinsOf(state.playerName);
    }

    function renderPlayerProfile() {
      el.quizPlayerName.value = "";
      refreshExplorerControls();
      const count = store.getPlayers().length;
      if (state.playerName) {
        el.quizPlayerStatus.textContent = `${state.playerName} is checked in. ${count} explorers are remembered.`;
        el.quizPlayerForm.classList.add("is-registered");
      } else {
        el.quizPlayerStatus.textContent = `Register your field badge to start scoring. ${count} explorers remembered.`;
        el.quizPlayerForm.classList.remove("is-registered");
      }
      if (progression) {
        progression.renderTrophyShelf(el.trophyShelf, state.playerName);
        progression.renderRankBar(el.quizRankBar, state.playerName);
      }
      renderDexProgress();
      renderCoins();
    }

    function setActivePlayer(name, { start = true } = {}) {
      const cleanName = cleanPlayerName(name);
      if (!cleanName) {
        state.playerName = "";
        writeTextStorage(PLAYER_STORAGE_KEY, "");
        renderPlayerProfile();
        return false;
      }
      state.playerName = cleanName;
      writeTextStorage(PLAYER_STORAGE_KEY, cleanName);
      store.upsertPlayer(cleanName);
      renderPlayerProfile();
      if (start) startQuizRound();
      return true;
    }

    function leaderboardMarkup(entries) {
      return entries.length ? entries.map((entry, index) => {
        const rankIcon = progression ? progression.rankIcon(entry.name) : "";
        const badgeIcons = progression ? progression.badgeIconsFor(entry.name, 3) : "";
        return `
        <li class="${index === 0 ? "is-champion" : ""}">
          <span>${rankIcon ? `<span class="lb-rank" title="Rank">${rankIcon}</span>` : ""}${escapeHtml(entry.name)}<span class="lb-badges">${badgeIcons}</span></span>
          <b>${entry.score} pts</b>
          <small>${escapeHtml(entry.difficulty)} - ${entry.accuracy}% - ${escapeHtml(entry.title || "Fossil Hunter")} - ${escapeHtml(entry.date)}</small>
        </li>
      `;
      }).join("") : `
        <li class="is-empty">
          <span>No champs yet</span>
          <small>Register your name, finish a round, and claim the fossil crown.</small>
        </li>
      `;
    }

    function currentWeekKey() {
      return isoWeek ? isoWeek(new Date()) : "";
    }

    // Weekly scope keeps only entries stamped this ISO week (legacy entries with
    // no dateISO only ever show in the all-time Hall of Fame).
    function scopedEntries(scope) {
      const all = store.getLeaderboard();
      if (scope === "week") {
        const week = currentWeekKey();
        return all.filter((entry) => entry.dateISO && isoWeek(entry.dateISO) === week).slice(0, LEADERBOARD_LIMIT);
      }
      return all.slice(0, LEADERBOARD_LIMIT);
    }

    function renderLeaderboardTarget(listEl, tagEl, entries, scope) {
      if (!listEl || !tagEl) return;
      if (scope === "week") {
        tagEl.textContent = entries.length ? "This week's top hunters" : "No champs this week yet";
      } else {
        tagEl.textContent = entries.length ? "All-time top hunters" : "Be the first champ";
      }
      listEl.innerHTML = leaderboardMarkup(entries);
    }

    function renderLeaderboard() {
      const scope = state.lbScope || "week";
      const entries = scopedEntries(scope);
      renderLeaderboardTarget(el.quizLeaderboardList, el.quizLeaderboardTag, entries, scope);
      // The landing board always shows the all-time Hall of Fame.
      renderLeaderboardTarget(el.landingLeaderboardList, el.landingLeaderboardTag, scopedEntries("all"), "all");
    }

    function savePlayerName() {
      const name = cleanPlayerName(el.quizPlayerSelect.value || el.quizPlayerName.value);
      if (!name) {
        state.playerName = "";
        el.quizPlayerSelect.value = "";
        el.quizPlayerStatus.textContent = "Add your explorer name first.";
        el.quizPlayerForm.classList.remove("is-registered");
        return;
      }
      setActivePlayer(name);
      el.quizPlayerName.value = "";
    }

    function addExplorer() {
      const name = cleanPlayerName(el.quizPlayerName.value);
      if (!name) {
        el.quizPlayerStatus.textContent = "Type a new explorer name first.";
        return;
      }
      setActivePlayer(name);
      el.quizPlayerName.value = "";
      setSaveStatus("Explorer added. Press Save Leaderboard when ready.");
    }

    function forgetExplorer(name) {
      const cleanName = cleanPlayerName(name);
      store.removePlayer(cleanName);
      if (state.playerName.toLowerCase() === cleanName.toLowerCase()) {
        state.playerName = "";
        writeTextStorage(PLAYER_STORAGE_KEY, "");
      }
      renderPlayerProfile();
      renderLeaderboard();
      setSaveStatus("Explorer list updated. Press Save Leaderboard when ready.");
    }

    function clearExplorerScores(name) {
      store.clearScores(cleanPlayerName(name));
      renderPlayerProfile();
      renderLeaderboard();
      setSaveStatus("Explorer scores cleared here. Press Save Leaderboard when ready.");
    }

    function saveQuizResult({ maxScore, accuracy, resultTitle }) {
      if (state.quizResultSaved || !state.playerName) return false;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const now = new Date();
      const entry = {
        id,
        name: state.playerName,
        score: state.quizScore,
        maxScore,
        accuracy,
        hints: state.quizRoundHints,
        difficulty: quizDifficultySetting().label,
        title: resultTitle,
        date: now.toLocaleDateString(),
        dateISO: now.toISOString().slice(0, 10)
      };
      const madeBoard = store.addResult(entry);
      state.quizResultSaved = true;
      renderLeaderboard();
      // "Made the board" = ranks within the visible top slice.
      return store.getLeaderboard(LEADERBOARD_LIMIT).some((item) => item.id === id) && madeBoard;
    }

    async function savePermanentLeaderboard() {
      setSaveStatus("Saving leaderboard...");
      const result = await store.save();
      renderLeaderboard();
      renderPlayerProfile();
      if (result.ok) {
        setSaveStatus("Leaderboard saved to this repo. Commit and push when ready.");
      } else {
        setSaveStatus("Permanent saving needs the Dino Quiz local server. Your score is still saved in this browser.");
      }
    }

    function quizPoolIndices() {
      const setting = quizDifficultySetting();
      if (!setting.slugs) return quizItems.map((_, index) => index);
      const slugs = new Set(setting.slugs);
      const indices = quizItems.map((item, index) => (slugs.has(item.slug) ? index : -1)).filter((index) => index >= 0);
      return indices.length ? indices : quizItems.map((_, index) => index);
    }

    function matchesTheme(item, theme) {
      if (!theme) return false;
      if (theme.eras && theme.eras.includes(item.era)) return true;
      if (theme.groups && theme.groups.includes(item.group)) return true;
      return false;
    }

    // The pool a round draws from: the difficulty pool, or (in expedition mode)
    // every dinosaur matching today's theme, padded from the full set if scarce.
    function roundPoolIndices() {
      if (!state.quizExpedition) return quizPoolIndices();
      const theme = state.quizExpedition;
      let pool = quizItems.map((item, index) => (matchesTheme(item, theme) ? index : -1)).filter((index) => index >= 0);
      if (pool.length < 8) {
        const used = new Set(pool);
        const extra = shuffle(quizItems.map((_, index) => index).filter((index) => !used.has(index)));
        pool = [...pool, ...extra].slice(0, 8);
      }
      return pool;
    }

    // Boss pool = "rarer" dinosaurs (not in the easy set; on Easy, from the
    // medium-but-not-easy set) so the final question always feels special.
    function bossPoolIndices() {
      const easy = new Set(quizDifficultySettings.easy.slugs);
      const medium = new Set(quizDifficultySettings.medium.slugs);
      let pool;
      if (state.quizDifficulty === "easy") {
        pool = quizItems.map((item, index) => (medium.has(item.slug) && !easy.has(item.slug) ? index : -1)).filter((index) => index >= 0);
      } else {
        pool = quizItems.map((item, index) => (!easy.has(item.slug) ? index : -1)).filter((index) => index >= 0);
      }
      return pool.length ? pool : quizItems.map((_, index) => index);
    }

    function pickBoss(usedIndices) {
      const used = new Set(usedIndices);
      // In expedition mode keep the boss on-theme; prefer a rarer theme member.
      if (state.quizExpedition) {
        const themePool = roundPoolIndices().filter((index) => !used.has(index));
        const rareSet = new Set(bossPoolIndices());
        const rareThemed = themePool.filter((index) => rareSet.has(index));
        const pick = shuffle(rareThemed.length ? rareThemed : themePool);
        return pick.length ? pick[0] : null;
      }
      const rare = shuffle(bossPoolIndices().filter((index) => !used.has(index)));
      if (rare.length) return rare[0];
      const any = shuffle(roundPoolIndices().filter((index) => !used.has(index)));
      return any.length ? any[0] : null;
    }

    // Up to three previously-missed dinosaurs the player can re-dig this round.
    // Re-digs are second chances, so they may appear even if the missed dinosaur
    // is not part of the current difficulty pool.
    function redigIndices() {
      const player = state.playerName && store ? store.getPlayer(state.playerName) : null;
      if (!player) return [];
      const bySlug = new Map(quizItems.map((item, index) => [item.slug, index]));
      return player.profile.redig
        .map((entry) => bySlug.get(entry.slug))
        .filter((index) => index != null)
        .slice(0, 3);
    }

    function startQuizRound() {
      state.quizScore = 0;
      state.quizTotal = 0;
      state.quizCorrect = 0;
      state.quizStreak = 0;
      state.quizAnswered = false;
      state.quizHintsUsed = 0;
      state.quizRoundHints = 0;
      state.quizRoundComplete = false;
      state.quizResultSaved = false;
      state.currentItem = null;
      state.quizMaxStreak = 0;
      state.quizNewDiscoveries = [];
      state.quizLastCorrectItem = null;
      state.quizBossWon = false;
      state.quizRedigCleared = 0;

      const pool = roundPoolIndices();
      // Re-dig items get first claim on the 9 non-boss slots (any missed dino).
      const redig = redigIndices();
      state.quizRedigSlugs = new Set(redig.map((index) => quizItems[index].slug));
      const rest = shuffle(pool.filter((index) => !state.quizRedigSlugs.has(quizItems[index].slug)));
      let firstNine = shuffle([...redig, ...rest].slice(0, QUIZ_ROUND_SIZE - 1));
      const bossIndex = pickBoss(firstNine);
      state.quizOrder = bossIndex != null ? [...firstNine, bossIndex] : shuffle(pool).slice(0, QUIZ_ROUND_SIZE);
      state.quizBossSlug = bossIndex != null ? quizItems[bossIndex].slug : null;
      state.quizIndex = 0;
      renderQuiz();
    }

    function currentQuizItem() {
      if (!state.quizOrder.length) {
        state.quizOrder = shuffle(quizPoolIndices()).slice(0, QUIZ_ROUND_SIZE);
        state.quizIndex = 0;
      }
      if (state.quizIndex >= state.quizOrder.length) return null;
      return quizItems[state.quizOrder[state.quizIndex]];
    }

    function quizChoices(item, overrideCount) {
      const setting = quizDifficultySetting();
      const targetCount = overrideCount || setting.choiceCount;
      const difficultyPool = quizPoolIndices().map((index) => quizItems[index].name);
      const groupPool = quizChoicePools[item.group] || [];
      const choices = [item.name];
      const candidates = shuffle([...groupPool, ...difficultyPool].filter((name) => name !== item.name));
      candidates.forEach((name) => {
        if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
      });
      shuffle(quizItems.map((quizItem) => quizItem.name)).forEach((name) => {
        if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
      });
      return shuffle(choices);
    }

    function renderQuiz() {
      const item = currentQuizItem();
      if (!item) {
        renderQuizResults();
        return;
      }
      // Grade against the specimen that was actually rendered, not a re-derived one
      // (currentQuizItem() has reshuffle side effects at the order boundary).
      state.currentItem = item;
      state.quizHintsUsed = 0;
      const setting = quizDifficultySetting();
      const isBoss = Boolean(state.quizBossSlug) && item.slug === state.quizBossSlug;
      const isRedig = state.quizRedigSlugs && state.quizRedigSlugs.has(item.slug);
      state.quizBoss = isBoss;
      state.quizPotential = isBoss ? setting.points * 2 : setting.points;
      const choices = quizChoices(item, isBoss ? setting.choiceCount + 1 : setting.choiceCount);
      el.quizImage.src = item.image;
      el.quizImage.alt = `Photorealistic quiz image of ${item.name}`;
      el.quizImage.classList.add("field-guide");
      const frame = el.quizImage.closest(".quiz-image-frame");
      if (frame) frame.classList.toggle("is-boss", isBoss);
      // Mark the correct option with a data flag so grading never depends on
      // re-matching display strings (robust to name collisions / stray characters).
      el.quizOptions.innerHTML = choices.map((choice) => `<button class="quiz-option" type="button" data-answer="${escapeHtml(choice)}" data-correct="${choice === item.name}">${escapeHtml(choice)}</button>`).join("");
      el.quizEra.textContent = item.era;
      el.quizView.textContent = `${setting.label} ${state.quizIndex + 1}/${QUIZ_ROUND_SIZE}`;
      if (isBoss) {
        el.quizPrompt.innerHTML = `<span class="boss-flag">⚠️ BOSS FOSSIL — double points!</span> Which dinosaur is this?`;
        if (celebrate) celebrate.sound("drumroll");
      } else if (isRedig) {
        el.quizPrompt.innerHTML = `<span class="redig-flag">⛏️ Re-dig</span> Which dinosaur is this?`;
      } else {
        el.quizPrompt.textContent = "Which dinosaur is this?";
      }
      el.quizFeedback.classList.remove("is-revealed");
      const registered = Boolean(state.playerName);
      el.quizFeedback.innerHTML = `<span class="quiz-intro">${registered ? "Choose carefully. Hints help, but each one lowers this fossil's point value." : "Type your explorer name and press Join Quiz to unlock the answers."}</span>`;
      el.quizScore.textContent = state.quizScore;
      el.quizTotal.textContent = state.quizTotal;
      el.quizStreak.textContent = `Streak ${state.quizStreak}`;
      el.quizDifficulty.value = state.quizDifficulty;
      el.quizPotential.textContent = state.quizPotential;
      el.hintQuizBtn.disabled = !registered;
      el.hintQuizBtn.textContent = registered ? `Get Hint (-${quizDifficultySetting().hintCost} pts)` : "Register first";
      el.nextQuizBtn.disabled = true;
      el.nextQuizBtn.textContent = "Next Fossil";
      state.quizAnswered = false;
      $$(".quiz-option", el.quizOptions).forEach((button) => {
        button.disabled = !registered;
      });
    }

    function revealQuizHint() {
      if (!state.playerName || state.quizAnswered || !state.currentItem) return;
      const item = state.currentItem;
      const guide = getGuide(item.slug);
      const setting = quizDifficultySetting();
      state.quizHintsUsed += 1;
      state.quizRoundHints += 1;
      state.quizPotential = Math.max(1, state.quizPotential - setting.hintCost);
      el.quizPotential.textContent = state.quizPotential;
      el.quizFeedback.classList.add("is-revealed");
      const hintText = [
        `Field clue: ${item.clue}`,
        `Habitat clue: ${guide.habitat}. Diet: ${guide.diet}.`,
        `Era clue: ${guide.lived}. Fossil family: ${item.group}.`
      ][state.quizHintsUsed - 1] || `Final clue: ${item.expertClue}`;
      if (state.quizHintsUsed === 3) {
        const wrongOptions = shuffle($$(".quiz-option", el.quizOptions).filter((button) => button.dataset.correct !== "true" && !button.disabled));
        wrongOptions.slice(0, 2).forEach((button) => {
          button.disabled = true;
          button.classList.add("is-eliminated");
        });
      }
      el.quizFeedback.innerHTML = `
        <div class="quiz-hint">
          <b>Hint ${state.quizHintsUsed}</b>
          <span>${escapeHtml(hintText)}</span>
          <small>This fossil is now worth up to ${state.quizPotential} points.</small>
        </div>
      `;
      if (state.quizHintsUsed >= 4 || state.quizPotential <= 1) {
        el.hintQuizBtn.disabled = true;
        el.hintQuizBtn.textContent = "Hints used";
      }
    }

    function answerQuiz(clicked) {
      if (!state.playerName || state.quizAnswered) return;
      const item = state.currentItem;
      const correct = clicked.dataset.correct === "true";
      state.quizAnswered = true;
      state.quizTotal += 1;
      if (correct) {
        state.quizScore += state.quizPotential;
        state.quizCorrect += 1;
        state.quizStreak += 1;
        state.quizMaxStreak = Math.max(state.quizMaxStreak || 0, state.quizStreak);
        state.quizLastCorrectItem = item;
        if (state.quizBoss) state.quizBossWon = true;
        // Clear a re-dig if this was one of the second-chance dinosaurs.
        if (state.quizRedigSlugs && state.quizRedigSlugs.has(item.slug)) {
          store.dequeueRedig(state.playerName, item.slug);
          state.quizRedigCleared = (state.quizRedigCleared || 0) + 1;
        }
        // Discovery is generous: any correct answer adds it to this explorer's Dino-Dex.
        if (store.discover(state.playerName, item.slug)) {
          (state.quizNewDiscoveries = state.quizNewDiscoveries || []).push(item);
        }
        if (celebrate) {
          celebrate.sound("correct");
          celebrate.burst(state.quizBoss || state.quizStreak >= 5 ? "medium" : "small");
        }
      } else {
        state.quizStreak = 0;
        // Missed dinosaurs go into the re-dig queue for a future round.
        store.enqueueRedig(state.playerName, item.slug);
        if (celebrate) celebrate.sound("wrong");
      }
      el.hintQuizBtn.disabled = true;
      el.hintQuizBtn.textContent = "Hint closed";
      el.nextQuizBtn.disabled = false;
      $$(".quiz-option", el.quizOptions).forEach((button) => {
        button.disabled = true;
        button.classList.toggle("correct", button.dataset.correct === "true");
        button.classList.toggle("wrong", button === clicked && !correct);
      });
      el.quizScore.textContent = state.quizScore;
      el.quizTotal.textContent = state.quizTotal;
      el.quizStreak.textContent = `Streak ${state.quizStreak}`;
      el.nextQuizBtn.textContent = state.quizTotal >= QUIZ_ROUND_SIZE ? "See Results" : "Next Fossil";
      renderQuizFeedback(item, correct);
    }

    function nextQuiz() {
      if (state.quizRoundComplete) {
        startQuizRound();
        return;
      }
      if (!state.quizAnswered) return;
      if (state.quizTotal >= QUIZ_ROUND_SIZE) {
        renderQuizResults();
        return;
      }
      state.quizIndex += 1;
      renderQuiz();
    }

    function renderQuizFeedback(item, correct) {
      const guide = getGuide(item.slug);
      const earned = correct ? state.quizPotential : 0;
      const streakNote = state.quizStreak >= 3 ? ` Hot streak: ${state.quizStreak} correct in a row.` : "";
      el.quizFeedback.classList.add("is-revealed");
      el.quizFeedback.innerHTML = `
        <div class="quiz-result ${correct ? "correct" : "wrong"}">${correct ? `Correct. +${earned} points.${streakNote}` : `Good try. The answer is ${escapeHtml(item.name)}.`}</div>
        <div class="dino-guide">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.clue)} ${escapeHtml(item.fact)}</p>
          <div class="guide-grid">
            <div><span>Time period</span><b>${escapeHtml(guide.lived)}</b></div>
            <div><span>Where it lived</span><b>${escapeHtml(guide.where)}</b></div>
            <div><span>Habitat</span><b>${escapeHtml(guide.habitat)}</b></div>
            <div><span>Diet</span><b>${escapeHtml(guide.diet)}</b></div>
          </div>
          <ul>${guide.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
        </div>
      `;
    }

    function quizExpertiseResult(percent, accuracy, hints) {
      if (percent >= 90 && accuracy >= 90 && hints <= 3) {
        return {
          title: "Expert Paleontologist",
          note: "Museum badge unlocked. You are reading fossils like a seasoned field scientist."
        };
      }
      if (percent >= 75 || accuracy >= 80) {
        return {
          title: "Fossil Field Captain",
          note: "You are close to expert level. A little less hint dust and you are expedition-ready."
        };
      }
      if (percent >= 55 || accuracy >= 60) {
        return {
          title: "Dino Detective",
          note: "Strong instincts. Keep matching shapes, eras, and body clues to sharpen your fossil eye."
        };
      }
      if (percent >= 35 || accuracy >= 40) {
        return {
          title: "Junior Bone Hunter",
          note: "The fossil trail is warming up. Try using one clue, then trust your first observation."
        };
      }
      return {
        title: "New Museum Intern",
        note: "Every expert starts with dusty boots. Visit the gallery, study a few silhouettes, and try again."
      };
    }

    function renderQuizResults() {
      const setting = quizDifficultySetting();
      const maxScore = setting.points * QUIZ_ROUND_SIZE;
      const scorePercent = Math.round((state.quizScore / maxScore) * 100);
      const accuracy = Math.round((state.quizCorrect / QUIZ_ROUND_SIZE) * 100);
      const result = quizExpertiseResult(scorePercent, accuracy, state.quizRoundHints);
      const madeLeaderboard = saveQuizResult({ maxScore, accuracy, resultTitle: result.title });
      state.quizRoundComplete = true;
      state.quizAnswered = true;
      state.currentItem = null;

      // Progression: record the play date, award any new trophies, refresh the
      // Dino-Dex, and stash a payload for the printable certificate.
      let earnedBadges = [];
      let rewards = { coinsEarned: 0, rankedUp: false };
      const newDiscoveries = state.quizNewDiscoveries || [];
      if (state.playerName && progression) {
        store.recordPlayDate(state.playerName);
        const perCorrect = { easy: 1, medium: 2, hard: 3 }[state.quizDifficulty] || 1;
        const roundData = {
          correct: state.quizCorrect,
          roundSize: QUIZ_ROUND_SIZE,
          score: state.quizScore,
          hints: state.quizRoundHints,
          accuracy,
          maxStreak: state.quizMaxStreak || 0,
          difficulty: state.quizDifficulty,
          // Boss win doubles that fossil's coins; expeditions add a +50% bonus.
          bossBonusCoins: state.quizBossWon ? perCorrect : 0,
          coinMultiplier: state.quizExpedition ? 1.5 : 1
        };
        // Award XP + coins first so rank/badge checks see the updated profile.
        rewards = progression.awardRoundRewards(state.playerName, roundData);
        earnedBadges = progression.evaluateRound(state.playerName, roundData);
        if (state.quizExpedition) store.recordExpedition(state.playerName, state.quizExpedition.id);
        const certDino = state.quizLastCorrectItem || quizItems[state.quizOrder[0]] || quizItems[0];
        state.lastCertificate = {
          name: state.playerName,
          title: result.title,
          score: state.quizScore,
          maxScore,
          accuracy,
          difficulty: setting.label,
          date: new Date().toLocaleDateString(),
          dinoImage: certDino ? certDino.image : "assets/quiz-tyrannosaurus.png",
          dinoName: certDino ? certDino.name : "Tyrannosaurus rex"
        };
      }

      if (celebrate) {
        celebrate.sound("fanfare");
        celebrate.burst(accuracy >= 80 ? "large" : "medium");
      }
      el.quizEra.textContent = `${setting.label} round complete`;
      el.quizView.textContent = `${state.quizCorrect}/${QUIZ_ROUND_SIZE} identified`;
      el.quizPrompt.textContent = "Expedition results";
      el.quizPotential.textContent = maxScore;
      el.quizScore.textContent = state.quizScore;
      el.quizTotal.textContent = QUIZ_ROUND_SIZE;
      el.quizStreak.textContent = `${accuracy}% accurate`;
      el.quizOptions.innerHTML = "";
      const discoveryNote = newDiscoveries.length
        ? `<div class="quiz-discoveries"><b>New for your Dino-Dex!</b><div class="discovery-row">${newDiscoveries.map((item) => `<figure><img src="${escapeHtml(item.image)}" alt=""><figcaption>${escapeHtml(item.name)}</figcaption></figure>`).join("")}</div></div>`
        : "";
      const badgeNote = earnedBadges.length
        ? `<div class="quiz-new-badges"><b>Trophies earned:</b> ${earnedBadges.map((badge) => `<span title="${escapeHtml(badge.name)}">${badge.icon} ${escapeHtml(badge.name)}</span>`).join(" ")}</div>`
        : "";
      const rewardNote = (rewards.coinsEarned || state.quizScore) && state.playerName
        ? `<div class="quiz-rewards"><span>🪙 +${rewards.coinsEarned} Fossil Coins${state.quizExpedition ? " (expedition +50%)" : ""}</span><span>⭐ +${state.quizScore} XP${rewards.rankedUp ? ` — new rank: ${escapeHtml(rewards.newRank.icon + " " + rewards.newRank.name)}!` : ""}</span></div>`
        : "";
      const redigNote = state.quizRedigCleared
        ? `<div class="quiz-redig-note">⛏️ Got it this time! You re-dug ${state.quizRedigCleared} tricky fossil${state.quizRedigCleared === 1 ? "" : "s"}.</div>`
        : "";
      const certButton = state.lastCertificate
        ? `<button class="primary-button print-certificate" id="printCertBtn" type="button">🎓 Print My Certificate</button>`
        : "";
      el.quizFeedback.classList.add("is-revealed");
      el.quizFeedback.innerHTML = `
        <div class="quiz-results">
          <span class="quiz-results-kicker">Round complete</span>
          <h3>${escapeHtml(state.playerName)}, ${escapeHtml(result.title)}</h3>
          <p>${escapeHtml(result.note)} ${madeLeaderboard ? "Your score zoomed onto the all-time board." : "That was a brave dig. Beat a top score to enter the all-time board."}</p>
          <div class="quiz-results-grid">
            <div><span>Score</span><b>${state.quizScore}/${maxScore}</b></div>
            <div><span>Accuracy</span><b>${accuracy}%</b></div>
            <div><span>Dinosaurs</span><b>${state.quizCorrect}/${QUIZ_ROUND_SIZE}</b></div>
            <div><span>Hints used</span><b>${state.quizRoundHints}</b></div>
          </div>
          ${rewardNote}
          ${redigNote}
          ${badgeNote}
          ${discoveryNote}
          ${certButton}
          <small>${escapeHtml(setting.label)} rounds use 10 randomly selected dinosaurs. Play again for a fresh fossil lineup.</small>
        </div>
      `;
      const certBtn = el.quizFeedback.querySelector("#printCertBtn");
      if (certBtn) certBtn.addEventListener("click", printCertificate);
      if (progression) {
        progression.announceBadges(earnedBadges);
        progression.renderTrophyShelf(el.trophyShelf, state.playerName);
        progression.renderRankBar(el.quizRankBar, state.playerName);
      }
      renderDexProgress();
      renderCoins();
      renderLeaderboard();
      el.hintQuizBtn.disabled = true;
      el.hintQuizBtn.textContent = "Round complete";
      el.nextQuizBtn.disabled = false;
      el.nextQuizBtn.textContent = "Play Again";
    }

    function printCertificate() {
      if (!state.lastCertificate || !progression) return;
      progression.renderCertificate(state.lastCertificate);
      document.body.dataset.printMode = "certificate";
      window.print();
    }

    function confirmDifficultyChange(nextValue) {
      // Changing difficulty mid-round would silently wipe the running score.
      const midRound = state.quizTotal > 0 && !state.quizRoundComplete;
      if (midRound && !window.confirm("Switching difficulty starts a new round. Switch now?")) {
        el.quizDifficulty.value = state.quizDifficulty;
        return;
      }
      state.quizDifficulty = nextValue;
      startQuizRound();
    }

    function bindQuizControls() {
      el.quizPlayerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        savePlayerName();
      });
      if (el.quizPlayerSelect) {
        el.quizPlayerSelect.addEventListener("change", () => {
          if (el.quizPlayerSelect.value) setActivePlayer(el.quizPlayerSelect.value);
        });
      }
      if (el.addExplorerBtn) {
        el.addExplorerBtn.addEventListener("click", addExplorer);
      }
      if (el.manageExplorersBtn && el.explorerManager) {
        el.manageExplorersBtn.addEventListener("click", () => {
          const isOpen = el.explorerManager.hidden;
          el.explorerManager.hidden = !isOpen;
          el.manageExplorersBtn.setAttribute("aria-expanded", String(isOpen));
          if (isOpen) renderExplorerManager();
        });
      }
      if (el.explorerManagerList) {
        el.explorerManagerList.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-action]");
          if (!button) return;
          const name = button.dataset.name || "";
          if (button.dataset.action === "use") setActivePlayer(name);
          if (button.dataset.action === "forget") forgetExplorer(name);
          if (button.dataset.action === "clear") clearExplorerScores(name);
        });
      }
      // One delegated listener instead of re-binding every option button per render.
      el.quizOptions.addEventListener("click", (event) => {
        const button = event.target.closest(".quiz-option");
        if (button && !button.disabled) answerQuiz(button);
      });
      if (el.lbScope) {
        el.lbScope.addEventListener("click", (event) => {
          const button = event.target.closest(".lb-scope-btn");
          if (!button) return;
          state.lbScope = button.dataset.scope;
          $$(".lb-scope-btn", el.lbScope).forEach((btn) => btn.classList.toggle("is-active", btn === button));
          renderLeaderboard();
        });
      }
      if (el.expeditionBtn) {
        el.expeditionBtn.addEventListener("click", toggleExpedition);
      }
      renderExpeditionCard();
      el.nextQuizBtn.addEventListener("click", nextQuiz);
      el.hintQuizBtn.addEventListener("click", revealQuizHint);
      if (el.exportLeaderboardBtn) {
        el.exportLeaderboardBtn.addEventListener("click", savePermanentLeaderboard);
      }
      el.quizDifficulty.addEventListener("change", (event) => {
        confirmDifficultyChange(event.target.value);
      });
    }

    return {
      bindQuizControls,
      loadPermanentLeaderboard,
      renderLeaderboard,
      renderPlayerProfile,
      startQuizRound
    };
  };
})();
