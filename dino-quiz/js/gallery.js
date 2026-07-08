(function () {
  "use strict";

  const GALLERY_PAGE_SIZE = 10;

  window.createGallery = function createGallery(ctx) {
    const { state, quizItems, getGuide } = ctx;
    const { $, $$, escapeHtml } = ctx.helpers;
    const store = ctx.store;
    const progression = ctx.progression;

    const galleryTabs = $("#galleryTabs");
    const galleryGrid = $("#galleryGrid");
    const galleryPrintPages = $("#galleryPrintPages");
    const galleryQuizTabs = $("#galleryQuizTabs");
    const galleryQuizGrid = $("#galleryQuizGrid");
    const galleryQuizPrintPages = $("#galleryQuizPrintPages");
    const galleryDexProgress = $("#galleryDexProgress");
    const galleryDexPill = $("#galleryDexPill");
    const galleryDexBar = $("#galleryDexBar");
    const galleryDexFilter = $("#galleryDexFilter");

    if (galleryDexFilter) {
      galleryDexFilter.addEventListener("click", (event) => {
        const button = event.target.closest(".dex-filter-btn");
        if (!button) return;
        state.galleryDexFilter = button.dataset.filter;
        $$(".dex-filter-btn", galleryDexFilter).forEach((btn) => btn.classList.toggle("is-active", btn === button));
        state.galleryPage = 0;
        renderGallery();
      });
    }

    function discoveredSet() {
      if (!state.playerName || !store) return null;
      const player = store.getPlayer(state.playerName);
      return player ? new Set(player.profile.discovered) : new Set();
    }

    function renderDexHeader(discovered) {
      if (!galleryDexProgress) return;
      if (!discovered) {
        galleryDexProgress.hidden = true;
        return;
      }
      const total = quizItems.length;
      const count = discovered.size;
      galleryDexProgress.hidden = false;
      galleryDexPill.textContent = `🦕 ${count}/${total} discovered`;
      galleryDexBar.style.setProperty("--dex", `${Math.round((count / total) * 100)}%`);
    }

    function galleryCardMarkup(item, discovered) {
      const guide = getGuide(item.slug);
      const isDiscovered = !discovered || discovered.has(item.slug);
      const stamp = discovered && isDiscovered ? `<span class="dex-stamp">Collected</span>` : "";
      if (!isDiscovered) {
        return `
          <article class="gallery-card is-undiscovered">
            <div class="gallery-image-frame">
              <img src="${escapeHtml(item.image)}" alt="">
            </div>
            <div class="gallery-card-copy is-hidden"><h3>???</h3><p>${escapeHtml(item.era)}</p><span>Identify it in the Quiz to discover it.</span></div>
          </article>
        `;
      }
      return `
        <article class="gallery-card">
          ${stamp}
          <div class="gallery-image-frame">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          </div>
          <div class="gallery-card-copy">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.era)}</p>
            <dl>
              <div><dt>Diet</dt><dd>${escapeHtml(guide.diet)}</dd></div>
              <div><dt>Habitat</dt><dd>${escapeHtml(guide.habitat)}</dd></div>
            </dl>
          </div>
        </article>
      `;
    }

    function filteredItems(discovered) {
      const filter = state.galleryDexFilter || "all";
      if (!discovered || filter === "all") return quizItems;
      if (filter === "discovered") return quizItems.filter((item) => discovered.has(item.slug));
      return quizItems.filter((item) => !discovered.has(item.slug));
    }

    function renderMainGallery() {
      const discovered = discoveredSet();
      renderDexHeader(discovered);
      const items = filteredItems(discovered);
      const pageCount = Math.max(1, Math.ceil(items.length / GALLERY_PAGE_SIZE));
      state.galleryPage = Math.max(0, Math.min(state.galleryPage, pageCount - 1));
      galleryTabs.innerHTML = Array.from({ length: pageCount }, (_, index) => `
        <button class="gallery-tab ${index === state.galleryPage ? "is-active" : ""}" type="button" data-page="${index}" role="tab" aria-selected="${index === state.galleryPage}">
          ${index * GALLERY_PAGE_SIZE + 1}-${Math.min((index + 1) * GALLERY_PAGE_SIZE, items.length)}
        </button>
      `).join("");
      $$(".gallery-tab", galleryTabs).forEach((button) => {
        button.addEventListener("click", () => {
          state.galleryPage = Number(button.dataset.page);
          renderMainGallery();
        });
      });
      const start = state.galleryPage * GALLERY_PAGE_SIZE;
      const pageItems = items.slice(start, start + GALLERY_PAGE_SIZE);
      galleryGrid.innerHTML = pageItems.length
        ? pageItems.map((item) => galleryCardMarkup(item, discovered)).join("")
        : `<p class="gallery-empty">No dinosaurs here yet — go identify some in the Quiz!</p>`;
      renderGalleryPrintPages();
    }

    function renderPracticeGallery() {
      const pageCount = Math.ceil(quizItems.length / GALLERY_PAGE_SIZE);
      state.galleryQuizPage = Math.max(0, Math.min(state.galleryQuizPage, pageCount - 1));
      galleryQuizTabs.innerHTML = Array.from({ length: pageCount }, (_, index) => `
        <button class="gallery-tab ${index === state.galleryQuizPage ? "is-active" : ""}" type="button" data-page="${index}" role="tab" aria-selected="${index === state.galleryQuizPage}">
          ${index * GALLERY_PAGE_SIZE + 1}-${Math.min((index + 1) * GALLERY_PAGE_SIZE, quizItems.length)}
        </button>
      `).join("");
      $$(".gallery-tab", galleryQuizTabs).forEach((button) => {
        button.addEventListener("click", () => {
          state.galleryQuizPage = Number(button.dataset.page);
          renderPracticeGallery();
        });
      });
      const start = state.galleryQuizPage * GALLERY_PAGE_SIZE;
      galleryQuizGrid.innerHTML = quizItems.slice(start, start + GALLERY_PAGE_SIZE).map((item) => {
        const guide = getGuide(item.slug);
        const revealed = state.galleryQuizRevealed.has(item.slug);
        const copy = revealed ? `
          <div class="gallery-card-copy">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.era)}</p>
            <dl>
              <div><dt>Diet</dt><dd>${escapeHtml(guide.diet)}</dd></div>
              <div><dt>Habitat</dt><dd>${escapeHtml(guide.habitat)}</dd></div>
            </dl>
          </div>
        ` : `<div class="gallery-card-copy is-hidden"><span>Tap to reveal</span></div>`;
        return `
          <button class="gallery-card gallery-quiz-card ${revealed ? "is-revealed" : ""}" type="button" data-slug="${escapeHtml(item.slug)}" aria-label="${revealed ? escapeHtml(item.name) : "Reveal dinosaur"}">
            <div class="gallery-image-frame">
              <img src="${escapeHtml(item.image)}" alt="">
            </div>
            ${copy}
          </button>
        `;
      }).join("");
      $$(".gallery-quiz-card", galleryQuizGrid).forEach((card) => {
        card.addEventListener("click", () => {
          if (state.galleryQuizRevealed.has(card.dataset.slug)) {
            state.galleryQuizRevealed.delete(card.dataset.slug);
          } else {
            state.galleryQuizRevealed.add(card.dataset.slug);
          }
          renderPracticeGallery();
        });
      });
      renderGalleryQuizPrintPages();
    }

    function renderGallery(options = {}) {
      if (options.quizMode) {
        renderPracticeGallery();
      } else {
        renderMainGallery();
      }
    }

    function renderGalleryPrintPages() {
      galleryPrintPages.innerHTML = Array.from({ length: Math.ceil(quizItems.length / GALLERY_PAGE_SIZE) }, (_, pageIndex) => {
        const start = pageIndex * GALLERY_PAGE_SIZE;
        const pageItems = quizItems.slice(start, start + GALLERY_PAGE_SIZE);
        return `
          <section class="gallery-print-page gallery-print-page-with-info">
            <header>
              <h2>Dinosaur Gallery</h2>
              <p>Subtab ${start + 1}-${Math.min(start + GALLERY_PAGE_SIZE, quizItems.length)}</p>
            </header>
            <div class="gallery-print-grid">
              ${pageItems.map((item) => {
                const guide = getGuide(item.slug);
                return `
                  <article class="gallery-print-card">
                    <img src="${item.image}" alt="">
                    <div class="gallery-print-info">
                      <h3>${item.name}</h3>
                      <p>${item.era}</p>
                      <b>Diet</b>
                      <span>${guide.diet}</span>
                      <b>Habitat</b>
                      <span>${guide.habitat}</span>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          </section>
        `;
      }).join("");
    }

    function renderGalleryQuizPrintPages() {
      galleryQuizPrintPages.innerHTML = Array.from({ length: Math.ceil(quizItems.length / GALLERY_PAGE_SIZE) }, (_, pageIndex) => {
        const start = pageIndex * GALLERY_PAGE_SIZE;
        const pageItems = quizItems.slice(start, start + GALLERY_PAGE_SIZE);
        return `
          <section class="gallery-print-page">
            <header>
              <h2>Dinosaur Practice</h2>
              <p>Subtab ${start + 1}-${Math.min(start + GALLERY_PAGE_SIZE, quizItems.length)}</p>
            </header>
            <div class="gallery-print-grid">
              ${pageItems.map((item, index) => `
                <article class="gallery-print-card">
                  <img src="${item.image}" alt="">
                  <div class="gallery-print-answer">${start + index + 1}. Name:</div>
                </article>
              `).join("")}
            </div>
          </section>
        `;
      }).join("");
    }

    return {
      renderGallery
    };
  };
})();
