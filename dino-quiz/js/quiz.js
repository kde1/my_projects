(function () {
  "use strict";

  const PLAYER_STORAGE_KEY = "dinoQuizPlayerName";
  const LEADERBOARD_STORAGE_KEY = "dinoQuizLeaderboard";
  const PLAYER_REGISTRY_STORAGE_KEY = "dinoQuizPlayers";
  const LEADERBOARD_LIMIT = 5;
  const SAVED_RESULT_LIMIT = 25;

  window.createQuizController = function createQuizController(deps) {
    const {
      state,
      quizItems,
      quizChoicePools,
      getGuide,
      shuffle,
      escapeHtml,
      queryAll,
      cleanPlayerName,
      readJsonStorage,
      writeJsonStorage,
      readTextStorage,
      writeTextStorage,
      trackedPlayerData,
      elements
    } = deps;
    const {
      quizImage,
      quizOptions,
      quizFeedback,
      quizScore,
      quizTotal,
      quizStreak,
      quizPlayerForm,
      quizPlayerSelect,
      quizPlayerName,
      quizPlayerStatus,
      addExplorerBtn,
      manageExplorersBtn,
      explorerManager,
      explorerManagerList,
      quizLeaderboardList,
      quizLeaderboardTag,
      landingLeaderboardList,
      landingLeaderboardTag,
      exportLeaderboardBtn,
      leaderboardSaveStatus,
      nextQuizBtn,
      quizDifficulty,
      quizPotential,
      hintQuizBtn,
      quizEra,
      quizView,
      quizPrompt
    } = elements;

    let permanentPlayerData = normalizePlayerData(trackedPlayerData);

    state.playerName = cleanPlayerName(readTextStorage(PLAYER_STORAGE_KEY));

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
    
    function quizLeaderboard() {
      const entries = readJsonStorage(LEADERBOARD_STORAGE_KEY, []);
      const tracked = permanentPlayerData.leaderboard;
      const local = Array.isArray(entries) ? entries : [];
      return mergeById([...tracked, ...local])
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.hints - b.hints)
        .slice(0, LEADERBOARD_LIMIT);
    }

    function localLeaderboard() {
      const entries = readJsonStorage(LEADERBOARD_STORAGE_KEY, []);
      return Array.isArray(entries) ? entries : [];
    }

    function quizPlayers() {
      const localPlayers = readJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, []);
      const trackedPlayers = permanentPlayerData.players;
      const leaderboardPlayers = mergeById([...permanentPlayerData.leaderboard, ...localLeaderboard()])
        .map((entry) => ({ name: entry.name, firstSeen: entry.date || new Date().toLocaleDateString() }));
      return mergeByName([...trackedPlayers, ...leaderboardPlayers, ...(Array.isArray(localPlayers) ? localPlayers : [])]);
    }

    function normalizePlayerData(data) {
      return {
        players: Array.isArray(data && data.players) ? data.players : [],
        leaderboard: Array.isArray(data && data.leaderboard) ? data.leaderboard : []
      };
    }

    function canUsePermanentServer() {
      return window.location.protocol === "http:" || window.location.protocol === "https:";
    }

    function setSaveStatus(message) {
      if (leaderboardSaveStatus) leaderboardSaveStatus.textContent = message;
    }

    function permanentPayload() {
      return {
        players: quizPlayers(),
        leaderboard: mergeById([...permanentPlayerData.leaderboard, ...quizLeaderboard(), ...localLeaderboard()])
          .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.hints - b.hints)
          .slice(0, SAVED_RESULT_LIMIT)
      };
    }

    async function loadPermanentLeaderboard() {
      if (!canUsePermanentServer()) {
        setSaveStatus("Permanent saving needs the Dino Quiz local server.");
        return;
      }
      try {
        const response = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!response.ok) throw new Error("Leaderboard API unavailable.");
        permanentPlayerData = normalizePlayerData(await response.json());
        setSaveStatus("Permanent leaderboard loaded.");
      } catch (error) {
        setSaveStatus("Permanent saving needs the Dino Quiz local server.");
      }
    }

    function mergeById(entries) {
      const seen = new Set();
      return entries.filter((entry) => {
        const id = entry.id || `${entry.name}-${entry.score}-${entry.date}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    function mergeByName(players) {
      const seen = new Set();
      return players.filter((player) => {
        const name = cleanPlayerName(player.name || "");
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return false;
        player.name = name;
        seen.add(key);
        return true;
      });
    }

    function rememberPlayer(name) {
      const players = mergeByName([...quizPlayers(), { name, firstSeen: new Date().toLocaleDateString() }]);
      writeJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, players);
    }

    function writePlayers(players) {
      const cleanPlayers = mergeByName(players);
      permanentPlayerData = {
        ...permanentPlayerData,
        players: cleanPlayers
      };
      writeJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, cleanPlayers);
    }

    function playerScoreCount(name) {
      const key = name.toLowerCase();
      return mergeById([...permanentPlayerData.leaderboard, ...localLeaderboard()])
        .filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() === key)
        .length;
    }

    function renderPlayerSelect() {
      if (!quizPlayerSelect) return;
      const players = quizPlayers();
      quizPlayerSelect.innerHTML = [
        `<option value="">Choose explorer</option>`,
        ...players.map((player) => {
          const selected = player.name === state.playerName ? " selected" : "";
          return `<option value="${escapeHtml(player.name)}"${selected}>${escapeHtml(player.name)}</option>`;
        })
      ].join("");
    }

    function renderExplorerManager() {
      if (!explorerManagerList) return;
      const players = quizPlayers();
      explorerManagerList.innerHTML = players.length ? players.map((player) => {
        const scoreCount = playerScoreCount(player.name);
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
    
    function renderPlayerProfile() {
      quizPlayerName.value = "";
      refreshExplorerControls();
      if (state.playerName) {
        quizPlayerStatus.textContent = `${state.playerName} is checked in. ${quizPlayers().length} explorers are remembered.`;
        quizPlayerForm.classList.add("is-registered");
      } else {
        quizPlayerStatus.textContent = `Register your field badge to start scoring. ${quizPlayers().length} explorers remembered.`;
        quizPlayerForm.classList.remove("is-registered");
      }
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
      rememberPlayer(cleanName);
      renderPlayerProfile();
      if (start) startQuizRound();
      return true;
    }
    
    function leaderboardMarkup(entries) {
      return entries.length ? entries.map((entry, index) => `
        <li class="${index === 0 ? "is-champion" : ""}">
          <span>${escapeHtml(entry.name)}</span>
          <b>${entry.score} pts</b>
          <small>${escapeHtml(entry.difficulty)} - ${entry.accuracy}% - ${escapeHtml(entry.title || "Fossil Hunter")} - ${entry.date}</small>
        </li>
      `).join("") : `
        <li class="is-empty">
          <span>No champs yet</span>
          <small>Register your name, finish a round, and claim the fossil crown.</small>
        </li>
      `;
    }

    function renderLeaderboardTarget(listEl, tagEl, entries) {
      if (!listEl || !tagEl) return;
      tagEl.textContent = entries.length ? "Top fossil hunters" : "Be the first champ";
      listEl.innerHTML = leaderboardMarkup(entries);
    }
    
    function renderLeaderboard() {
      const entries = quizLeaderboard();
      renderLeaderboardTarget(quizLeaderboardList, quizLeaderboardTag, entries);
      renderLeaderboardTarget(landingLeaderboardList, landingLeaderboardTag, entries);
    }
    
    function savePlayerName() {
      const name = cleanPlayerName(quizPlayerSelect.value || quizPlayerName.value);
      if (!name) {
        state.playerName = "";
        quizPlayerSelect.value = "";
        quizPlayerStatus.textContent = "Add your explorer name first.";
        quizPlayerForm.classList.remove("is-registered");
        return;
      }
      setActivePlayer(name);
      quizPlayerName.value = "";
    }

    function addExplorer() {
      const name = cleanPlayerName(quizPlayerName.value);
      if (!name) {
        quizPlayerStatus.textContent = "Type a new explorer name first.";
        return;
      }
      setActivePlayer(name);
      quizPlayerName.value = "";
      setSaveStatus("Explorer added. Press Save Leaderboard when ready.");
    }

    function forgetExplorer(name) {
      const cleanName = cleanPlayerName(name);
      const key = cleanName.toLowerCase();
      writePlayers(quizPlayers().filter((player) => player.name.toLowerCase() !== key));
      permanentPlayerData = {
        ...permanentPlayerData,
        leaderboard: permanentPlayerData.leaderboard.filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key)
      };
      writeJsonStorage(
        LEADERBOARD_STORAGE_KEY,
        localLeaderboard().filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key)
      );
      if (state.playerName.toLowerCase() === key) {
        state.playerName = "";
        writeTextStorage(PLAYER_STORAGE_KEY, "");
      }
      renderPlayerProfile();
      renderLeaderboard();
      setSaveStatus("Explorer list updated. Press Save Leaderboard when ready.");
    }

    function clearExplorerScores(name) {
      const cleanName = cleanPlayerName(name);
      const key = cleanName.toLowerCase();
      writePlayers([...quizPlayers(), { name: cleanName, firstSeen: new Date().toLocaleDateString() }]);
      const keepScores = localLeaderboard().filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key);
      const keepPermanentScores = permanentPlayerData.leaderboard.filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key);
      permanentPlayerData = {
        ...permanentPlayerData,
        leaderboard: keepPermanentScores
      };
      writeJsonStorage(LEADERBOARD_STORAGE_KEY, keepScores);
      renderPlayerProfile();
      renderLeaderboard();
      setSaveStatus("Explorer scores cleared here. Press Save Leaderboard when ready.");
    }
    
    function saveQuizResult({ maxScore, accuracy, resultTitle }) {
      if (state.quizResultSaved || !state.playerName) return false;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const entry = {
        id,
        name: state.playerName,
        score: state.quizScore,
        maxScore,
        accuracy,
        hints: state.quizRoundHints,
        difficulty: quizDifficultySetting().label,
        title: resultTitle,
        date: new Date().toLocaleDateString()
      };
      const entries = [...localLeaderboard(), entry]
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.hints - b.hints)
        .slice(0, SAVED_RESULT_LIMIT);
      writeJsonStorage(LEADERBOARD_STORAGE_KEY, entries);
      state.quizResultSaved = quizLeaderboard().some((item) => item.id === id);
      renderLeaderboard();
      return state.quizResultSaved;
    }

    async function savePermanentLeaderboard() {
      const payload = permanentPayload();
      writeJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, payload.players);
      writeJsonStorage(LEADERBOARD_STORAGE_KEY, payload.leaderboard);

      if (!canUsePermanentServer()) {
        setSaveStatus("Permanent saving needs the Dino Quiz local server. Your score is still saved in this browser.");
        renderLeaderboard();
        return;
      }

      setSaveStatus("Saving leaderboard...");
      try {
        const response = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Save failed.");
        permanentPlayerData = normalizePlayerData(await response.json());
        renderLeaderboard();
        setSaveStatus("Leaderboard saved to this repo. Commit and push when ready.");
      } catch (error) {
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
      state.quizOrder = shuffle(quizPoolIndices()).slice(0, QUIZ_ROUND_SIZE);
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
    
    function quizChoices(item) {
      const setting = quizDifficultySetting();
      const targetCount = setting.choiceCount;
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
      state.quizPotential = quizDifficultySetting().points;
      const choices = quizChoices(item);
      quizImage.src = item.image;
      quizImage.alt = `Photorealistic quiz image of ${item.name}`;
      quizImage.style.objectPosition = "50% 50%";
      quizImage.style.transform = "scale(1)";
      quizImage.classList.remove("expert-crop");
      quizImage.classList.add("field-guide");
      // Mark the correct option with a data flag so grading never depends on
      // re-matching display strings (robust to name collisions / stray characters).
      quizOptions.innerHTML = choices.map((choice) => `<button class="quiz-option" type="button" data-answer="${escapeHtml(choice)}" data-correct="${choice === item.name}">${escapeHtml(choice)}</button>`).join("");
      quizEra.textContent = item.era;
      quizView.textContent = `${quizDifficultySetting().label} ${state.quizIndex + 1}/${QUIZ_ROUND_SIZE}`;
      quizPrompt.textContent = "Which dinosaur is this?";
      quizFeedback.classList.remove("is-revealed");
      const registered = Boolean(state.playerName);
      quizFeedback.innerHTML = `<span class="quiz-intro">${registered ? "Choose carefully. Hints help, but each one lowers this fossil's point value." : "Type your explorer name and press Join Quiz to unlock the answers."}</span>`;
      quizScore.textContent = state.quizScore;
      quizTotal.textContent = state.quizTotal;
      quizStreak.textContent = `Streak ${state.quizStreak}`;
      quizDifficulty.value = state.quizDifficulty;
      quizPotential.textContent = state.quizPotential;
      hintQuizBtn.disabled = !registered;
      hintQuizBtn.textContent = registered ? `Get Hint (-${quizDifficultySetting().hintCost} pts)` : "Register first";
      nextQuizBtn.disabled = true;
      nextQuizBtn.textContent = "Next Fossil";
      state.quizAnswered = false;
      queryAll(".quiz-option", quizOptions).forEach((button) => {
        button.disabled = !registered;
        button.addEventListener("click", () => answerQuiz(button));
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
      quizPotential.textContent = state.quizPotential;
      quizFeedback.classList.add("is-revealed");
      const hintText = [
        `Field clue: ${item.clue}`,
        `Habitat clue: ${guide.habitat}. Diet: ${guide.diet}.`,
        `Era clue: ${guide.lived}. Fossil family: ${item.group}.`
      ][state.quizHintsUsed - 1] || `Final clue: ${item.expertClue}`;
      if (state.quizHintsUsed === 3) {
        const wrongOptions = shuffle(queryAll(".quiz-option", quizOptions).filter((button) => button.dataset.correct !== "true" && !button.disabled));
        wrongOptions.slice(0, 2).forEach((button) => {
          button.disabled = true;
          button.classList.add("is-eliminated");
        });
      }
      quizFeedback.innerHTML = `
        <div class="quiz-hint">
          <b>Hint ${state.quizHintsUsed}</b>
          <span>${escapeHtml(hintText)}</span>
          <small>This fossil is now worth up to ${state.quizPotential} points.</small>
        </div>
      `;
      if (state.quizHintsUsed >= 4 || state.quizPotential <= 1) {
        hintQuizBtn.disabled = true;
        hintQuizBtn.textContent = "Hints used";
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
      } else {
        state.quizStreak = 0;
      }
      hintQuizBtn.disabled = true;
      hintQuizBtn.textContent = "Hint closed";
      nextQuizBtn.disabled = false;
      queryAll(".quiz-option", quizOptions).forEach((button) => {
        button.disabled = true;
        button.classList.toggle("correct", button.dataset.correct === "true");
        button.classList.toggle("wrong", button === clicked && !correct);
      });
      quizScore.textContent = state.quizScore;
      quizTotal.textContent = state.quizTotal;
      quizStreak.textContent = `Streak ${state.quizStreak}`;
      nextQuizBtn.textContent = state.quizTotal >= QUIZ_ROUND_SIZE ? "See Results" : "Next Fossil";
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
      quizFeedback.classList.add("is-revealed");
      quizFeedback.innerHTML = `
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
      quizEra.textContent = `${setting.label} round complete`;
      quizView.textContent = `${state.quizCorrect}/${QUIZ_ROUND_SIZE} identified`;
      quizPrompt.textContent = "Expedition results";
      quizPotential.textContent = maxScore;
      quizScore.textContent = state.quizScore;
      quizTotal.textContent = QUIZ_ROUND_SIZE;
      quizStreak.textContent = `${accuracy}% accurate`;
      quizOptions.innerHTML = "";
      quizFeedback.classList.add("is-revealed");
      quizFeedback.innerHTML = `
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
          <small>${escapeHtml(setting.label)} rounds use 10 randomly selected dinosaurs. Play again for a fresh fossil lineup.</small>
        </div>
      `;
      hintQuizBtn.disabled = true;
      hintQuizBtn.textContent = "Round complete";
      nextQuizBtn.disabled = false;
      nextQuizBtn.textContent = "Play Again";
    }

    function bindQuizControls() {
      quizPlayerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        savePlayerName();
      });
      if (quizPlayerSelect) {
        quizPlayerSelect.addEventListener("change", () => {
          if (quizPlayerSelect.value) setActivePlayer(quizPlayerSelect.value);
        });
      }
      if (addExplorerBtn) {
        addExplorerBtn.addEventListener("click", addExplorer);
      }
      if (manageExplorersBtn && explorerManager) {
        manageExplorersBtn.addEventListener("click", () => {
          const isOpen = explorerManager.hidden;
          explorerManager.hidden = !isOpen;
          manageExplorersBtn.setAttribute("aria-expanded", String(isOpen));
          if (isOpen) renderExplorerManager();
        });
      }
      if (explorerManagerList) {
        explorerManagerList.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-action]");
          if (!button) return;
          const name = button.dataset.name || "";
          if (button.dataset.action === "use") setActivePlayer(name);
          if (button.dataset.action === "forget") forgetExplorer(name);
          if (button.dataset.action === "clear") clearExplorerScores(name);
        });
      }
      nextQuizBtn.addEventListener("click", nextQuiz);
      hintQuizBtn.addEventListener("click", revealQuizHint);
      if (exportLeaderboardBtn) {
        exportLeaderboardBtn.addEventListener("click", savePermanentLeaderboard);
      }
      quizDifficulty.addEventListener("change", (event) => {
        state.quizDifficulty = event.target.value;
        startQuizRound();
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
