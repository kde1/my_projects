(function () {
  "use strict";

  // Dependency-free celebration effects: CSS confetti, WebAudio sound effects
  // (no audio files), and toast messages. Sound defaults OFF and is remembered.

  const SOUND_KEY = "dinoQuizSound";
  const COLORS = ["#f6c445", "#e8683c", "#5fa855", "#4f9bd8", "#c46bd0", "#f4e4b9"];
  const SIZES = { small: 16, medium: 34, large: 60 };

  let fxLayer = null;
  let toastLayer = null;
  let audioCtx = null;
  let soundOn = false;
  let reduceMotion = false;

  function ensureLayers() {
    if (!fxLayer) {
      fxLayer = document.createElement("div");
      fxLayer.id = "fxLayer";
      fxLayer.setAttribute("aria-hidden", "true");
      document.body.appendChild(fxLayer);
    }
    if (!toastLayer) {
      toastLayer = document.createElement("div");
      toastLayer.id = "toastLayer";
      toastLayer.setAttribute("aria-live", "polite");
      document.body.appendChild(toastLayer);
    }
  }

  function readSoundPref() {
    try {
      return localStorage.getItem(SOUND_KEY) === "on";
    } catch (error) {
      return false;
    }
  }

  function writeSoundPref(on) {
    try {
      localStorage.setItem(SOUND_KEY, on ? "on" : "off");
    } catch (error) {
      // ignore storage failures
    }
  }

  function burst(size) {
    if (reduceMotion) return;
    ensureLayers();
    const count = SIZES[size] || SIZES.small;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      const left = Math.random() * 100;
      const delay = Math.random() * 0.25;
      const duration = 1.4 + Math.random() * 1.1;
      const drift = (Math.random() * 2 - 1) * 140;
      const color = COLORS[i % COLORS.length];
      piece.style.left = `${left}vw`;
      piece.style.background = color;
      piece.style.animationDelay = `${delay}s`;
      piece.style.animationDuration = `${duration}s`;
      piece.style.setProperty("--drift", `${drift}px`);
      piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
      if (i % 3 === 0) piece.style.borderRadius = "50%";
      fragment.appendChild(piece);
      setTimeout(() => piece.remove(), (duration + delay) * 1000 + 200);
    }
    fxLayer.appendChild(fragment);
  }

  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function tone(ctx, freq, start, duration, type, gainValue) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function sound(name) {
    if (!soundOn) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    if (name === "correct") {
      tone(ctx, 660, now, 0.12, "triangle", 0.18);
      tone(ctx, 990, now + 0.09, 0.14, "triangle", 0.16);
    } else if (name === "wrong") {
      tone(ctx, 200, now, 0.22, "sine", 0.16);
    } else if (name === "fanfare") {
      [523, 659, 784, 1046].forEach((freq, index) => tone(ctx, freq, now + index * 0.11, 0.2, "triangle", 0.16));
    } else if (name === "stomp") {
      tone(ctx, 90, now, 0.25, "sine", 0.25);
    } else if (name === "unlock") {
      tone(ctx, 784, now, 0.14, "square", 0.12);
      tone(ctx, 1175, now + 0.1, 0.18, "square", 0.1);
    } else if (name === "drumroll") {
      for (let i = 0; i < 6; i += 1) tone(ctx, 160 + i * 10, now + i * 0.06, 0.05, "square", 0.12);
    }
  }

  function toast(html) {
    ensureLayers();
    const node = document.createElement("div");
    node.className = "dino-toast";
    node.innerHTML = html;
    toastLayer.appendChild(node);
    // Force reflow so the enter transition runs.
    void node.offsetWidth;
    node.classList.add("is-shown");
    setTimeout(() => {
      node.classList.remove("is-shown");
      setTimeout(() => node.remove(), 400);
    }, 2600);
  }

  function setSound(on) {
    soundOn = on;
    writeSoundPref(on);
    const button = document.getElementById("soundToggle");
    if (button) {
      button.textContent = on ? "🔊" : "🔇";
      button.setAttribute("aria-pressed", String(on));
      button.title = on ? "Sound on" : "Sound off";
    }
    if (on) sound("correct");
  }

  function init() {
    reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    soundOn = readSoundPref();
    const button = document.getElementById("soundToggle");
    if (button) {
      button.textContent = soundOn ? "🔊" : "🔇";
      button.setAttribute("aria-pressed", String(soundOn));
      button.title = soundOn ? "Sound on" : "Sound off";
      button.addEventListener("click", () => setSound(!soundOn));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.DinoCelebrate = { burst, sound, toast, setSound };
})();
