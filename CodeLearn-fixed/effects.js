/* CodeLearn: эффекты (звуки, конфетти, повышение уровня). Подключать ДО script.js */
(function () {
  "use strict";

  const PREFS_KEY = "codelearn-fx";

  function safeParse(text) {
    try { return JSON.parse(text) || {}; } catch { return {}; }
  }

  const prefs = Object.assign({ sound: true, motion: true }, safeParse(localStorage.getItem(PREFS_KEY)));

  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* хранилище недоступно */ }
  }

  /* ---------- Анимации ---------- */
  const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function motionAllowed() {
    return prefs.motion && !systemReduced.matches;
  }

  function applyMotionClass() {
    document.documentElement.classList.toggle("reduce-motion", !motionAllowed());
  }

  systemReduced.addEventListener?.("change", applyMotionClass);
  applyMotionClass();

  /* ---------- Звуки (Web Audio, без файлов) ---------- */
  let ctx = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type = "sine", vol = 0.15) {
    const a = audio();
    if (!a) return;
    const osc = a.createOscillator();
    const gain = a.createGain();
    const t = a.currentTime + start;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  const SOUNDS = {
    success: () => { tone(660, 0, 0.12); tone(880, 0.1, 0.18); },
    xp: () => tone(990, 0, 0.1, "triangle", 0.1),
    error: () => { tone(220, 0, 0.15, "square", 0.05); tone(180, 0.12, 0.2, "square", 0.05); },
    achievement: () => [784, 988, 1175].forEach((f, i) => tone(f, i * 0.08, 0.3, "sine", 0.12)),
    levelup: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, "triangle", 0.14))
  };

  function play(name) {
    if (!prefs.sound || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch { /* звук не критичен */ }
  }

  /* ---------- Конфетти ---------- */
  function confetti(duration = 2600) {
    if (!motionAllowed()) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-confetti";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    if (canvas.showPopover) {
      canvas.popover = "manual";
      canvas.showPopover(); // открывается позже диалога, значит рисуется над ним
}


    const c = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    addEventListener("resize", resize);

    const colors = ["#7c5cff", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.3,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -4 - Math.random() * 14,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const start = performance.now();

    function frame(now) {
      const t = now - start;
      c.clearRect(0, 0, innerWidth, innerHeight);
      c.globalAlpha = Math.max(0, 1 - Math.max(0, t - duration * 0.7) / (duration * 0.3));

      for (const p of parts) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      }

      if (t < duration) {
        requestAnimationFrame(frame);
      } else {
        removeEventListener("resize", resize);
        canvas.remove();
      }
    }

    requestAnimationFrame(frame);
  }

  /* ---------- Окно «Новый уровень» ---------- */
  function getLevelDialog() {
    let dlg = document.getElementById("fx-levelup");
    if (dlg) return dlg;

    dlg = document.createElement("dialog");
    dlg.id = "fx-levelup";
    dlg.className = "fx-levelup";
    dlg.innerHTML = `
      <div class="fx-levelup-badge" aria-hidden="true"></div>
      <p class="fx-levelup-kicker">Новый уровень!</p>
      <h2 class="fx-levelup-title"></h2>
      <p class="fx-levelup-text"></p>
      <button type="button" class="fx-levelup-btn">Продолжить</button>
    `;
    document.body.appendChild(dlg);

    dlg.querySelector(".fx-levelup-btn").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    return dlg;
  }

  /**
   * level: { number: 3, name: "Практикант", reward: "рамка «Серебро»" }
   */
  function levelUp(level = {}) {
    const dlg = getLevelDialog();
    dlg.querySelector(".fx-levelup-badge").textContent = level.number ?? "★";
    dlg.querySelector(".fx-levelup-title").textContent = level.name || "";
    dlg.querySelector(".fx-levelup-text").textContent = level.reward
      ? `Открыто: ${level.reward}`
      : "Так держать, продолжай учиться!";

    if (!dlg.open) dlg.showModal();
    play("levelup");
    confetti();
  }

  /* ---------- Блок настроек (для страницы профиля) ---------- */
  function mountSettings(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="fx-settings">
        <label class="fx-switch">
          <input type="checkbox" data-fx="sound" ${prefs.sound ? "checked" : ""}>
          <span class="fx-switch-track"></span>
          <span>🔊 Звуки</span>
        </label>
        <label class="fx-switch">
          <input type="checkbox" data-fx="motion" ${prefs.motion ? "checked" : ""}>
          <span class="fx-switch-track"></span>
          <span>✨ Анимации</span>
        </label>
        ${systemReduced.matches ? '<p class="fx-note">В системе включено «уменьшение движения», поэтому анимации отключены.</p>' : ""}
      </div>
    `;

    container.addEventListener("change", (e) => {
      const key = e.target.dataset?.fx;
      if (!key) return;
      prefs[key] = e.target.checked;
      savePrefs();
      applyMotionClass();
      if (key === "sound" && prefs.sound) play("success");
    });
  }

  window.CodeLearnFX = {
    play,
    confetti,
    levelUp,
    mountSettings,
    motionAllowed,
    get prefs() { return { ...prefs }; }
  };
})();
