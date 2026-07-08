(function () {
  "use strict";

  const GALLERY_PAGE_SIZE = 10;

  window.createGallery = function createGallery(ctx) {
    const { state, quizItems, getGuide } = ctx;
    const { $, $$, escapeHtml } = ctx.helpers;

    const galleryTabs = $("#galleryTabs");
    const galleryGrid = $("#galleryGrid");
    const galleryPrintPages = $("#galleryPrintPages");
    const galleryQuizTabs = $("#galleryQuizTabs");
    const galleryQuizGrid = $("#galleryQuizGrid");
    const galleryQuizPrintPages = $("#galleryQuizPrintPages");

    function renderGallery(options = {}) {
      const quizMode = options.quizMode || false;
      const tabsEl = quizMode ? galleryQuizTabs : galleryTabs;
      const gridEl = quizMode ? galleryQuizGrid : galleryGrid;
      const pageKey = quizMode ? "galleryQuizPage" : "galleryPage";
      const pageCount = Math.ceil(quizItems.length / GALLERY_PAGE_SIZE);
      state[pageKey] = Math.max(0, Math.min(state[pageKey], pageCount - 1));
      tabsEl.innerHTML = Array.from({ length: pageCount }, (_, index) => `
        <button class="gallery-tab ${index === state[pageKey] ? "is-active" : ""}" type="button" data-page="${index}" role="tab" aria-selected="${index === state[pageKey]}">
          ${index * GALLERY_PAGE_SIZE + 1}-${Math.min((index + 1) * GALLERY_PAGE_SIZE, quizItems.length)}
        </button>
      `).join("");
      $$(".gallery-tab", tabsEl).forEach((button) => {
        button.addEventListener("click", () => {
          state[pageKey] = Number(button.dataset.page);
          renderGallery({ quizMode });
        });
      });
      const start = state[pageKey] * GALLERY_PAGE_SIZE;
      gridEl.innerHTML = quizItems.slice(start, start + GALLERY_PAGE_SIZE).map((item) => {
        const guide = getGuide(item.slug);
        const revealed = !quizMode || state.galleryQuizRevealed.has(item.slug);
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
        if (quizMode) {
          return `
            <button class="gallery-card gallery-quiz-card ${revealed ? "is-revealed" : ""}" type="button" data-slug="${escapeHtml(item.slug)}" aria-label="${revealed ? escapeHtml(item.name) : "Reveal dinosaur"}">
              <div class="gallery-image-frame">
                <img src="${escapeHtml(item.image)}" alt="">
              </div>
              ${copy}
            </button>
          `;
        }
        return `
          <article class="gallery-card">
            <div class="gallery-image-frame">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
            </div>
            ${copy}
          </article>
        `;
      }).join("");
      if (!quizMode) renderGalleryPrintPages();
      if (quizMode) {
        $$(".gallery-quiz-card", gridEl).forEach((card) => {
          card.addEventListener("click", () => {
            if (state.galleryQuizRevealed.has(card.dataset.slug)) {
              state.galleryQuizRevealed.delete(card.dataset.slug);
            } else {
              state.galleryQuizRevealed.add(card.dataset.slug);
            }
            renderGallery({ quizMode: true });
          });
        });
        renderGalleryQuizPrintPages();
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
