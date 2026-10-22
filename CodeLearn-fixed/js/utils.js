"use strict";
/* ============================================
   УТИЛИТЫ
============================================ */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/* Очередь уведомлений — тосты не перекрывают друг друга */
const toastQueue = [];
let toastBusy = false;

function notify(message) {
  if (!message) return;
  if (toastQueue.length >= 4) toastQueue.shift();
  toastQueue.push(String(message));
  if (!toastBusy) nextToast();
}

function nextToast() {
  const toast = $("#toast");
  const message = toastQueue.shift();
  if (!toast || !message) {
    toastBusy = false;
    return;
  }
  toastBusy = true;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(nextToast, 250);
  }, 2600);
}

/* Удаляет комментарии, чтобы подсказки в них не засчитывались */
function stripComments(source, type) {
  const text = String(source || "");
  if (type === "html") return text.replace(/<!--[\s\S]*?-->/g, "");
  if (type === "css") return text.replace(/\/\*[\s\S]*?\*\//g, "");

  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && text[j] !== c) {
        if (text[j] === "\\") j++;
        j++;
      }
      out += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      out += " ";
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function getLevel(xp = state.xp) {
  let index = 0;
  LEVELS.forEach((level, i) => { if (xp >= level.min) index = i; });
  const level = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const span = next ? next.min - level.min : 0;
  const current = xp - level.min;

  return {
    ...level,
    index,
    number: index + 1,
    next,
    current,
    span,
    percent: next ? clamp(Math.round(current / span * 100)) : 100,
    remaining: next ? Math.max(0, next.min - xp) : 0,
    isMax: !next
  };
}

function projectById(id) {
  return PROJECTS.find(project => project.id === id);
}

function lessonById(id) {
  return CL_LESSONS.find(lesson => lesson.id === id);
}

function taskIds(projectId) {
  return state.tasks[projectId] || [];
}

function projectXp(project) {
  return project.tasks.reduce((sum, task) => sum + task.xp, 0);
}

function projectStats(project) {
  const completed = taskIds(project.id);
  const total = project.tasks.length;
  const done = project.tasks.filter(task => completed.includes(task.id)).length;

  return {
    total,
    done,
    percent: total ? Math.round(done / total * 100) : 0,
    completed: state.completedProjects.includes(project.id)
  };
}

function ensureDraft(project) {
  if (!isObject(state.drafts[project.id])) {
    state.drafts[project.id] = { ...project.starter };
  }
  FILES.forEach(file => {
    if (typeof state.drafts[project.id][file] !== "string") {
      state.drafts[project.id][file] = project.starter[file];
    }
  });
  return state.drafts[project.id];
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const button = $("#theme-toggle");
  if (button) {
    button.textContent = state.theme === "dark" ? "☀" : "☾";
    button.title = state.theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему";
    button.setAttribute("aria-label", button.title);
  }


  $$("[data-set-theme]").forEach(btn => {
    const active = btn.dataset.setTheme === state.theme;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === "dark" ? "#10111b" : "#f4f5fa";
}

let lastShownXp = null;
let lastShownLevel = null;

function updateStats() {
  const level = getLevel();
  const fx = window.CodeLearnFX;

  const topXp = $("#top-xp");
  if (topXp) {
    topXp.textContent = `${state.xp} XP`;
    if (lastShownXp !== null && state.xp > lastShownXp) {
      const pill = topXp.closest(".xp-pill");
      if (pill) {
        pill.classList.remove("bump");
        void pill.offsetWidth;
        pill.classList.add("bump");
      }
    }
  }

  // Новый уровень: окно с конфетти, иначе короткий звук за XP
  if (lastShownLevel !== null && level.number > lastShownLevel) {
    fx?.levelUp({
      number: level.number,
      name: level.name,
      reward: level.next ? `следующая цель — «${level.next.name}» (${level.next.min} XP)` : "максимальный уровень!"
    });
  } else if (lastShownXp !== null && state.xp > lastShownXp) {
    fx?.play("xp");
  }
  lastShownXp = state.xp;
  lastShownLevel = level.number;

  const userName = $("#user-name");
  if (userName) userName.textContent = state.username;
  const userLevel = $("#user-level");
  if (userLevel) userLevel.textContent = `Уровень ${level.number} · ${level.name}`;
  const avatar = $("#user-avatar");
  if (avatar) avatar.textContent = state.username.trim().slice(0, 2).toUpperCase() || "CL";
  const projectCount = $("#project-count");
  if (projectCount) projectCount.textContent = PROJECTS.length;
}
/* ============================================
   ЗАЩИТА ОТ БЕСКОНЕЧНЫХ ЦИКЛОВ
   Вставляет __loop(); в начало тела каждого цикла for / while / do.
   Строки и комментарии пропускаются, номера строк не меняются.
============================================ */

function protectLoops(code) {
  const src = String(code || "");
  const n = src.length;
  const isIdChar = ch => !!ch && /[\w$]/.test(ch);
  let out = "";
  let i = 0;

  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === "\\") j++; j++; }
      out += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "/" && next === "/") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      out += src.slice(i, stop);
      i = stop;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out += src.slice(i, stop);
      i = stop;
      continue;
    }

    const match = !isIdChar(src[i - 1]) && /^(for|while|do)\b/.exec(src.slice(i, i + 6));
    if (match) {
      const keyword = match[1];
      let j = i + keyword.length;

      if (keyword !== "do") {
        while (j < n && /\s/.test(src[j])) j++;
        if (src[j] !== "(") { out += src.slice(i, j); i = j; continue; }
        let depth = 0;
        for (; j < n; j++) {
          if (src[j] === "(") depth++;
          else if (src[j] === ")" && --depth === 0) { j++; break; }
        }
      }

      let k = j;
      while (k < n && /\s/.test(src[k])) k++;
      if (src[k] === "{") {
        out += src.slice(i, k + 1) + "__loop();";
        i = k + 1;
      } else {
        out += src.slice(i, j); // цикл без фигурных скобок или "} while (...)" из do-while
        i = j;
      }
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

/* ============================================
   ПОНЯТНЫЕ ОШИБКИ НА РУССКОМ
============================================ */

const ERROR_HINTS = [
  [/([\w$]+) is not defined/, m => `«${m[1]}» не объявлена. Проверь опечатку (регистр букв важен) или объяви переменную через const / let.`],
  [/Cannot (?:read|set) properties of (null|undefined)(?: \((?:reading|setting) '([^']+)'\))?/, m =>
    `Обращение к «${m[2] || "свойству"}» у значения ${m[1]}. Чаще всего querySelector ничего не нашёл — проверь селектор и id в HTML.`],
  [/can't access property "?([^",]+)"?,.* is (null|undefined)/, m =>
    `Обращение к «${m[1]}» у значения ${m[2]}. Чаще всего querySelector ничего не нашёл — проверь селектор и id в HTML.`],
  [/([\w$.]+) is not a function/, m => `«${m[1]}» — не функция. Проверь название метода: addEventListener, querySelector, appendChild.`],
  [/Assignment to constant variable|invalid assignment to const/, () => "Нельзя изменить const. Если значение меняется, объяви его через let."],
  [/Identifier '([^']+)' has already been declared|redeclaration of (?:let|const) (\S+)/, m => `Переменная «${m[1] || m[2]}» объявлена дважды. Удали повторное const / let.`],
  [/Unexpected end of input|expected expression, got end of script|missing \} /, () => "Код оборвался: похоже, не хватает закрывающей скобки } или )."],
  [/Unexpected token|Invalid or unexpected token|missing \) after|unterminated string|SyntaxError/, () => "Синтаксическая ошибка: проверь скобки, кавычки, запятые и точки с запятой."],
  [/Maximum call stack size exceeded|too much recursion/, () => "Функция вызывает сама себя без остановки (бесконечная рекурсия)."]
];

function explainError(message) {
  const text = String(message);
  for (const [re, explain] of ERROR_HINTS) {
    const m = text.match(re);
    if (m) return `${explain(m)}\n   Исходное сообщение: ${text}`;
  }
  return text;
}


