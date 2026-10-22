"use strict";
/* ============================================
   МОДАЛЬНОЕ ОКНО, СБРОС, ЭКСПОРТ, ИМПОРТ
============================================ */

function showModal(title, message, confirmLabel, onConfirm) {
  const modal = $("#modal");
  $("#modal-content").innerHTML = `
    <h2>${escapeHTML(title)}</h2>
    <p>${escapeHTML(message)}</p>
    <div class="editor-actions plain">
      <button class="btn btn-danger" id="modal-confirm">${escapeHTML(confirmLabel)}</button>
      <button class="btn btn-secondary" id="modal-cancel">Отмена</button>
    </div>`;

  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "");

  const close = () => (typeof modal.close === "function" ? modal.close() : modal.removeAttribute("open"));
  $("#modal-confirm").onclick = () => { close(); onConfirm(); };
  $("#modal-cancel").onclick = close;
  $("#modal-cancel").focus();
}

function resetProjectCode() {
  const project = projectById(currentProjectId);
  if (!project) return;
  showModal("Сбросить исходный код?", "Твои изменения в этом проекте будут заменены стартовым шаблоном. Полученные XP и выполненные задания останутся.", "Сбросить код", () => {
    state.drafts[project.id] = { ...project.starter };
    saveState();
    render("workspace", { scroll: false });
    notify("Стартовый код восстановлен.");
  });
}

function resetProgress() {
  showModal("Удалить весь прогресс?", "Будут удалены XP, достижения, задания, уроки, дерево навыков и все черновики. Экспортируй данные заранее, если хочешь их сохранить.", "Удалить всё", () => {
    const { theme, username } = state;
    state = defaultState();
    state.theme = theme;
    state.username = username;
    clCurrentLesson = null;
    clPracticeResult = null;
    lastShownXp = 0;
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* не критично */ }
    saveState();
    render("dashboard", { scroll: true });
    notify("Прогресс очищен.");
  });
}

function exportProgress() {
  saveCurrentDraft();
  const payload = { app: "CodeLearn", version: STATE_VERSION, exportedAt: new Date().toISOString(), progress: state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `codelearn-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Файл прогресса подготовлен.");
}

function importProgress(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { notify("Файл слишком большой."); return; }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data || data.app !== "CodeLearn" || !isObject(data.progress)) throw new Error("Неверный формат");
      showModal("Импортировать прогресс?", "Текущий прогресс будет заменён данными из файла.", "Импортировать", () => {
       state = normalizeState(data.progress);
        lastShownXp = state.xp;
        lastShownLevel = getLevel().number;

        saveState();
        applyTheme();
        render("profile", { scroll: false });
        notify("Прогресс импортирован.");
      });
    } catch (error) {
      notify("Не удалось прочитать файл прогресса.");
    }
  };
  reader.readAsText(file);
}

function filterProjects() {
  const search = ($("#project-search")?.value || "").trim().toLowerCase();
  const difficulty = $("#project-filter")?.value || "Все";
  const filtered = PROJECTS.filter(p =>
    `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(search) &&
    (difficulty === "Все" || p.difficulty === difficulty)
  );
  const grid = $("#project-grid");
  if (!grid) return;
  grid.innerHTML = filtered.map(projectCard).join("") || `<div class="empty-state">По твоему запросу проекты не найдены.</div>`;
  $("#project-results-title").textContent = filtered.length ? (search || difficulty !== "Все" ? "Найденные проекты" : "Все проекты") : "Ничего не найдено";
}

/* ============================================
   УРОКИ: ОБРАБОТЧИКИ ШАГОВ
============================================ */

function rerenderLesson() {
  const y = window.scrollY;
  render("lessons", { scroll: false });
  window.scrollTo({ top: y, behavior: "instant" });
}


function handleLessonClick(target) {
  const open = target.closest("[data-cl-open]");
  if (open) {
    clCurrentLesson = open.dataset.clOpen;
    clPracticeResult = null;
    render("lessons", { scroll: true });
    return true;
  }

  if (target.closest("[data-cl-back]")) {
    clCurrentLesson = null;
    clPracticeResult = null;
    render("lessons", { scroll: true });
    return true;
  }

  const start = target.closest("[data-cl-start]");
  if (start) {
    const lp = lessonProgress(start.dataset.clStart);
    lp.started = true;
    saveState();
    rerenderLesson();
    notify("Урок начат. Ответь на вопрос теста.");
    return true;
  }

  const check = target.closest("[data-cl-check]");
  if (check) {
    const lesson = lessonById(check.dataset.clCheck);
    const lp = lesson && lessonProgress(lesson.id);
    const feedback = $("#cl-feedback");
    if (!lesson || !lp.started) return true;

    const selected = $('#content input[name="cl-quiz"]:checked');
    if (!selected) {
      if (feedback) { feedback.textContent = "Сначала выбери один ответ."; feedback.className = "cl-feedback is-wrong"; }
      return true;
    }
    if (Number(selected.value) === lesson.correct) {
      lp.quiz = true;
      saveState();
      rerenderLesson();
      notify("Верно! Практика открыта.");
    } else if (feedback) {
      feedback.textContent = "Пока неверно. Перечитай теорию и попробуй ещё раз.";
      feedback.className = "cl-feedback is-wrong";
    }
    return true;
  }

  const practice = target.closest("[data-cl-practice]");
  if (practice) {
    const lesson = lessonById(practice.dataset.clPractice);
    const lp = lesson && lessonProgress(lesson.id);
    if (!lesson || !lp.started || !lp.quiz) return true;

    const code = $("#cl-practice-code")?.value ?? lp.code;
    lp.code = code;
    const results = runLessonChecks(lesson, code);
    lp.practice = results.every(r => r.passed);
    clPracticeResult = { id: lesson.id, results };
    saveState();
    rerenderLesson();
    notify(lp.practice ? "Практика выполнена! Теперь можно завершить урок." : "Не все требования выполнены. Посмотри список.");
    return true;
  }

  const finish = target.closest("[data-cl-finish]");
  if (finish) {
    const lesson = lessonById(finish.dataset.clFinish);
    if (!lesson) return true;
    if (state.completedLessons.includes(lesson.id)) {
      notify("Этот урок уже засчитан — XP повторно не начисляется.");
      return true;
    }

    const lp = lessonProgress(lesson.id);
    // Повторная проверка всех шагов — защита от обхода через DevTools
    const practiceValid = runLessonChecks(lesson, lp.code).every(r => r.passed);
    if (!lp.started || !lp.quiz || !lp.practice || !practiceValid) {
      lp.practice = practiceValid && lp.practice;
      saveState();
      notify("Сначала пройди все шаги урока: старт, тест и практику.");
      rerenderLesson();
      return true;
    }

    state.completedLessons.push(lesson.id);
    state.xp += lesson.xp;
    notify(`Урок завершён! +${lesson.xp} XP`);
    checkAchievements();
    saveState();
    clCurrentLesson = null;
    clPracticeResult = null;
    render("lessons", { scroll: true });
    return true;
  }

  return false;
}

/* ============================================
   ОБРАБОТЧИКИ СОБЫТИЙ
============================================ */

document.addEventListener("click", event => {
  const target = event.target;

  if (handleLessonClick(target)) { event.preventDefault(); return; }

 const pageButton = target.closest("[data-page]");
if (pageButton) {
  event.preventDefault();
  clCurrentLesson = null;
  clPracticeResult = null;
  render(pageButton.dataset.page, { scroll: true });
  return;
}


  const projectButton = target.closest("[data-open-project]");
  if (projectButton) { openProject(projectButton.dataset.openProject); return; }

  const fileButton = target.closest("[data-file]");
  if (fileButton) { switchFile(fileButton.dataset.file); return; }

  const themeButton = target.closest("[data-set-theme]");
  if (themeButton) {
    state.theme = themeButton.dataset.setTheme === "light" ? "light" : "dark";
    saveState();
    applyTheme();
    return;
  }

  if (target.closest("#run-preview")) { runPreview(true); return; }
  if (target.closest("#check-project")) { checkProject(); return; }
  if (target.closest("#reset-project")) { resetProjectCode(); return; }
  if (target.closest("#reset-progress")) { resetProgress(); return; }
  if (target.closest("#export-progress")) { exportProgress(); return; }
  if (target.closest("#import-progress")) { $("#import-file")?.click(); return; }
});

document.addEventListener("input", event => {
  const target = event.target;

  const editor = target.closest("[data-editor-file]");
  if (editor && currentPage === "workspace") {
    const project = projectById(currentProjectId);
    if (!project) return;
    ensureDraft(project)[editor.dataset.editorFile] = editor.value;

    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 300);
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => runPreview(false), 900);
    return;
  }

  const lessonCode = target.closest("[data-cl-code]");
  if (lessonCode) {
    const lp = lessonProgress(lessonCode.dataset.clCode);
    lp.code = lessonCode.value;
    // Изменение кода после проверки требует повторной проверки
    if (lp.practice) {
      lp.practice = false;
      clPracticeResult = null;
      const finish = $("[data-cl-finish]");
      if (finish) finish.disabled = true;

      $$("#cl-checklist li").forEach(li => { li.className = ""; li.querySelector("span").textContent = "○"; });
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 300);
    return;
  }

  if (target.id === "project-search") filterProjects();
});

document.addEventListener("change", event => {
  if (event.target.id === "project-filter") filterProjects();
  if (event.target.id === "import-file") {
    importProgress(event.target.files[0]);
    event.target.value = "";
  }
});

document.addEventListener("keydown", event => {
  const textarea = event.target.closest(".editor-input, .cl-code-input");
  if (!textarea || textarea.readOnly) return;

  if (event.key === "Tab") { handleEditorTab(event, textarea); return; }
  if (event.key === "Escape") { textarea.blur(); return; }
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && textarea.classList.contains("editor-input")) {
    event.preventDefault();
    runPreview(true);
  }
});

document.addEventListener("submit", event => {
  if (event.target.id !== "profile-form") return;
  event.preventDefault();
  const username = String(new FormData(event.target).get("username") || "").trim().slice(0, 30);
  if (!username) { notify("Введи имя пользователя."); return; }
  state.username = username;
  saveState();
  render("profile", { scroll: false });
  notify("Профиль сохранён.");
});

window.addEventListener("message", event => {
  const frame = $("#preview-frame");
  if (!frame || event.source !== frame.contentWindow) return;
  const data = event.data;
  if (!data || data.type !== "codelearn-preview" || data.run !== previewRunId) return;

  const message = String(data.message).slice(0, 300);
   if (data.kind === "error") previewErrors.push(explainError(message));
  else previewLogs.push({ kind: data.kind === "console-error" ? "error" : data.kind, text: message });
  updatePreviewStatus();
});

window.addEventListener("beforeunload", saveCurrentDraft);
document.addEventListener("visibilitychange", () => { if (document.hidden) saveCurrentDraft(); });

$("#theme-toggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
});

$("#menu-toggle").addEventListener("click", () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#sidebar-backdrop").classList.toggle("show", open);
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
});

$("#sidebar-backdrop").addEventListener("click", closeMobileMenu);
$("#modal-close").addEventListener("click", () => $("#modal").close());
$("#modal").addEventListener("click", event => { if (event.target === $("#modal")) $("#modal").close(); });
