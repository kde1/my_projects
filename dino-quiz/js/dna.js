(function () {
  "use strict";

  window.createDna = function createDna(ctx) {
    const { state, slots, speciesLab, geneGoals } = ctx;
    const { $ } = ctx.helpers;

    const dnaASelect = $("#dnaA");
    const dnaBSelect = $("#dnaB");
    const dnaGoalSelect = $("#dnaGoal");
    const geneList = $("#geneList");
    const fossilNote = $("#fossilNote");
    const challengeText = $("#challengeText");
    const badgeRow = $("#badgeRow");

    function buildDnaLab() {
      [dnaASelect, dnaBSelect].forEach((select) => {
        speciesLab.forEach((species) => {
          const option = document.createElement("option");
          option.value = species.id;
          option.textContent = species.name;
          select.appendChild(option);
        });
      });
      dnaASelect.value = state.dnaA;
      dnaBSelect.value = state.dnaB;
      dnaGoalSelect.value = state.dnaGoal;
      renderDnaReport();
    }

    function resolveGenePick(pick, sampleA, sampleB, slotName) {
      if (pick === "A") return sampleA.build[slotName];
      if (pick === "B") return sampleB.build[slotName];
      return pick;
    }

    function blendBoost(sampleA, sampleB, goal) {
      const boost = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
      Object.keys(boost).forEach((key) => {
        boost[key] = Math.round((sampleA.boost[key] + sampleB.boost[key]) / 3);
      });
      const goalBoosts = {
        speed: { speed: 18, strength: 2, defense: -2, reach: 1, ferocity: 4 },
        strength: { speed: -2, strength: 20, defense: 3, reach: 2, ferocity: 8 },
        tank: { speed: -5, strength: 10, defense: 22, reach: 1, ferocity: 2 },
        balanced: { speed: 8, strength: 8, defense: 8, reach: 8, ferocity: 8 }
      }[goal];
      Object.entries(goalBoosts).forEach(([key, value]) => {
        boost[key] += value;
      });
      return boost;
    }

    function spliceDna() {
      const sampleA = ctx.getSpecies(state.dnaA);
      const sampleB = ctx.getSpecies(state.dnaB);
      const goal = geneGoals[state.dnaGoal];
      Object.keys(slots).forEach((slotName) => {
        state[slotName] = resolveGenePick(goal.picks[slotName], sampleA, sampleB, slotName);
      });
      state.baseColor = ctx.builder.mixColor(sampleA.colors[0], sampleB.colors[0], .5);
      state.bellyColor = ctx.builder.mixColor(sampleA.colors[1], sampleB.colors[1], .5);
      state.pattern = state.dnaGoal === "speed" ? "stripes" : "scales";
      state.size = state.dnaGoal === "speed" ? 92 : state.dnaGoal === "strength" ? 112 : state.dnaGoal === "tank" ? 108 : 100;
      state.posture = state.dnaGoal === "speed" ? -6 : state.dnaGoal === "strength" ? 5 : 0;
      state.dnaBoost = blendBoost(sampleA, sampleB, state.dnaGoal);
      state.lastSplice = {
        sampleA: sampleA.id,
        sampleB: sampleB.id,
        goal: state.dnaGoal
      };
      state.offsets = {};
      ctx.builder.syncInputs();
      ctx.builder.refreshControls();
      ctx.builder.renderDino();
      ctx.showTab("parts");
      ctx.builder.runFieldTest();
    }

    function renderDnaReport(scores) {
      const resolved = scores || ctx.builder.updateScores();
      const sampleA = ctx.getSpecies(state.dnaA);
      const sampleB = ctx.getSpecies(state.dnaB);
      const goal = geneGoals[state.dnaGoal];
      if (!geneList) return;
      geneList.innerHTML = [
        ["Sample A", sampleA.name],
        ["Sample B", sampleB.name],
        ["Goal", goal.label],
        ["Best trait", topTrait(resolved)],
        ["Era clue", `${sampleA.period} + ${sampleB.period}`],
        ["Diet clue", `${sampleA.diet} / ${sampleB.diet}`]
      ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join("");
      fossilNote.textContent = `${sampleA.name}: ${sampleA.trait}. ${sampleB.name}: ${sampleB.trait}. ${goal.note}`;
      challengeText.textContent = goal.challenge;
      renderBadges(resolved);
    }

    function topTrait(scores) {
      const labelMap = { speed: "Speed", strength: "Strength", defense: "Defense", reach: "Reach", ferocity: "Ferocity" };
      const [key, value] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
      return `${labelMap[key]} ${value}`;
    }

    function renderBadges(scores) {
      const badges = [
        { label: "Sprint", pass: scores.speed >= 80 },
        { label: "Crusher", pass: scores.strength >= 80 },
        { label: "Shield", pass: scores.defense >= 80 },
        { label: "Apex", pass: scores.ferocity >= 75 },
        { label: "Giant", pass: scores.reach >= 80 }
      ];
      badgeRow.innerHTML = badges.map((badge) => `<span class="${badge.pass ? "earned" : ""}">${badge.label}</span>`).join("");
    }

    function bindDnaControls() {
      dnaASelect.addEventListener("change", (event) => {
        state.dnaA = event.target.value;
        renderDnaReport(ctx.builder.updateScores());
      });
      dnaBSelect.addEventListener("change", (event) => {
        state.dnaB = event.target.value;
        renderDnaReport(ctx.builder.updateScores());
      });
      dnaGoalSelect.addEventListener("change", (event) => {
        state.dnaGoal = event.target.value;
        renderDnaReport(ctx.builder.updateScores());
      });
      $("#spliceBtn").addEventListener("click", spliceDna);
    }

    return {
      buildDnaLab,
      renderDnaReport,
      spliceDna,
      bindDnaControls
    };
  };
})();
