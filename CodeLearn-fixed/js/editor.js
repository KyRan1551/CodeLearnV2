"use strict";

/* ============================================
   РЕДАКТОР, ПРЕДПРОСМОТР И ПРОВЕРКА ПРОЕКТА
============================================ */

function getEditorValues() {
  const project = projectById(currentProjectId);
  const drafts = ensureDraft(project);
  FILES.forEach(file => {
    const editor = $(`#editor-${file}`);
    if (editor) drafts[file] = editor.value;
  });
  return drafts;
}

function saveCurrentDraft() {
  if (currentPage !== "workspace" || !projectById(currentProjectId)) return;
  getEditorValues();
  saveState();
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const escapeScript = code => String(code).replace(/<\/script/gi, "<\\/script");

let previewRunId = 0;
let previewWidth = "full";

/* ---------- Код, который выполняется в iframe ДО кода ученика ---------- */

function previewRuntime(runId) {
  return `(function () {
  var RUN = ${runId}, OFFSET = __OFFSET__;
  function send(kind, message) {
    try { parent.postMessage({ type: "codelearn-preview", kind: kind, run: RUN, message: String(message).slice(0, 500) }, "*"); } catch (_) {}
  }
  function fmt(args) {
    return Array.prototype.map.call(args, function (a) {
      if (typeof a === "string") return a;
      try { return JSON.stringify(a); } catch (_) { return String(a); }
    }).join(" ");
  }
  ["log", "info", "warn", "error"].forEach(function (name) {
    var original = console[name];
    console[name] = function () {
      send(name === "error" ? "console-error" : name, fmt(arguments));
      return original.apply(console, arguments);
    };
  });

  /* Защита от бесконечных циклов: protectLoops() вставляет __loop() в тело цикла.
     Отсчёт сбрасывается, как только синхронный код завершился (микрозадача),
     поэтому игровые циклы в requestAnimationFrame не пострадают. */
  var loopStart = 0, loopTick = false;
  window.__loop = function () {
    var now = Date.now();
    if (!loopTick) {
      loopTick = true;
      loopStart = now;
      Promise.resolve().then(function () { loopTick = false; });
    }
    if (now - loopStart > 1500) {
      throw new Error("Похоже на бесконечный цикл: код работает дольше 1,5 секунды. Проверь условие выхода из цикла.");
    }
  };

  window.addEventListener("error", function (e) {
    var line = e.lineno ? e.lineno - OFFSET : 0;
    send("error", (e.message || "Ошибка JavaScript") + (line > 0 ? " (строка " + line + ")" : ""));
  });
  window.addEventListener("unhandledrejection", function (e) {
    send("error", (e.reason && e.reason.message) || e.reason || "Ошибка Promise");
  });
})();`;
}

/* ---------- Запускатель теста (только в скрытых тестовых iframe) ---------- */

function testRunner(token, source) {
  return `<script>
(function () {
  var TOKEN = ${JSON.stringify(token)}, finished = false;
  function report(passed, error) {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "codelearn-test", token: TOKEN, passed: passed === true, error: error ? String(error).slice(0, 300) : "" }, "*");
  }

  var ALIASES = { "*": ["*", "×", "x", "х"], "/": ["/", "÷", ":"], "-": ["-", "−", "–"], "C": ["C", "AC", "CE", "С"] };

  var t = {
    lastSubmitPrevented: null,
    $: function (s) { return document.querySelector(s); },

    $$: function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); },
    text: function (el) { return el ? String(el.textContent || "").trim() : ""; },
    wait: function (ms) { return new Promise(function (r) { setTimeout(r, ms || 30); }); },
    snapshot: function () { return document.documentElement.outerHTML; },
    cssRules: function () {
      var out = [];
      function walk(list) {
        for (var i = 0; i < list.length; i++) { out.push(list[i]); if (list[i].cssRules) walk(list[i].cssRules); }
      }
      for (var s = 0; s < document.styleSheets.length; s++) {
        try { walk(document.styleSheets[s].cssRules); } catch (_) {}
      }
      return out;
    },
    hasDisplay: function (re) {
      return t.$$("body *").some(function (el) { return re.test(getComputedStyle(el).display); });
    },
    type: function (input, value) {
      input.focus();
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    submit: function (form) {
      if (form) {
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        return;
      }
      var button = document.querySelector("button");
      if (!button) throw new Error("Не найдены ни форма, ни кнопка добавления.");
      button.click();
    },
    button: function (label) {
      var names = ALIASES[label] || [label];
      var special = label === "=" ? '[data-action="equals"]' : label === "C" ? '[data-action="clear"]' : null;
      if (special && document.querySelector(special)) return document.querySelector(special);
      return t.$$("button").find(function (b) {
        return names.indexOf(b.dataset.value) !== -1 || names.indexOf(t.text(b)) !== -1;
      }) || null;
    },
    press: function (label) {
      var b = t.button(label);
      if (!b) throw new Error("Не найдена кнопка «" + label + "».");
      b.click();
    },
    display: function () {
      var d = document.querySelector("#display");
      if (!d) throw new Error("Не найден дисплей #display.");
      return String(d.value !== undefined ? d.value : d.textContent).trim();
    },
    num: function (s) { return parseFloat(String(s).replace(/\\s/g, "").replace(",", ".")); }
  };

  /* Запоминаем, отменил ли ученик отправку формы, и не даём iframe перезагрузиться */
  window.addEventListener("submit", function (e) {
    t.lastSubmitPrevented = e.defaultPrevented;
    e.preventDefault();
  });

  var test = (${source});
  window.addEventListener("load", function () {
    setTimeout(function () {
      try {
        Promise.resolve(test(t)).then(
          function (r) { report(r === true, ""); },
          function (e) { report(false, e && e.message ? e.message : e); }
        );
      } catch (e) { report(false, e && e.message ? e.message : e); }
    }, 30);
  });
})();
<\/script>`;
}

/* ---------- Сборка документа для iframe ---------- */

function makePreviewDocument(drafts, runId, test = null) {
  const head = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { overflow-wrap: anywhere; }
img, video, iframe { max-width: 100%; }
${drafts.css}
</style>
</head>
<body>
${drafts.html}
<script>
${previewRuntime(runId)}
<\/script>
<script>
"use strict";
`;
  /* Сколько строк перед кодом ученика — чтобы номер строки в ошибке совпадал с редактором */
  const offset = (head.match(/\n/g) || []).length;

  return head.replace("__OFFSET__", String(offset)) +
    `${escapeScript(protectLoops(drafts.js))}
<\/script>
${test ? testRunner(test.token, escapeScript(test.source)) : ""}
</body>
</html>`;
}

/* ---------- Предпросмотр ---------- */


function applyPreviewWidth() {
  const frame = $("#preview-frame");
  if (frame) frame.style.width = previewWidth === "full" ? "100%" : `${previewWidth}px`;

  $$("[data-preview-size]").forEach(button => {
    const active = button.dataset.previewSize === previewWidth;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-preview-size]");
  if (!button) return;
  previewWidth = button.dataset.previewSize;
  applyPreviewWidth();
});

function runPreview(showMessage = true) {
  if (currentPage !== "workspace" || !projectById(currentProjectId)) return;
  const frame = $("#preview-frame");
  if (!frame) return;

  const drafts = getEditorValues();
  saveState();

  previewRunId++;
  previewErrors = [];
  previewLogs = [];
  frame.srcdoc = makePreviewDocument(drafts, previewRunId);
  applyPreviewWidth();
  updatePreviewStatus();
  if (showMessage) notify("Предпросмотр обновлён.");
}

function switchFile(file) {
  if (!FILES.includes(file)) return;
  saveCurrentDraft();
  currentFile = file;


  $$(".editor-tab").forEach(button => {
    const active = button.dataset.file === file;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  FILES.forEach(name => {
    const editor = $(`#editor-${name}`);
    if (editor) editor.hidden = name !== file;
  });
  const active = $(`#editor-${file}`);
  if (active) active.focus();
}

/* Tab / Shift+Tab в textarea */
function handleEditorTab(event, textarea) {
  event.preventDefault();
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const indent = "  ";

  if (start === end && !event.shiftKey) {
    textarea.setRangeText(indent, start, end, "end");
  } else {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end);
    const updated = event.shiftKey ? block.replace(/^ {1,2}/gm, "") : block.replace(/^/gm, indent);
    textarea.setRangeText(updated, lineStart, end, "select");
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ============================================
   ПОВЕДЕНЧЕСКИЕ ТЕСТЫ
   Каждый тест — в своём скрытом iframe со свежей
   копией страницы, все тесты идут параллельно.
============================================ */

const TEST_TIMEOUT = 4000;
const pendingTests = new Map();
let testSeq = 0;

function runSingleTest(task, drafts) {
  return new Promise(resolve => {
    const token = `test-${++testSeq}`;
    const frame = document.createElement("iframe");
    frame.className = "test-frame";
    frame.setAttribute("sandbox", "allow-scripts allow-forms");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;

    const entry = { frame, timer: 0, finish: null };
    entry.finish = (passed, error) => {
      if (!pendingTests.has(token)) return;
      pendingTests.delete(token);
      clearTimeout(entry.timer);
      frame.remove();
      resolve([task.id, { passed, error }]);
    };
    entry.timer = setTimeout(() => entry.finish(false, "Проверка не успела завершиться — возможно, код зависает."), TEST_TIMEOUT);
    pendingTests.set(token, entry);

    frame.srcdoc = makePreviewDocument(drafts, 0, { token, source: task.check.toString() });
    document.body.appendChild(frame);
  });
}

function runBehaviorTests(project, drafts) {
  const tasks = project.tasks.filter(task => typeof task.check === "function");
  return Promise.all(tasks.map(task => runSingleTest(task, drafts))).then(Object.fromEntries);
}

window.addEventListener("message", event => {
  const data = event.data;
  if (!data || data.type !== "codelearn-test") return;
  const entry = pendingTests.get(data.token);
  if (!entry || event.source !== entry.frame.contentWindow) return;
  entry.finish(data.passed === true, String(data.error || "").slice(0, 300));
});

/* ============================================
   ПРОВЕРКА ПРОЕКТА
============================================ */

function testTask(task, drafts, behavior = {}) {
  if (typeof task.check === "function") {
    const r = behavior[task.id] || { passed: false, error: "Проверка не запустилась." };
    return { ...task, passed: r.passed, error: r.passed ? "" : r.error, behavioral: true };
  }

  /* Запасной вариант для заданий без поведенческого теста */
  const source = stripComments(drafts[task.file] || "", task.file);
  let passed = false;
  try {
    passed = typeof task.test === "function" ? !!task.test(source) : task.pattern.test(source);
  } catch (error) {
    console.warn("Ошибка проверки критерия:", task.id, error);
  }
  return { ...task, passed, behavioral: false };
}

async function checkProject() {
  const project = projectById(currentProjectId);
  if (!project || checking) return;

  checking = true;
  const button = $("#check-project");
  if (button) { button.disabled = true; button.textContent = "Проверяем…"; }

  runPreview(false);
  const drafts = { ...getEditorValues() };

  let behavior = {};
  try {
    /* Минимум 700 мс — чтобы превью успело сообщить об ошибках JavaScript */
    [behavior] = await Promise.all([runBehaviorTests(project, drafts), delay(700)]);
  } catch (error) {
    console.warn("Ошибка поведенческих тестов:", error);
  }

  checking = false;
  const freshButton = $("#check-project");
  if (freshButton) { freshButton.disabled = false; freshButton.textContent = "✓ Проверить проект"; }
  if (currentPage !== "workspace" || currentProjectId !== project.id) return;

  finishCheck(project, drafts, behavior);
}

function finishCheck(project, drafts, behavior) {
  const jsBroken = previewErrors.length > 0;
  const wasCompleted = state.completedProjects.includes(project.id);

  const results = project.tasks.map(task => {
    const result = testTask(task, drafts, behavior);
    if (!result.behavioral && task.file === "js" && jsBroken) return { ...result, passed: false, blocked: true };
    return result;
  });

  if (!state.tasks[project.id]) state.tasks[project.id] = [];
  const newTasks = results.filter(r => r.passed && !state.tasks[project.id].includes(r.id));

  newTasks.forEach(task => {
    state.tasks[project.id].push(task.id);
    state.xp += task.xp;
  });

  const allPassed = results.every(r => r.passed);
  const completionBonus = allPassed && !wasCompleted ? PROJECT_BONUS : 0;
  if (completionBonus) {
    state.completedProjects.push(project.id);
    state.xp += completionBonus;
  }

  const gained = newTasks.reduce((sum, t) => sum + t.xp, 0);

  if (gained || completionBonus) notify(`Отлично! +${gained + completionBonus} XP`);
  else if (allPassed) notify("Все критерии уже выполнены!");
  else notify("Проверка завершена. Посмотри, что ещё осталось.");

  if (gained || completionBonus) window.CodeLearnFX?.play("success");
  else if (!allPassed) window.CodeLearnFX?.play("error");

  checkAchievements();
  saveState();
  updateStats();

  results.forEach(result => {
    const item = $(`[data-task-item="${result.id}"]`);
    if (!item) return;
    item.classList.toggle("done", result.passed);
    item.classList.toggle("failed", !result.passed);
    item.querySelector(".task-check").textContent = result.passed ? "✓" : "✕";
  });

  const stats = projectStats(project);
  $("#workspace-progress").textContent = `${stats.done}/${stats.total}`;
  $("#workspace-progress-bar").style.width = `${stats.percent}%`;

  const container = $("#check-results");
  container.innerHTML =
    (jsBroken ? `<div class="check-result fail"><strong>⚠ В JavaScript есть ошибка</strong><div>${escapeHTML(previewErrors[0])}</div></div>` : "") +
    results.map(r => {
      const detail = r.passed
        ? (r.behavioral ? "Проверено в работе: код делает то, что нужно." : "Критерий найден в коде.")
        : r.blocked ? "Сначала исправь ошибку JavaScript." : (r.error || r.description);
      const showHint = !r.passed && r.hint && !r.blocked;
      return `<div class="check-result ${r.passed ? "pass" : "fail"}">
        <strong>${r.passed ? "✓ Выполнено" : "✕ Пока не выполнено"}:</strong> ${escapeHTML(r.title)}
        <div>${escapeHTML(detail)}</div>
        ${showHint ? `<div>💡 ${escapeHTML(r.hint)}</div>` : ""}
      </div>`;
    }).join("");

  if (allPassed) {
    container.insertAdjacentHTML("beforeend", `<div class="check-result celebrate">
      <strong>🎉 Проект работает и соответствует всем критериям!</strong>
      <div>${completionBonus ? `Бонус за завершение: +${PROJECT_BONUS} XP.` : "Можешь улучшить дизайн или перейти к следующему проекту."}</div>
    </div>`);
  }
}
