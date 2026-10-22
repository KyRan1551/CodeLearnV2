"use strict";
/* ============================================
   РАБОЧЕЕ ПРОСТРАНСТВО ПРОЕКТА
   Консоль, мобильные вкладки, разделитель,
   режим фокуса и история версий
============================================ */

let workspacePane = "task";
let focusMode = false;

/* ---------- Консоль ---------- */

const CONSOLE_ICONS = { fatal: "✕", error: "✕", warn: "⚠", info: "ℹ", log: "›" };

function updatePreviewStatus() {
  const box = $("#preview-status");
  if (!box) return;

  const items = [
    ...previewErrors.map(text => ({ kind: "fatal", text })),
    ...previewLogs.slice(-50).map(l => (typeof l === "string" ? { kind: "log", text: l } : l))
  ];

  box.classList.toggle("has-error", previewErrors.length > 0);
  const counter = $("#console-count");
  if (counter) counter.textContent = items.length ? String(items.length) : "";

  box.innerHTML = items.length
    ? items.map(i => `<div class="console-line ${i.kind}"><span class="console-icon" aria-hidden="true">${CONSOLE_ICONS[i.kind] || "›"}</span><span>${escapeHTML(i.text)}</span></div>`).join("")
    : `<div class="console-line ok">✓ Предпросмотр обновлён. Ошибок нет.</div>`;
  box.scrollTop = box.scrollHeight;

  // Подсвечиваем строку с ошибкой в редакторе JS
  const match = previewErrors.map(e => /\(строка (\d+)\)/.exec(e)).find(Boolean);
  if (match) window.CodeLearnEditor?.markError("js", Number(match[1]));
  else window.CodeLearnEditor?.clearErrors();
}

/* ---------- Мобильные вкладки и режим фокуса ---------- */

function syncWorkspaceButtons() {

  $$("[data-ws-tab]").forEach(button => {
    const active = button.dataset.wsTab === workspacePane;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const focusButton = $("[data-ws-focus]");
  if (focusButton) {
    focusButton.classList.toggle("active", focusMode);
    focusButton.setAttribute("aria-pressed", String(focusMode));
    focusButton.textContent = focusMode ? "⤡ Задание" : "⤢ Фокус";
  }
}

function setWorkspacePane(pane) {
  workspacePane = pane;
  const ws = $(".project-workspace");
  if (ws) ws.dataset.pane = pane;
  syncWorkspaceButtons();
  if (pane === "preview") runPreview(false);
  window.CodeLearnEditor?.refresh();
}

function toggleFocusMode() {
  focusMode = !focusMode;
  $(".project-workspace")?.classList.toggle("focus-mode", focusMode);
  syncWorkspaceButtons();
  window.CodeLearnEditor?.refresh();
}

/* ---------- Разделитель колонок ---------- */

const SPLIT_KEY = "codelearn-split";

function initResizer(ws) {
  const handle = $(".ws-resizer", ws);
  if (!handle) return;

  const setPercent = (value, save = true) => {
    const pct = clamp(value, 25, 65);
    ws.style.setProperty("--ws-left", `${pct}%`);
    handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (save) { try { localStorage.setItem(SPLIT_KEY, String(Math.round(pct))); } catch { /* не критично */ } }
  };

  const saved = Number(localStorage.getItem(SPLIT_KEY));
  setPercent(saved || 42, false);

  handle.addEventListener("pointerdown", event => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    ws.classList.add("resizing");
    const rect = ws.getBoundingClientRect();

    const move = e => setPercent((e.clientX - rect.left) / rect.width * 100);
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      ws.classList.remove("resizing");
      window.CodeLearnEditor?.refresh();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  });

  handle.addEventListener("keydown", event => {
    const current = parseFloat(ws.style.getPropertyValue("--ws-left")) || 42;
    if (event.key === "ArrowLeft") { event.preventDefault(); setPercent(current - 3); }
    if (event.key === "ArrowRight") { event.preventDefault(); setPercent(current + 3); }
  });
}

/* Вызывается из render() после отрисовки рабочего пространства */
function initWorkspace() {
  const ws = $(".project-workspace");
  if (!ws) return;
  ws.dataset.pane = workspacePane;
  ws.classList.toggle("focus-mode", focusMode);
  syncWorkspaceButtons();
  initResizer(ws);
}

/* ---------- История версий ---------- */

const HISTORY_KEY = "codelearn-history";
const HISTORY_LIMIT = 15;
const SNAPSHOT_EVERY = 60 * 1000;
const SNAPSHOT_REASONS = {
  auto: "Автосохранение",
  check: "Перед проверкой",
  reset: "Перед сбросом кода",
  restore: "Перед восстановлением"
};

function readHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return isObject(data) ? data : {};
  } catch {
    return {};
  }
}

function writeHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* хранилище заполнено */ }
}

function sameFiles(a, b) {
  return FILES.every(file => a[file] === b[file]);
}

function takeSnapshot(projectId, files, reason = "auto") {
  const project = projectById(projectId);
  if (!project || !files) return;
  const clean = { html: String(files.html), css: String(files.css), js: String(files.js) };
  if (sameFiles(clean, project.starter)) return; // стартовый код хранить незачем

  const history = readHistory();
  const list = Array.isArray(history[projectId]) ? history[projectId] : [];
  if (list[0] && sameFiles(list[0].files, clean)) return;

  list.unshift({ at: Date.now(), reason, files: clean });
  history[projectId] = list.slice(0, HISTORY_LIMIT);
  writeHistory(history);
}

function snapshotCurrent(reason) {
  if (currentPage === "workspace" && projectById(currentProjectId)) {
    takeSnapshot(currentProjectId, getEditorValues(), reason);
  }
}

function timeAgo(at) {
  const min = Math.round((Date.now() - at) / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} ${plural(min, ["минуту", "минуты", "минут"])} назад`;
  return new Date(at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function openHistory() {
  const project = projectById(currentProjectId);
  if (!project) return;
  const drafts = getEditorValues();
  takeSnapshot(project.id, drafts);
  const list = readHistory()[project.id] || [];

  $("#modal-content").innerHTML = `
    <h2>История версий</h2>
    <p>Снимки кода сохраняются каждую минуту работы, перед проверкой и перед сбросом. Хранятся последние ${HISTORY_LIMIT}.</p>
    ${list.length ? `<ul class="history-list">${list.map((snap, i) => {
      const current = sameFiles(snap.files, drafts);
      const lines = FILES.reduce((n, f) => n + snap.files[f].split("\n").length, 0);
      return `<li class="history-item ${current ? "current" : ""}">
        <div><strong>${escapeHTML(timeAgo(snap.at))}</strong>
          <small>${escapeHTML(SNAPSHOT_REASONS[snap.reason] || "Снимок")} · ${lines} ${plural(lines, ["строка", "строки", "строк"])}</small></div>
        ${current
          ? `<span class="tag tag-success">Текущая</span>`
          : `<button type="button" class="btn btn-secondary btn-small" data-restore-snapshot="${i}">Восстановить</button>`}
      </li>`;
    }).join("")}</ul>` : `<div class="empty-state">Пока нет сохранённых версий. Они появятся автоматически, когда ты начнёшь менять код.</div>`}`;

  const modal = $("#modal");
  if (typeof modal.showModal === "function") { if (!modal.open) modal.showModal(); }
  else modal.setAttribute("open", "");
}

function restoreSnapshot(index) {
  const snap = (readHistory()[currentProjectId] || [])[index];
  if (!snap) return;
  snapshotCurrent("restore");
  state.drafts[currentProjectId] = { ...snap.files };
  saveState();
  $("#modal").close?.();
  render("workspace", { scroll: false });
  notify("Версия восстановлена. Предыдущий код тоже сохранён в истории.");
}

setInterval(() => snapshotCurrent("auto"), SNAPSHOT_EVERY);
document.addEventListener("visibilitychange", () => { if (document.hidden) snapshotCurrent("auto"); });

/* ---------- Обработчики ---------- */

document.addEventListener("click", event => {
  const target = event.target;

  const tab = target.closest("[data-ws-tab]");
  if (tab) { setWorkspacePane(tab.dataset.wsTab); return; }

  if (target.closest("[data-ws-focus]")) { toggleFocusMode(); return; }
  if (target.closest("#open-history")) { openHistory(); return; }

  const restore = target.closest("[data-restore-snapshot]");
  if (restore) { restoreSnapshot(Number(restore.dataset.restoreSnapshot)); return; }

  if (target.closest("#console-clear")) { previewLogs = []; updatePreviewStatus(); return; }

  // Снимки перед важными действиями (основная логика — в events.js)
  if (target.closest("#check-project")) snapshotCurrent("check");
  if (target.closest("#reset-project")) snapshotCurrent("reset");
}, true); // фаза перехвата: снимок делается раньше, чем код сбросится
