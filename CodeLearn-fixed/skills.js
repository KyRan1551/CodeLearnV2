/* ======================================================
   CODELEARN 4.0 — SKILL TREE
   Данные хранятся в общем состоянии (state.skills)
====================================================== */

(function () {
  "use strict";

  const SKILLS = [
    { id: "html", title: "HTML", icon: "🌐", branch: "frontend", description: "Структура и семантика веб-страниц.", requirements: ["Выполнить все HTML-задания проектов", "Использовать заголовки, кнопки, формы и списки"], xp: 40 },
    { id: "semantic", title: "Семантическая разметка", icon: "🧱", branch: "frontend", description: "Доступная и понятная структура интерфейса.", requirements: ["Полностью завершить проект «Лендинг»"], xp: 60, prerequisites: ["html"] },
    { id: "css", title: "CSS и оформление", icon: "🎨", branch: "frontend", description: "Цвета, типографика, отступы и оформление компонентов.", requirements: ["Выполнить все CSS-задания проектов"], xp: 60, prerequisites: ["html"] },
    { id: "layout", title: "Flexbox и Grid", icon: "📐", branch: "frontend", description: "Построение гибких макетов и сеток.", requirements: ["Выполнить задание «Сетка кнопок» в калькуляторе"], xp: 80, prerequisites: ["css"] },
    { id: "responsive", title: "Адаптивный дизайн", icon: "📱", branch: "frontend", description: "Интерфейсы для мобильных и больших экранов.", requirements: ["Выполнить задание по медиазапросам в лендинге"], xp: 100, prerequisites: ["layout"] },
    { id: "javascript", title: "Основы JavaScript", icon: "⚡", branch: "javascript", description: "Переменные, функции, условия и циклы.", requirements: ["Выполнить все JavaScript-задания проектов"], xp: 60, prerequisites: ["html"] },
    { id: "events", title: "События и взаимодействие", icon: "🖱️", branch: "javascript", description: "Обработка кликов, ввода и других событий.", requirements: ["Обработать события в лендинге", "Обработать отправку формы в менеджере задач"], xp: 80, prerequisites: ["javascript"] },
    { id: "dom", title: "Работа с DOM", icon: "🧬", branch: "javascript", description: "Изменение страницы с помощью JavaScript.", requirements: ["Создавать элементы через createElement"], xp: 100, prerequisites: ["events"] },
    { id: "logic", title: "Алгоритмы и отладка", icon: "🧠", branch: "javascript", description: "Решение задач и проверка логики.", requirements: ["Полностью завершить калькулятор"], xp: 120, prerequisites: ["javascript"] },
    { id: "projects", title: "Практические проекты", icon: "🛠️", branch: "engineering", description: "Объединение HTML, CSS и JavaScript.", requirements: ["Завершить хотя бы один проект"], xp: 150, prerequisites: ["css", "javascript"] },
    { id: "git", title: "Git и контроль версий", icon: "🌿", branch: "tools", description: "История изменений и безопасная работа с кодом.", requirements: ["Создать репозиторий", "Сохранять изменения коммитами", "Работать с ветками"], prerequisites: ["projects"], external: true },
    { id: "api", title: "HTTP и API", icon: "🔌", branch: "backend", description: "Обмен данными между приложениями и серверами.", requirements: ["Понимать запросы и ответы HTTP", "Получать JSON", "Обрабатывать ошибки"], prerequisites: ["javascript"], external: true },
    { id: "database", title: "Базы данных", icon: "🗄️", branch: "backend", description: "Хранение и поиск структурированных данных.", requirements: ["Понимать таблицы и записи", "Изучить основы SQL"], prerequisites: ["api"], external: true },
    { id: "backend", title: "Серверная разработка", icon: "🖥️", branch: "backend", description: "Серверная логика, API и работа с данными.", requirements: ["Создать сервер", "Реализовать API", "Подключить базу данных"], prerequisites: ["api", "database"], external: true },
    { id: "architecture", title: "Архитектура приложений", icon: "🏗️", branch: "engineering", description: "Проектирование расширяемых систем.", requirements: ["Разделять приложение на модули", "Учитывать безопасность и поддержку"], prerequisites: ["projects", "backend", "git"], external: true }
  ];

  const BRANCHES = [
    { id: "frontend", title: "Frontend", subtitle: "Создание интерфейсов", icon: "🎨" },
    { id: "javascript", title: "JavaScript", subtitle: "Логика и взаимодействие", icon: "⚡" },
    { id: "engineering", title: "Инженерия", subtitle: "Проекты и архитектура", icon: "🏗️" },
    { id: "tools", title: "Инструменты", subtitle: "Рабочий процесс", icon: "🧰" },
    { id: "backend", title: "Backend", subtitle: "Серверы и данные", icon: "🗄️" }
  ];

  let selectedId = "html";
  let ctx = { state: {}, projects: [] };

  const app = () => window.CodeLearnApp;
  const skillData = () => ctx.state.skills || { progress: {}, mastered: [], rewarded: [] };

  function escape(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function hasTask(projectId, taskId) {
    const list = ctx.state.tasks && ctx.state.tasks[projectId];
    return Array.isArray(list) && list.includes(taskId);
  }

  function projectDone(projectId) {
    const project = ctx.projects.find(p => p.id === projectId);
    if (!project) return false;
    return (ctx.state.completedProjects || []).includes(projectId) ||
      project.tasks.every(t => hasTask(projectId, t.id));
  }

  function fileStats(file) {
    let done = 0, total = 0;
    ctx.projects.forEach(p => p.tasks.forEach(t => {
      if (t.file !== file) return;
      total++;
      if (hasTask(p.id, t.id)) done++;
    }));
    return [done, total];
  }

  /* [выполнено, всего] для автоматических навыков */
  function pairFor(id) {
    switch (id) {
      case "html": return fileStats("html");
      case "css": return fileStats("css");
      case "javascript": return fileStats("js");
      case "semantic": return [Number(projectDone("landing")), 1];
      case "layout": return [Number(hasTask("calculator", "grid")), 1];
      case "responsive": return [Number(hasTask("landing", "responsive")), 1];
      case "events": return [Number(hasTask("landing", "interaction")) + Number(hasTask("todo", "event")), 2];
      case "dom": return [Number(hasTask("todo", "dom")), 1];
      case "logic": return [Number(projectDone("calculator")), 1];
      case "projects": return [Math.min(1, ctx.projects.filter(p => projectDone(p.id)).length), 1];
      default: return [0, 1];
    }
  }

  function isMastered(skill) {
    if (skill.external) return skillData().mastered.includes(skill.id);
    const [done, total] = pairFor(skill.id);
    return total > 0 && done >= total;
  }

  function progressFor(skill) {
    if (isMastered(skill)) return 100;
    if (skill.external) return Math.min(99, skillData().progress[skill.id] || 0);
    const [done, total] = pairFor(skill.id);
    return Math.min(99, Math.round(total ? done / total * 100 : 0));
  }

  function statusFor(skill) {
    if (isMastered(skill)) return "mastered";
    const pre = skill.prerequisites || [];
    const open = pre.every(id => { const s = SKILLS.find(x => x.id === id); return s && isMastered(s); });
    return open ? "available" : "locked";
  }

  function getLevelInfo(xp) {
    if (app()) return app().getLevel(xp);
    return { name: "Новичок", color: "#94a3b8", percent: 0, remaining: 0, isMax: false, next: null };
  }

  function renderSkillCard(skill) {
    const status = statusFor(skill);
    const progress = progressFor(skill);
    const selected = selectedId === skill.id;
    const labels = { locked: "🔒 Заблокирован", available: "Доступен", mastered: "✓ Освоен" };
    return `<button type="button" class="cl-skill-node ${status} ${selected ? "selected" : ""}" data-skill-id="${escape(skill.id)}" aria-pressed="${selected}">
      <span class="cl-skill-icon">${skill.icon}</span>
      <span class="cl-skill-name">${escape(skill.title)}</span>
      <span class="cl-skill-status">${labels[status]}${skill.external ? " · самооценка" : ""}</span>
      <span class="cl-skill-progress"><span style="width:${progress}%"></span></span>
      <span class="cl-skill-percent">${progress}%</span>
    </button>`;
  }

  function renderDetails(skill) {
    const status = statusFor(skill);
    const progress = progressFor(skill);
    const mastered = status === "mastered";
    const saved = skillData().progress[skill.id] || 0;
    const pre = (skill.prerequisites || []).map(id => SKILLS.find(s => s.id === id)).filter(Boolean);

    return `<section class="cl-skill-details">
      <div class="cl-detail-heading">
        <div class="cl-detail-icon">${skill.icon}</div>
        <div><span class="cl-eyebrow">КАРТА РАЗВИТИЯ</span><h2>${escape(skill.title)}</h2><p>${escape(skill.description)}</p></div>
      </div>

      <div class="cl-detail-progress">
        <div class="cl-detail-progress-head"><span>Прогресс освоения</span><strong>${progress}%</strong></div>
        <div class="cl-skill-progress large"><span style="width:${progress}%"></span></div>
        <span class="cl-status-label ${status}">${mastered ? "✓ Навык освоен" : status === "available" ? "Можно изучать" : "Сначала освой предыдущие навыки"}</span>
      </div>

      <h3>Что нужно освоить</h3>
      <ul class="cl-requirements">${skill.requirements.map(r => `<li><span class="cl-check">${mastered ? "✓" : "○"}</span>${escape(r)}</li>`).join("")}</ul>

      <h3>Предварительные навыки</h3>
      <div class="cl-prerequisites">${pre.length
        ? pre.map(p => { const ok = isMastered(p); return `<span class="cl-prerequisite ${ok ? "done" : ""}">${ok ? "✓" : "○"} ${escape(p.title)}</span>`; }).join("")
        : '<span class="cl-prerequisite done">Начальный навык</span>'}</div>

      ${skill.external ? `
        <div class="cl-info-note">Для этого навыка пока нет заданий на платформе. Отметь прогресс самостоятельно — это личная карта обучения, XP за самооценку не начисляется.</div>
        ${status === "locked" ? "" : `
        <div class="cl-manual-progress">
          <label for="cl-manual-range">Моя оценка прогресса</label>
          <div class="cl-manual-row">
            <input id="cl-manual-range" type="range" min="0" max="100" step="10" value="${mastered ? 100 : saved}" ${mastered ? "disabled" : ""}>
            <strong id="cl-manual-value">${mastered ? 100 : saved}%</strong>
          </div>
          ${mastered
            ? `<button type="button" class="cl-action-button secondary" data-unmark-skill="${skill.id}">Снять отметку «освоен»</button>`
            : `<button type="button" class="cl-action-button" data-save-progress="${skill.id}">Сохранить прогресс</button>
               <button type="button" class="cl-action-button secondary" data-mark-mastered="${skill.id}">Отметить навык освоенным</button>`}
        </div>`}
      ` : ""}

      <div class="cl-detail-footer">
        <span>${skill.external ? "Тип навыка" : "Награда за освоение"}</span>
        <strong>${skill.external ? "Самооценка" : (skillData().rewarded.includes(skill.id) ? "✓ " : "+") + skill.xp + " XP"}</strong>
      </div>
    </section>`;
  }

  function render(state, projects) {
    ctx = { state: state || {}, projects: Array.isArray(projects) ? projects : [] };
    const xp = Number(ctx.state.xp) || 0;
    const level = getLevelInfo(xp);
    const levels = app() ? app().levels : [];
    const masteredCount = SKILLS.filter(isMastered).length;
    const auto = SKILLS.filter(s => !s.external);
    const overall = Math.round(auto.reduce((sum, s) => sum + progressFor(s), 0) / auto.length);
    const projectsDone = ctx.projects.filter(p => projectDone(p.id)).length;
    const tasksDone = Object.values(ctx.state.tasks || {}).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
    const selected = SKILLS.find(s => s.id === selectedId) || SKILLS[0];

    return `<div class="cl-skills-page" id="cl-skills-root">
      <header class="cl-skills-hero">
        <div>
          <span class="cl-eyebrow">CODELEARN 4.0 / YOUR JOURNEY</span>
          <h1>Дерево навыков</h1>
          <p>От первых строк кода до проектирования полноценных приложений. Навыки осваиваются автоматически по мере выполнения заданий.</p>
        </div>
        <div class="cl-level-card">
          <span class="cl-level-emoji">✦</span>
          <div>
            <span class="cl-eyebrow">ТЕКУЩИЙ РАНГ</span>
            <h3 style="color:${level.color}">${escape(level.name)}</h3>
            <p>${xp} XP ${level.isMax ? "· Максимальный ранг" : "· До следующего: " + level.remaining + " XP"}</p>
          </div>
        </div>
      </header>

      <section class="cl-overview-grid">
        <article class="cl-overview-card"><span class="cl-overview-icon">🧠</span><span class="cl-overview-label">Освоенные навыки</span>
          <strong>${masteredCount}<small> / ${SKILLS.length}</small></strong>
          <div class="cl-skill-progress"><span style="width:${masteredCount / SKILLS.length * 100}%"></span></div></article>
        <article class="cl-overview-card"><span class="cl-overview-icon">📚</span><span class="cl-overview-label">Учебные задания</span>
          <strong>${tasksDone}</strong><small>Выполнено заданий</small></article>
        <article class="cl-overview-card"><span class="cl-overview-icon">🛠️</span><span class="cl-overview-label">Завершённые проекты</span>
          <strong>${projectsDone}<small> / ${ctx.projects.length}</small></strong><small>Практический опыт</small></article>
        <article class="cl-overview-card"><span class="cl-overview-icon">📈</span><span class="cl-overview-label">Учебный прогресс</span>
          <strong>${overall}%</strong><div class="cl-skill-progress"><span style="width:${overall}%"></span></div></article>
      </section>

      <div class="cl-level-progress">
        <div class="cl-level-progress-head">
          <div><span class="cl-eyebrow">ТВОЙ ПУТЬ</span><h3>${escape(level.name)}</h3></div>
          <strong>${level.percent}%</strong>
        </div>
        <div class="cl-skill-progress large"><span style="width:${level.percent}%;background:${level.color}"></span></div>
        <div class="cl-level-list">${levels.map(item => `<div class="cl-level-step ${xp >= item.min ? "reached" : ""}"><span></span><small>${escape(item.name)} · ${item.min}</small></div>`).join("")}</div>
      </div>

      <div class="cl-tree-layout">
        <div class="cl-tree-main">
          <div class="cl-section-title">
            <div><h2>Карта технологий</h2><p>Выбери навык, чтобы посмотреть условия его освоения.</p></div>
            <span class="cl-tree-total">${SKILLS.length} навыков</span>
          </div>
          <div class="cl-branches">${BRANCHES.map(branch => {
            const items = SKILLS.filter(s => s.branch === branch.id);
            return `<section class="cl-skill-branch">
              <div class="cl-branch-heading">
                <span class="cl-branch-icon">${branch.icon}</span>
                <div><h3>${escape(branch.title)}</h3><p>${escape(branch.subtitle)}</p></div>
                <span class="cl-branch-count">${items.filter(isMastered).length}/${items.length}</span>
              </div>
              <div class="cl-branch-nodes">${items.map(renderSkillCard).join("")}</div>
            </section>`;
          }).join("")}</div>
          <p class="cl-tree-footnote">Подсказка: заблокированные навыки открываются после освоения предыдущих. Продвинутые технологии пока представлены как план обучения.</p>
        </div>
        <aside id="cl-skill-detail">${renderDetails(selected)}</aside>
      </div>
    </div>`;
  }

  function selectSkill(id) {
    const skill = SKILLS.find(s => s.id === id);
    if (!skill) return;

    if (statusFor(skill) === "locked") {
      const missing = (skill.prerequisites || []).map(pid => SKILLS.find(s => s.id === pid)).filter(s => s && !isMastered(s)).map(s => s.title);
      if (missing.length && window.notify) window.notify("Сначала освой: " + missing.join(", "));
    }

    selectedId = id;
    const root = document.getElementById("cl-skills-root");
    if (!root) return;
    root.querySelector("#cl-skill-detail").innerHTML = renderDetails(skill);
    root.querySelectorAll(".cl-skill-node").forEach(btn => {
      const sel = btn.dataset.skillId === id;
      btn.classList.toggle("selected", sel);
      btn.setAttribute("aria-pressed", String(sel));
    });
    if (window.innerWidth < 1100) root.querySelector("#cl-skill-detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function update(mutator, message) {
    if (!app()) return;
    app().updateSkills(mutator);
    if (message && window.notify) window.notify(message);
  }

  document.addEventListener("click", event => {
    const node = event.target.closest("[data-skill-id]");
    if (node) { selectSkill(node.dataset.skillId); return; }

    const save = event.target.closest("[data-save-progress]");
    if (save) {
      const input = document.getElementById("cl-manual-range");
      if (!input) return;
      const value = Math.max(0, Math.min(100, Number(input.value) || 0));
      update(s => { s.progress[save.dataset.saveProgress] = value; }, "Прогресс навыка сохранён.");
      return;
    }

    const mark = event.target.closest("[data-mark-mastered]");
    if (mark) {
      const id = mark.dataset.markMastered;
      update(s => { if (!s.mastered.includes(id)) s.mastered.push(id); s.progress[id] = 100; }, "Навык отмечен как освоенный.");
      return;
    }

    const unmark = event.target.closest("[data-unmark-skill]");
    if (unmark) {
      const id = unmark.dataset.unmarkSkill;
      update(s => { s.mastered = s.mastered.filter(x => x !== id); s.progress[id] = 90; }, "Отметка снята.");
    }
  });

  document.addEventListener("input", event => {
    if (event.target.id === "cl-manual-range") {
      const value = document.getElementById("cl-manual-value");
      if (value) value.textContent = event.target.value + "%";
    }
  });

  window.CodeLearnSkills = {
    render,
    getSkills: () => SKILLS.map(s => ({ ...s })),
    /* Автоматически освоенные навыки — за них script.js начисляет XP один раз */
    getAutoMastered(state, projects) {
      ctx = { state: state || {}, projects: Array.isArray(projects) ? projects : [] };
      return SKILLS.filter(s => !s.external && isMastered(s)).map(s => ({ id: s.id, title: s.title, xp: s.xp }));
    },
    getProgress(state, projects) {
      ctx = { state: state || {}, projects: Array.isArray(projects) ? projects : [] };
      return SKILLS.map(s => ({ id: s.id, title: s.title, branch: s.branch, status: statusFor(s), progress: progressFor(s) }));
    }
  };
})();
