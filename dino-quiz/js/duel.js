(function () {
  "use strict";

  const PER_PLAYER = 10;

  window.createDuel = function createDuel(deps) {
    const { store, progression, data, helpers, celebrate } = deps;
    const { $, $$, shuffle, escapeHtml } = helpers;
    const quizItems = data.quizItems;
    const quizChoicePools = data.quizChoicePools;
    const difficulties = data.quizDifficulties;

    const el = {
      modeToggle: $("#quizModeToggle"),
      soloMode: $("#soloMode"),
      duelMode: $("#duelMode"),
      setup: $("#duelSetup"),
      play: $("#duelPlay"),
      results: $("#duelResults"),
      p1Name: $("#duelP1Name"),
      p2Name: $("#duelP2Name"),
      p1Diff: $("#duelP1Diff"),
      p2Diff: $("#duelP2Diff"),
      startBtn: $("#duelStartBtn"),
      setupMsg: $("#duelSetupMsg"),
      name1: $("#duelName1"),
      name2: $("#duelName2"),
      score1: $("#duelScore1"),
      score2: $("#duelScore2"),
      side1: $("#duelSide1"),
      side2: $("#duelSide2"),
      turnBanner: $("#duelTurnBanner"),
      image: $("#duelImage"),
      options: $("#duelOptions"),
      feedback: $("#duelFeedback"),
      nextBtn: $("#duelNextBtn")
    };

    let duel = null;

    function poolFor(difficulty) {
      const setting = difficulties[difficulty] || difficulties.easy;
      if (!setting.slugs) return quizItems.map((_, index) => index);
      const set = new Set(setting.slugs);
      const indices = quizItems.map((item, index) => (set.has(item.slug) ? index : -1)).filter((index) => index >= 0);
      return indices.length ? indices : quizItems.map((_, index) => index);
    }

    function buildOrder(difficulty) {
      const pool = poolFor(difficulty);
      const order = shuffle(pool).slice(0, PER_PLAYER);
      // Pad by re-shuffling the pool if it is smaller than a full round.
      while (order.length < PER_PLAYER) {
        order.push(...shuffle(pool).slice(0, PER_PLAYER - order.length));
      }
      return order;
    }

    function buildChoices(item, difficulty) {
      const setting = difficulties[difficulty] || difficulties.easy;
      const targetCount = setting.choiceCount;
      const pool = poolFor(difficulty).map((index) => quizItems[index].name);
      const groupPool = quizChoicePools[item.group] || [];
      const choices = [item.name];
      shuffle([...groupPool, ...pool].filter((name) => name !== item.name)).forEach((name) => {
        if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
      });
      shuffle(quizItems.map((quizItem) => quizItem.name)).forEach((name) => {
        if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
      });
      return shuffle(choices);
    }

    function populatePlayerSelects() {
      const players = store.getPlayers();
      const options = players.map((player) => `<option value="${escapeHtml(player.name)}">${escapeHtml(player.name)}</option>`).join("");
      if (el.p1Name) el.p1Name.innerHTML = `<option value="">Choose explorer</option>${options}`;
      if (el.p2Name) el.p2Name.innerHTML = `<option value="">Choose explorer</option>${options}`;
      if (players[0] && el.p1Name) el.p1Name.value = players[0].name;
      if (players[1] && el.p2Name) el.p2Name.value = players[1].name;
    }

    function showMode(mode) {
      const duelActive = mode === "duel";
      if (el.soloMode) el.soloMode.hidden = duelActive;
      if (el.duelMode) el.duelMode.hidden = !duelActive;
      $$(".quiz-mode-btn", el.modeToggle).forEach((btn) => btn.classList.toggle("is-active", btn.dataset.mode === mode));
      if (duelActive) {
        populatePlayerSelects();
        el.setup.hidden = false;
        el.play.hidden = true;
        el.results.hidden = true;
        el.setupMsg.textContent = store.getPlayers().length < 2 ? "Add at least two explorers in Solo mode first." : "";
      }
    }

    function startDuel() {
      const name1 = el.p1Name.value;
      const name2 = el.p2Name.value;
      if (!name1 || !name2) {
        el.setupMsg.textContent = "Pick an explorer for both players.";
        return;
      }
      if (name1.toLowerCase() === name2.toLowerCase()) {
        el.setupMsg.textContent = "Pick two different explorers.";
        return;
      }
      store.upsertPlayer(name1);
      store.upsertPlayer(name2);
      duel = {
        players: [
          { name: name1, difficulty: el.p1Diff.value, order: buildOrder(el.p1Diff.value), score: 0, correct: 0, idx: 0 },
          { name: name2, difficulty: el.p2Diff.value, order: buildOrder(el.p2Diff.value), score: 0, correct: 0, idx: 0 }
        ],
        questionNumber: 0,
        answered: false,
        currentItem: null,
        currentCorrect: false
      };
      el.setup.hidden = true;
      el.results.hidden = true;
      el.play.hidden = false;
      el.name1.textContent = name1;
      el.name2.textContent = name2;
      el.score1.textContent = "0";
      el.score2.textContent = "0";
      renderDuelQuestion();
    }

    function activeTurn() {
      return duel.questionNumber % 2;
    }

    function renderDuelQuestion() {
      const turn = activeTurn();
      const player = duel.players[turn];
      const item = quizItems[player.order[player.idx]];
      duel.currentItem = item;
      duel.answered = false;
      const setting = difficulties[player.difficulty] || difficulties.easy;
      el.side1.classList.toggle("is-turn", turn === 0);
      el.side2.classList.toggle("is-turn", turn === 1);
      el.turnBanner.innerHTML = `${progression ? progression.rankIcon(player.name) : ""} <b>${escapeHtml(player.name)}</b>'s turn — Round ${player.idx + 1}/${PER_PLAYER} · ${escapeHtml(setting.label)} · ${setting.points} pts`;
      el.image.src = item.image;
      el.image.alt = `Duel specimen for ${player.name}`;
      const choices = buildChoices(item, player.difficulty);
      el.options.innerHTML = choices.map((choice) => `<button class="quiz-option" type="button" data-correct="${choice === item.name}">${escapeHtml(choice)}</button>`).join("");
      el.feedback.classList.remove("is-revealed");
      el.feedback.innerHTML = `<span class="quiz-intro">Hand the device to ${escapeHtml(player.name)} and pick the matching dinosaur.</span>`;
      el.nextBtn.disabled = true;
      el.nextBtn.textContent = "Next";
    }

    function answerDuel(button) {
      if (duel.answered) return;
      const turn = activeTurn();
      const player = duel.players[turn];
      const setting = difficulties[player.difficulty] || difficulties.easy;
      const item = duel.currentItem;
      const correct = button.dataset.correct === "true";
      duel.answered = true;
      if (correct) {
        player.score += setting.points;
        player.correct += 1;
        store.discover(player.name, item.slug);
        if (celebrate) {
          celebrate.sound("correct");
          celebrate.burst("small");
        }
      } else if (celebrate) {
        celebrate.sound("wrong");
      }
      $$(".quiz-option", el.options).forEach((btn) => {
        btn.disabled = true;
        btn.classList.toggle("correct", btn.dataset.correct === "true");
        btn.classList.toggle("wrong", btn === button && !correct);
      });
      el.score1.textContent = duel.players[0].score;
      el.score2.textContent = duel.players[1].score;
      el.feedback.classList.add("is-revealed");
      el.feedback.innerHTML = `<div class="quiz-result ${correct ? "correct" : "wrong"}">${correct ? `Correct! +${setting.points} for ${escapeHtml(player.name)}.` : `The answer is ${escapeHtml(item.name)}.`}</div>`;
      el.nextBtn.disabled = false;
      const isLast = duel.questionNumber >= PER_PLAYER * 2 - 1;
      el.nextBtn.textContent = isLast ? "See Result" : "Next Turn";
    }

    function nextDuel() {
      if (!duel.answered) return;
      const turn = activeTurn();
      duel.players[turn].idx += 1;
      duel.questionNumber += 1;
      if (duel.questionNumber >= PER_PLAYER * 2) {
        renderDuelResults();
        return;
      }
      renderDuelQuestion();
    }

    function renderDuelResults() {
      el.play.hidden = true;
      el.results.hidden = false;
      const [p1, p2] = duel.players;
      const tie = p1.score === p2.score;
      const winner = tie ? null : (p1.score > p2.score ? p1 : p2);
      const loser = tie ? null : (winner === p1 ? p2 : p1);

      // Accrue XP + coins for both players, award discoveries already done live.
      duel.players.forEach((player) => {
        if (progression) {
          store.addXp(player.name, player.score);
          const perCorrect = { easy: 1, medium: 2, hard: 3 }[player.difficulty] || 1;
          store.addCoins(player.name, player.correct * perCorrect);
        }
      });
      duel.players.forEach((player) => store.recordDuel(player.name, winner === player));
      let duelistBadge = null;
      if (winner) duelistBadge = store.awardBadge(winner.name, "duelist");

      if (celebrate) {
        celebrate.sound("fanfare");
        celebrate.burst("large");
        if (winner) celebrate.toast(`<span class="toast-icon">🏆</span>${escapeHtml(winner.name)} wins the duel!`);
      }

      function card(player, isWinner) {
        return `
          <div class="duel-result-card ${isWinner ? "is-winner" : ""}">
            ${isWinner ? `<span class="duel-crown">🏆</span>` : ""}
            <b>${escapeHtml(player.name)}</b>
            <span class="duel-result-score">${player.score} pts</span>
            <small>${player.correct}/${PER_PLAYER} correct · ${escapeHtml((difficulties[player.difficulty] || {}).label || "")}</small>
          </div>
        `;
      }

      el.results.innerHTML = `
        <div class="duel-results-inner">
          <h3>${tie ? "It's a tie!" : `${escapeHtml(winner.name)} wins!`}</h3>
          <div class="duel-result-cards">
            ${card(p1, winner === p1)}
            ${card(p2, winner === p2)}
          </div>
          ${duelistBadge ? `<p class="duel-badge-note">⚔️ ${escapeHtml(winner.name)} earned the Duelist trophy!</p>` : ""}
          <div class="duel-result-actions">
            <button class="primary-button" id="duelRematchBtn" type="button">Rematch</button>
            <button class="secondary-button" id="duelBackBtn" type="button">Back to setup</button>
          </div>
          <small>Duels don't change the solo leaderboard, but XP, coins, trophies and Dino-Dex discoveries still count for both explorers.</small>
        </div>
      `;
      $("#duelRematchBtn", el.results).addEventListener("click", startDuel);
      $("#duelBackBtn", el.results).addEventListener("click", () => showMode("duel"));
    }

    function bindDuelControls() {
      if (el.modeToggle) {
        el.modeToggle.addEventListener("click", (event) => {
          const button = event.target.closest(".quiz-mode-btn");
          if (button) showMode(button.dataset.mode);
        });
      }
      if (el.startBtn) el.startBtn.addEventListener("click", startDuel);
      if (el.options) {
        el.options.addEventListener("click", (event) => {
          const button = event.target.closest(".quiz-option");
          if (button && !button.disabled) answerDuel(button);
        });
      }
      if (el.nextBtn) el.nextBtn.addEventListener("click", nextDuel);
    }

    return { bindDuelControls, showMode };
  };
})();
