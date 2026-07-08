(function () {
  "use strict";

  // Progression layer on top of the store: trophy badges, the Dino-Dex counter,
  // and the printable certificate. Kept separate so quiz.js stays focused on the
  // round loop and just calls into here.

  window.createProgression = function createProgression(deps) {
    const { store, data, helpers, celebrate } = deps;
    const { $, escapeHtml } = helpers;
    const badges = data.badges || [];
    const totalDinos = data.totalDinos || (data.quizItems ? data.quizItems.length : 0);

    function profileOf(name) {
      const player = store.getPlayer(name);
      return player ? player.profile : null;
    }

    function dexCount(name) {
      const profile = profileOf(name);
      return profile ? profile.discovered.length : 0;
    }

    function badgeCount(name) {
      const profile = profileOf(name);
      return profile ? Object.keys(profile.badges).length : 0;
    }

    // Award any newly-qualified badges for a finished round. Returns the list of
    // freshly earned badge definitions (for toasts / the certificate).
    function evaluateRound(name, round) {
      const profile = profileOf(name);
      if (!profile) return [];
      const earned = [];
      badges.forEach((badge) => {
        if (profile.badges[badge.id]) return;
        if (badge.check(profile, round) && store.awardBadge(name, badge.id)) {
          earned.push(badge);
        }
      });
      return earned;
    }

    function announceBadges(earned) {
      if (!celebrate || !earned.length) return;
      earned.forEach((badge, index) => {
        setTimeout(() => {
          celebrate.toast(`<span class="toast-icon">${badge.icon}</span>New trophy: ${escapeHtml(badge.name)}!`);
          celebrate.sound("fanfare");
        }, 400 + index * 900);
      });
    }

    function badgeIconsFor(name, limit) {
      const profile = profileOf(name);
      if (!profile) return "";
      const owned = badges.filter((badge) => profile.badges[badge.id]);
      const shown = typeof limit === "number" ? owned.slice(0, limit) : owned;
      return shown.map((badge) => `<span class="lb-badge" title="${escapeHtml(badge.name)}">${badge.icon}</span>`).join("");
    }

    function renderTrophyShelf(container, name) {
      if (!container) return;
      const profile = profileOf(name);
      if (!name || !profile) {
        container.innerHTML = "";
        container.hidden = true;
        return;
      }
      container.hidden = false;
      const earnedCount = Object.keys(profile.badges).length;
      const items = badges.map((badge) => {
        const earnedOn = profile.badges[badge.id];
        const title = earnedOn
          ? `${badge.name} — ${badge.description} (earned ${earnedOn})`
          : `Locked — ${badge.description}`;
        return `<span class="trophy ${earnedOn ? "is-earned" : ""}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">${earnedOn ? badge.icon : "❔"}</span>`;
      }).join("");
      container.innerHTML = `
        <div class="trophy-shelf-head"><b>Trophy Shelf</b><span>${earnedCount}/${badges.length}</span></div>
        <div class="trophy-row">${items}</div>
      `;
    }

    function renderCertificate(payload) {
      const page = $("#certificatePage");
      if (!page) return;
      const { name, title, score, maxScore, accuracy, difficulty, date, dinoImage, dinoName } = payload;
      const earnedBadges = badgeIconsFor(name);
      page.innerHTML = `
        <div class="certificate">
          <div class="certificate-frame">
            <p class="certificate-kicker">The Isaac Museum of Natural History</p>
            <h1>Certificate of Paleontology</h1>
            <p class="certificate-lead">This certifies that</p>
            <p class="certificate-name">${escapeHtml(name || "Explorer")}</p>
            <p class="certificate-lead">has completed a fossil expedition and earned the rank of</p>
            <p class="certificate-title">${escapeHtml(title || "Fossil Hunter")}</p>
            <div class="certificate-figure">
              <img src="${escapeHtml(dinoImage || "assets/quiz-tyrannosaurus.png")}" alt="">
              <span>${escapeHtml(dinoName || "Tyrannosaurus rex")}</span>
            </div>
            <div class="certificate-stats">
              <div><span>Score</span><b>${score}/${maxScore}</b></div>
              <div><span>Accuracy</span><b>${accuracy}%</b></div>
              <div><span>Difficulty</span><b>${escapeHtml(difficulty)}</b></div>
              <div><span>Date</span><b>${escapeHtml(date)}</b></div>
            </div>
            ${earnedBadges ? `<div class="certificate-badges">${earnedBadges}</div>` : ""}
            <div class="certificate-signatures">
              <div><b>🦕</b><span>Museum Director</span></div>
              <div><b>🦴</b><span>Head of Fossils</span></div>
            </div>
          </div>
        </div>
      `;
    }

    return {
      dexCount,
      badgeCount,
      totalDinos,
      evaluateRound,
      announceBadges,
      badgeIconsFor,
      renderTrophyShelf,
      renderCertificate
    };
  };
})();
