(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return [...(root || document).querySelectorAll(selector)];
  }

  function titleCase(value) {
    if (!value) return "";
    return value[0].toUpperCase() + value.slice(1);
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function readJsonStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage can be unavailable in some privacy modes; the quiz still works.
    }
  }

  function readTextStorage(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeTextStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Storage can be unavailable in some privacy modes; the quiz still works.
    }
  }

  function cleanPlayerName(value) {
    return String(value || "").replace(/[^\w \-'.]/g, "").replace(/\s+/g, " ").trim().slice(0, 18);
  }

  function todayDisplay() {
    return new Date().toLocaleDateString();
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ISO-8601 week key like "2026-W28" from a YYYY-MM-DD string (or Date).
  function isoWeek(dateInput) {
    const date = dateInput instanceof Date ? new Date(dateInput.getTime()) : new Date(`${dateInput}T00:00:00Z`);
    if (isNaN(date.getTime())) return "";
    // Shift to Thursday of the current week (ISO weeks belong to the year of their Thursday).
    const day = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - day + 3);
    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  window.DinoHelpers = {
    escapeHtml,
    $,
    $$,
    titleCase,
    shuffle,
    readJsonStorage,
    writeJsonStorage,
    readTextStorage,
    writeTextStorage,
    cleanPlayerName,
    todayDisplay,
    todayISO,
    isoWeek
  };
})();
