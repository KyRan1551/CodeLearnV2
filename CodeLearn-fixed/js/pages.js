"use strict";
/* ============================================
   ОТРИСОВКА СТРАНИЦ
============================================ */

function heading(eyebrow, title, description) {
  return `<div class="page-heading">
    <span class="eyebrow">${escapeHTML(eyebrow)}</span>
    <h1>${escapeHTML(title)}</h1>
    <p>${escapeHTML(description)}</p>
  </div>`;
}

function projectCard(project) {
  const stats = projectStats(project);
  return `<article class="project-card">
    <div class="project-cover ${project.cover}">
      <span class="cover-icon">${escapeHTML(project.icon)}</span>
      <span class="cover-status">${stats.completed ? "✓ Завершён" : `${stats.percent}% выполнено`}</span>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="tag tag-accent">${escapeHTML(project.difficulty)}</span>
        <span class="tag">${escapeHTML(project.category)}</span>
      </div>
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.description)}</p>
      <div class="progress-meta"><span>Прогресс проекта</span><strong>${stats.done}/${stats.total}</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div>
      <div class="card-footer">
        <small>◷ ${escapeHTML(project.time)} · ✦ ${projectXp(project) + PROJECT_BONUS} XP</small>
        <button class="btn btn-primary btn-small" data-open-project="${project.id}">${stats.completed ? "Открыть" : stats.done ? "Продолжить →" : "Начать →"}</button>
      </div>
    </div>
  </article>`;
}

function renderDashboard() {
  const completedTasks = getCompletedTaskRecords(state).length;
  const totalTasks = totalTaskCount();
  const completedProjects = getCompletedProjectCount(state);
  const level = getLevel();
  const next = PROJECTS.find(p => !projectStats(p).completed) || PROJECTS[0];
  const nextLesson = CL_LESSONS.find(l => !state.completedLessons.includes(l.id));

  return `<section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">CODELEARN · PRACTICE LAB</span>
      <h1>Меньше теории.<br>Больше <span>созданного.</span></h1>
      <p>Изучай основы в уроках, создавай мини-проекты с нуля и проверяй свои решения.</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-open-project="${next.id}">Продолжить проект ↗</button>
        ${nextLesson ? `<button class="btn btn-secondary" data-cl-open="${nextLesson.id}">Урок: ${escapeHTML(nextLesson.title)}</button>` : ""}
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">&lt;/&gt;</div>
  </section>

  <div class="stats-grid">
    <article class="stat-card">
      <div class="stat-top"><span class="stat-icon">✦</span><span class="stat-delta">+ за практику</span></div>
      <div class="stat-label">Накопленный опыт</div><div class="stat-value">${state.xp}</div><div class="stat-note">XP заработано</div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span class="stat-icon">⌘</span><span class="tag">${PROJECTS.length} ${plural(PROJECTS.length, ["проект", "проекта", "проектов"])}</span></div>
      <div class="stat-label">Задания выполнены</div><div class="stat-value">${completedTasks}<small>/${totalTasks}</small></div><div class="stat-note">${totalTasks ? Math.round(completedTasks / totalTasks * 100) : 0}% программы</div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span class="stat-icon">▣</span><span class="tag">Практика</span></div>
      <div class="stat-label">Готовые проекты</div><div class="stat-value">${completedProjects}<small>/${PROJECTS.length}</small></div><div class="stat-note">Завершено полностью</div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span class="stat-icon">📚</span><span class="tag">Теория</span></div>
      <div class="stat-label">Уроки</div><div class="stat-value">${state.completedLessons.length}<small>/${CL_LESSONS.length}</small></div><div class="stat-note">Уроков завершено</div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span class="stat-icon">🏆</span><span class="tag">Уровень ${level.number}</span></div>
      <div class="stat-label">Достижения</div><div class="stat-value">${state.achievements.length}<small>/${ACHIEVEMENTS.length}</small></div><div class="stat-note">${escapeHTML(level.name)}</div>
    </article>
  </div>

  <div class="section-head">
    <div><h2>Практические проекты</h2><p>От простых интерфейсов к интерактивным приложениям.</p></div>
    <button class="text-link" data-page="projects">Все проекты →</button>
  </div>
  <div class="project-grid">${PROJECTS.map(projectCard).join("")}</div>

  <div class="two-col">
    <section class="panel">
      <div class="panel-title"><h2>Твой следующий шаг</h2><span class="tag">${completedTasks}/${totalTasks}</span></div>
      ${PROJECTS.map(project => {
        const stats = projectStats(project);
        return `<div class="lesson-row">
          <div class="lesson-number ${stats.completed ? "done" : ""}">${stats.completed ? "✓" : escapeHTML(project.icon)}</div>
          <div class="lesson-info"><strong>${escapeHTML(project.title)}</strong><small>${stats.done}/${stats.total} критериев · ${escapeHTML(project.difficulty)}</small></div>
          <button class="btn btn-secondary btn-small" data-open-project="${project.id}">${stats.completed ? "Повторить" : "Открыть"}</button>
        </div>`;
      }).join("")}
    </section>
    <section class="panel">
      <div class="panel-title"><h2>Текущий уровень</h2><span>⚡</span></div>
      <h3 style="color:${level.color}">${escapeHTML(level.name)} · Уровень ${level.number}</h3>
      <p>${level.isMax ? "Ты достиг максимального уровня. Отличная работа!" : `До уровня «${escapeHTML(level.next.name)}» осталось ${level.remaining} XP.`}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${level.percent}%"></div></div>
      <div class="progress-meta" style="margin-top:8px"><span>${level.isMax ? state.xp : `${level.current}/${level.span}`} XP</span><span>${level.percent}%</span></div>
      <div class="divider"></div>
      <div class="notice"><strong>Подсказка:</strong> в проектах стартовый код — только каркас. Следуй шагам в комментариях, пиши код и нажимай «Проверить проект».</div>
    </section>
  </div>`;
}

function renderProjects() {
  return `${heading("PRACTICE LAB", "Мастерская проектов", "Каждый проект — маленькая разработка. Пиши код с нуля, проверяй требования и собирай портфолио.")}
    <div class="toolbar">
      <input class="field" id="project-search" type="search" placeholder="⌕  Найти проект..." aria-label="Поиск проектов">
      <select class="select-field" id="project-filter" aria-label="Фильтр проектов">
        <option value="Все">Все уровни</option>
        <option value="Начальный">Начальный</option>
        <option value="Средний">Средний</option>
      </select>
    </div>
    <div class="section-head"><h2 id="project-results-title">Все проекты</h2><span class="tag">${PROJECTS.length} ${plural(PROJECTS.length, ["проект", "проекта", "проектов"])}</span></div>
    <div class="project-grid" id="project-grid">${PROJECTS.map(projectCard).join("")}</div>
    <div style="height:20px"></div>
    <div class="notice"><strong>Как это работает:</strong> выбери проект, выполни шаги из комментариев, запусти предпросмотр и проверь код. Комментарии не засчитываются, а ошибки JavaScript блокируют JS-критерии.</div>`;
}

function renderWorkspace(projectId = currentProjectId) {
  const project = projectById(projectId);
  if (!project) return renderProjects();

  currentProjectId = project.id;
  const drafts = ensureDraft(project);
  const stats = projectStats(project);

  return `<button class="text-link" data-page="projects">← Все проекты</button>
    <div style="height:17px"></div>
    ${heading("PROJECT WORKSPACE", project.title, project.subtitle)}

    <div class="ws-mobile-tabs" role="tablist" aria-label="Разделы проекта">
      <button type="button" class="ws-tab" data-ws-tab="task" role="tab">📋 Задание</button>
      <button type="button" class="ws-tab" data-ws-tab="code" role="tab">⌨️ Код</button>
      <button type="button" class="ws-tab" data-ws-tab="preview" role="tab">👁 Превью</button>
    </div>

    <div class="project-workspace" data-pane="${workspacePane}">
      <section class="panel project-description" data-ws-pane="task">
        <div class="card-meta">
          <span class="tag tag-accent">${escapeHTML(project.difficulty)}</span>
          <span class="tag">${escapeHTML(project.category)}</span>
          <span class="tag">◷ ${escapeHTML(project.time)}</span>
        </div>
        <h2>Задание</h2>
        <p>${escapeHTML(project.description)}</p>
        <ul class="objective-list">${project.objectives.map(o => `<li>${escapeHTML(o)}</li>`).join("")}</ul>

        <div class="progress-meta" style="margin-top:20px">
          <span>Прогресс проекта</span><strong id="workspace-progress">${stats.done}/${stats.total}</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" id="workspace-progress-bar" style="width:${stats.percent}%"></div></div>

        <div class="section-head compact"><h3>Критерии проверки</h3><span class="tag">+${projectXp(project)} XP · бонус ${PROJECT_BONUS}</span></div>
        <div class="task-list" id="task-list">
          ${project.tasks.map(task => {
            const done = taskIds(project.id).includes(task.id);
            return `<div class="task-item ${done ? "done" : ""}" data-task-item="${escapeHTML(task.id)}">
              <span class="task-check">${done ? "✓" : "○"}</span>
              <div><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.description)} · ${task.xp} XP</small></div>
              <span class="tag task-file">${FILE_INFO[task.file].label}</span>
            </div>`;
          }).join("")}
        </div>

        <button class="btn btn-primary btn-block" id="check-project">✓ Проверить проект</button>
        <div id="check-results" class="check-results" aria-live="polite"></div>

        <div class="divider"></div>
        <div class="notice">Проверка запускает твой код в изолированной копии страницы: нажимает кнопки, вводит текст и смотрит на результат. Засчитывается только работающий код.</div>
      </section>

      <div class="ws-resizer" role="separator" tabindex="0" aria-orientation="vertical"
           aria-label="Ширина панели задания" aria-valuemin="25" aria-valuemax="65" aria-valuenow="42"></div>

      <section class="workspace-side">
        <div class="editor-panel" data-ws-pane="code">
          <div class="editor-header">
            <span class="editor-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <strong>⌘ Редактор кода</strong>
            <div class="editor-header-actions">
              <button type="button" class="preview-size" id="open-history" title="История версий кода">🕘 История</button>
              <button type="button" class="preview-size ws-focus-btn" data-ws-focus aria-pressed="false" title="Скрыть задание, расположить код и превью рядом">⤢ Фокус</button>
            </div>
          </div>
          <div class="editor-tabs" role="tablist" aria-label="Файлы проекта">
            ${FILES.map(file => `<button class="editor-tab ${file === currentFile ? "active" : ""}" data-file="${file}" role="tab" aria-selected="${file === currentFile}">${FILE_INFO[file].label} <small>${FILE_INFO[file].filename}</small></button>`).join("")}
          </div>

          ${FILES.map(file => `<textarea class="editor-input" id="editor-${file}" data-editor-file="${file}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Редактор ${FILE_INFO[file].filename}" ${file !== currentFile ? "hidden" : ""}>${escapeHTML(drafts[file])}</textarea>`).join("")}

          <div class="editor-actions">
            <button class="btn btn-primary" id="run-preview">▶ Запустить</button>
            <button class="btn btn-secondary" id="reset-project">↺ Сбросить код</button>
            <span class="editor-shortcuts"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> запуск · <kbd>Ctrl</kbd>+<kbd>S</kbd> сохранить · <kbd>Ctrl</kbd>+<kbd>F</kbd> поиск · <kbd>Tab</kbd> Emmet</span>
          </div>
        </div>

        <div class="editor-panel" data-ws-pane="preview">
          <div class="preview-header">
            <strong>◉ Живой предпросмотр</strong>
            <div class="preview-sizes" role="group" aria-label="Ширина предпросмотра">
              <button type="button" class="preview-size" data-preview-size="375" title="Телефон, 375px">📱 375</button>
              <button type="button" class="preview-size" data-preview-size="768" title="Планшет, 768px">▭ 768</button>
              <button type="button" class="preview-size" data-preview-size="full" title="Во всю ширину">🖥 100%</button>
            </div>
          </div>
          <div class="preview-stage">
            <iframe id="preview-frame" class="preview-frame" title="Предпросмотр учебного проекта" sandbox="allow-scripts allow-modals allow-forms"></iframe>
          </div>
          <div class="output-panel">
            <div class="console-head">
              <h4>КОНСОЛЬ <span class="console-count" id="console-count"></span></h4>
              <button type="button" class="text-link" id="console-clear">Очистить</button>
            </div>
            <div class="output-message console" id="preview-status" role="log" aria-live="polite">Запусти предпросмотр, чтобы увидеть результат.</div>
          </div>
        </div>
      </section>
    </div>`;
}


function renderAchievements() {
  const unlocked = state.achievements.length;
  const total = ACHIEVEMENTS.length;
  const percent = Math.round(unlocked / total * 100);
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];
  const countRarity = r => ACHIEVEMENTS.filter(a => a.rarity === r && state.achievements.includes(a.id)).length;

  return `${heading("ACHIEVEMENT CENTER", "Коллекция достижений", "Каждый шаг имеет значение. Собирай награды и открывай новые ступени мастерства.")}
  <section class="panel achievement-summary">
    <div class="achievement-summary-top">
      <div>
        <span class="eyebrow">ТВОЙ ПРОГРЕСС</span>
        <h2>${unlocked} из ${total} достижений</h2>
        <p>Проходи уроки, создавай проекты и совершенствуй код.</p>
      </div>
      <div class="achievement-percent" style="--p:${percent}">${percent}%</div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
    <div class="progress-meta" style="margin-top:8px"><span>Коллекция наград</span><strong>${total - unlocked} осталось</strong></div>
  </section>

  <div class="stats-grid" style="margin-top:18px">
    ${["Обычное", "Редкое", "Эпическое", "Легендарное"].map(r => `<article class="stat-card">
      const RARITY_PLURAL = { "Обычное": "Обычные", "Редкое": "Редкие", "Эпическое": "Эпические", "Легендарное": "Легендарные" };
        // в renderAchievements:
        <div class="stat-label">${RARITY_PLURAL[r]}</div>
    
      <div class="stat-value">${countRarity(r)}<small>/${ACHIEVEMENTS.filter(a => a.rarity === r).length}</small></div>
    </article>`).join("")}
  </div>

  ${categories.map(category => {
    const items = ACHIEVEMENTS.filter(a => a.category === category);
    return `<section class="achievement-category">
      <div class="section-head"><h2>${escapeHTML(category)}</h2><span class="tag">${items.filter(a => state.achievements.includes(a.id)).length}/${items.length}</span></div>
      <div class="achievement-grid">
        ${items.map(a => {
          const ok = state.achievements.includes(a.id);
          return `<article class="achievement-card ${ok ? "unlocked" : "locked"}">
            <div class="achievement-icon">${ok ? a.icon : "🔒"}</div>
            <div class="achievement-details">
              <div class="achievement-badges">
                <span class="tag ${RARITY_CLASS[a.rarity]}">${escapeHTML(a.rarity)}</span>
                <span class="tag">+${a.xpReward} XP</span>
              </div>
              <h3>${escapeHTML(a.title)}</h3>
              <p>${escapeHTML(a.description)}</p>
              <span class="achievement-status">${ok ? "✓ Достижение получено" : "Ещё предстоит открыть"}</span>
            </div>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }).join("")}`;
}

function renderSkillsPage() {
  if (!window.CodeLearnSkills) {
    return `<section class="panel"><h2>Дерево навыков</h2><p>Модуль навыков не загружен. Проверь подключение skills.js.</p></section>`;
  }
  return window.CodeLearnSkills.render(state, PROJECTS);
}

function renderProfile() {
  const level = getLevel();
  const done = getCompletedTaskRecords(state).length;
  const total = totalTaskCount();

  return `${heading("YOUR ACCOUNT", "Мой профиль", "Управляй профилем и смотри, как растут твои навыки.")}
    <div class="profile-hero">
      <div class="profile-avatar">${escapeHTML(state.username.trim().slice(0, 2).toUpperCase() || "CL")}</div>
      <div><h2>${escapeHTML(state.username)}</h2><p>Уровень ${level.number} · ${escapeHTML(level.name)} · ${state.xp} XP</p></div>
    </div>

    <div class="two-col">
      <section class="panel">
        <h2>Настройки профиля</h2>
        <form id="profile-form" class="profile-form">
          <label>Имя пользователя<input class="field" name="username" maxlength="30" required value="${escapeHTML(state.username)}"></label>
          <button class="btn btn-primary" type="submit">Сохранить профиль</button>
        </form>
        <div class="divider"></div>
        <h3>Оформление</h3>
        <p>Выбери подходящую цветовую тему.</p>
        <div class="editor-actions plain">
          <button class="btn btn-secondary ${state.theme === "dark" ? "active" : ""}" data-set-theme="dark">☾ Тёмная</button>
          <button class="btn btn-secondary ${state.theme === "light" ? "active" : ""}" data-set-theme="light">☀ Светлая</button>
        </div>
                <div class="divider"></div>
        <h3>Звуки и анимации</h3>
        <div id="fx-settings"></div>

      </section>

      <section class="panel">
        <h2>Моя статистика</h2>
        <div class="progress-meta"><span>Выполненные критерии</span><strong>${done}/${total}</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${total ? done / total * 100 : 0}%"></div></div>
        <div class="progress-row">
          <div class="progress-meta"><span>Уроки</span><strong>${state.completedLessons.length}/${CL_LESSONS.length}</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${state.completedLessons.length / CL_LESSONS.length * 100}%"></div></div>
        </div>
        ${PROJECTS.map(project => {
          const stats = projectStats(project);
          return `<div class="progress-row"><div class="progress-meta"><span>${escapeHTML(project.title)}</span><strong>${stats.percent}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div></div>`;
        }).join("")}
      </section>
    </div>

    <div style="height:17px"></div>
    <section class="panel">
      <h2>Данные и сохранение</h2>
      <p>Прогресс, настройки, черновики и дерево навыков хранятся в браузере. Экспортируй файл, чтобы перенести их на другое устройство.</p>
      <div class="editor-actions plain">
        <button class="btn btn-secondary" id="export-progress">↓ Экспортировать</button>
        <button class="btn btn-secondary" id="import-progress">↑ Импортировать</button>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
        <button class="btn btn-danger" id="reset-progress">Сбросить прогресс</button>
      </div>
    </section>`;
}

/* ============================================
   УРОКИ
============================================ */

function lessonProgress(id) {
  const lesson = lessonById(id);
  if (!state.lessonProgress[id]) {
    state.lessonProgress[id] = { started: false, quiz: false, practice: false, code: lesson ? lesson.practice.starter : "" };
  }
  return state.lessonProgress[id];
}

function runLessonChecks(lesson, code) {
  const clean = stripComments(code, lesson.practice.type);
  return lesson.practice.checks.map(check => ({ label: check.label, passed: check.pattern.test(clean) }));
}

function lessonStepIndex(lp, done) {
  if (done) return 4;
  if (!lp.started) return 0;
  if (!lp.quiz) return 1;
  if (!lp.practice) return 2;
  return 3;
}

function renderLessonReader(lesson) {
  
  const done = state.completedLessons.includes(lesson.id);
  const lp = lessonProgress(lesson.id);
  const unlocked = done || lp.started;
  const quizOk = done || lp.quiz;
  const practiceOk = done || lp.practice;
  const step = lessonStepIndex(lp, done);
  const steps = ["Начать урок", "Тест", "Практика", "Завершение"];
  const checks = clPracticeResult && clPracticeResult.id === lesson.id
    ? clPracticeResult.results
    : lesson.practice.checks.map(c => ({ label: c.label, passed: practiceOk ? true : null }));

  const locked = (title, text) => `<div class="cl-locked"><span>🔒</span><div><h2>${title}</h2><p>${text}</p></div></div>`;
  
  return `${heading("LEARN · LESSON", lesson.title, lesson.summary)}
    <section class="panel cl-lesson-reader" id="cl-lesson-reader">
      <div class="cl-reader-top">
        <button class="btn btn-secondary btn-small" data-cl-back>← Все уроки</button>
        <span class="tag tag-accent">+${lesson.xp} XP</span>
      </div>

      <ol class="cl-steps">
        ${steps.map((name, i) => `<li class="cl-step ${i < step ? "done" : i === step ? "current" : ""}"><span>${i < step ? "✓" : i + 1}</span>${name}</li>`).join("")}
      </ol>

      <div class="cl-section">
        <h2>Коротко о главном</h2>
        <div class="cl-theory"><p>${escapeHTML(lesson.theory)}</p></div>
        <h2>Пример кода</h2>
        <pre class="cl-code"><code>${escapeHTML(lesson.example)}</code></pre>
        ${unlocked ? `<p class="cl-ok">✓ Урок начат</p>` : `<button class="btn btn-primary" data-cl-start="${lesson.id}">▶ Начать урок</button>`}
      </div>

      <div class="cl-section">
        ${!unlocked ? locked("Шаг 2. Тест", "Сначала нажми «Начать урок».") : `
          <h2>Шаг 2. Проверь себя</h2>
          <p>${escapeHTML(lesson.question)}</p>
          ${lesson.answers.map((answer, i) => `<label class="cl-answer ${quizOk && i === lesson.correct ? "correct" : ""}">
            <input type="radio" name="cl-quiz" value="${i}" ${quizOk ? (i === lesson.correct ? "checked disabled" : "disabled") : ""}>
            <span>${escapeHTML(answer)}</span></label>`).join("")}
          ${quizOk ? `<p class="cl-feedback is-correct">Верно! ${escapeHTML(lesson.explanation)}</p>` : `
            <button class="btn btn-primary" data-cl-check="${lesson.id}">Проверить ответ</button>
            <p class="cl-feedback" id="cl-feedback" aria-live="polite"></p>`}
        `}
      </div>

      <div class="cl-section">
        ${!quizOk ? locked("Шаг 3. Практика", "Откроется после правильного ответа на тест.") : `
          <h2>Шаг 3. Практическое задание</h2>
          <p>${escapeHTML(lesson.practice.task)}</p>
         <div class="cl-practice-box">
           <textarea class="cl-code-input" id="cl-practice-code"
             data-cl-code="${lesson.id}" data-lang="${lesson.practice.type}"
              spellcheck="false" autocapitalize="off" autocomplete="off"
            aria-label="Код практического задания" ${done ? "readonly" : ""}>${escapeHTML(lp.code)}</textarea>
          </div>
          <ul class="cl-checklist" id="cl-checklist">
            ${checks.map(c => `<li class="${c.passed === true ? "ok" : c.passed === false ? "fail" : ""}"><span>${c.passed === true ? "✓" : c.passed === false ? "✕" : "○"}</span>${escapeHTML(c.label)}</li>`).join("")}
          </ul>
          <div class="cl-actions">
            ${done ? "" : `<button class="btn btn-primary" data-cl-practice="${lesson.id}">✓ Проверить код</button>`}
            <details class="cl-hint"><summary>Подсказка</summary><p>${escapeHTML(lesson.practice.hint)}</p></details>
          </div>
        `}
      </div>

      <div class="cl-section cl-finish">
        ${done ? `<p class="cl-done">✓ Урок завершён — опыт уже начислен.</p>` : `
          <p>${practiceOk ? "Все шаги пройдены. Можно завершать!" : "Кнопка станет активной, когда пройдёшь тест и практику."}</p>
          <button class="btn btn-primary" data-cl-finish="${lesson.id}" ${practiceOk && quizOk && unlocked ? "" : "disabled"}>Завершить урок и получить +${lesson.xp} XP</button>
        `}
      </div>
    </section>`;
}

function renderLessonsPage() {
  if (clCurrentLesson) {
    const lesson = lessonById(clCurrentLesson);
    if (lesson) return renderLessonReader(lesson);
    clCurrentLesson = null;
  }

  const completed = state.completedLessons;
  return `${heading("LEARN · THEORY", "Уроки", "Каждый урок: теория → тест → практика. Опыт начисляется только после всех шагов.")}
    <div class="cl-progress panel">
      <div><strong>${completed.length} из ${CL_LESSONS.length} уроков</strong><p>За каждый новый урок начисляется опыт.</p></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round(completed.length / CL_LESSONS.length * 100)}%"></div></div>
    </div>
    <div class="project-grid cl-lesson-grid">${CL_LESSONS.map(lesson => {
      const done = completed.includes(lesson.id);
      const lp = state.lessonProgress[lesson.id];
      const stepsDone = done ? 3 : lp ? [lp.started, lp.quiz, lp.practice].filter(Boolean).length : 0;
      return `<article class="project-card"><div class="card-body">
        <div class="cl-lesson-icon">${lesson.icon}</div>
        <div class="card-meta"><span class="tag tag-accent">${escapeHTML(lesson.level)}</span><span class="tag">+${lesson.xp} XP</span>${done ? `<span class="tag tag-success">✓ Завершён</span>` : ""}</div>
        <h3>${escapeHTML(lesson.title)}</h3>
        <p>${escapeHTML(lesson.summary)}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round(stepsDone / 3 * 100)}%"></div></div>
        <div class="card-footer"><small>${done ? "Все шаги пройдены" : `Шагов: ${stepsDone}/3`}</small>
          <button class="btn btn-primary btn-small" data-cl-open="${lesson.id}">${done ? "Повторить" : stepsDone ? "Продолжить →" : "Открыть →"}</button></div>
      </div></article>`;
    }).join("")}</div>`;
}
