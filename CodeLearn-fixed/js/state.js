"use strict";
/* ============================================
   СОСТОЯНИЕ
============================================ */

function defaultState() {
  return {
    version: STATE_VERSION,
    username: "Разработчик",
    theme: "dark",
    xp: 0,
    completedProjects: [],
    tasks: {},
    drafts: {},
    achievements: [],
    completedLessons: [],
    lessonProgress: {},
    skills: { progress: {}, mastered: [], rewarded: [] },
    createdAt: new Date().toISOString()
  };
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function uniqueStrings(list) {
  return Array.isArray(list) ? [...new Set(list.filter(item => typeof item === "string"))] : [];
}

function normalizeState(raw) {
  const base = defaultState();
  if (!isObject(raw)) return base;

  const s = { ...base };
  s.username = String(raw.username || "").trim().slice(0, 30) || base.username;
  s.theme = raw.theme === "light" ? "light" : "dark";
  s.xp = Math.max(0, Math.floor(Number(raw.xp) || 0));
  s.createdAt = typeof raw.createdAt === "string" ? raw.createdAt : base.createdAt;

  s.completedProjects = uniqueStrings(raw.completedProjects).filter(id => PROJECTS.some(p => p.id === id));
  s.achievements = uniqueStrings(raw.achievements).filter(id => ACHIEVEMENTS.some(a => a.id === id));

  const rawTasks = isObject(raw.tasks) ? raw.tasks : {};
  const rawDrafts = isObject(raw.drafts) ? raw.drafts : {};
  PROJECTS.forEach(project => {
    const done = uniqueStrings(rawTasks[project.id]).filter(id => project.tasks.some(t => t.id === id));
    if (done.length) s.tasks[project.id] = done;

    const draft = rawDrafts[project.id];
    if (isObject(draft)) {
      s.drafts[project.id] = {};
      FILES.forEach(file => {
        s.drafts[project.id][file] = typeof draft[file] === "string" ? draft[file].slice(0, 100000) : project.starter[file];
      });
    }
  });

  s.completedLessons = uniqueStrings(raw.completedLessons).filter(id => CL_LESSONS.some(l => l.id === id));

  const rawLessons = isObject(raw.lessonProgress) ? raw.lessonProgress : {};
  CL_LESSONS.forEach(lesson => {
    const lp = rawLessons[lesson.id];
    if (isObject(lp)) {
      s.lessonProgress[lesson.id] = {
        started: !!lp.started,
        quiz: !!lp.quiz,
        practice: !!lp.practice,
        code: typeof lp.code === "string" ? lp.code.slice(0, 10000) : lesson.practice.starter
      };
    }
  });

  const rawSkills = isObject(raw.skills) ? raw.skills : {};
  s.skills = {
    progress: {},
    mastered: uniqueStrings(rawSkills.mastered),
    rewarded: uniqueStrings(rawSkills.rewarded)
  };
  if (isObject(rawSkills.progress)) {
    Object.entries(rawSkills.progress).forEach(([key, value]) => {
      const n = Number(value);
      if (Number.isFinite(n)) s.skills.progress[key] = Math.max(0, Math.min(100, Math.round(n)));
    });
  }

  return s;
}

function migrateOldSkills(s) {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_SKILLS_KEY));
    if (isObject(old)) {
      s.skills.mastered = uniqueStrings(old.mastered);
      if (isObject(old.progress)) {
        Object.entries(old.progress).forEach(([key, value]) => {
          const n = Number(value);
          if (Number.isFinite(n)) s.skills.progress[key] = Math.max(0, Math.min(100, Math.round(n)));
        });
      }
    }
  } catch (error) {
    console.warn("Не удалось перенести дерево навыков:", error);
  }
}

function loadState() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (isObject(current)) {
      const s = normalizeState(current);
      if (!isObject(current.skills)) migrateOldSkills(s);
      return s;
    }

    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    if (isObject(old)) {
      return normalizeState({ username: old.username, theme: old.theme, xp: old.xp });
    }
  } catch (error) {
    console.warn("Не удалось загрузить прогресс:", error);
  }
  return defaultState();
}

let state = loadState();
let currentPage = "dashboard";
let currentProjectId = PROJECTS[0].id;
let currentFile = "html";
let saveTimer = null;
let previewTimer = null;
let checking = false;
let previewErrors = [];
let previewLogs = [];
let clCurrentLesson = null;
let clPracticeResult = null;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.removeItem(OLD_SKILLS_KEY);
    return true;
  } catch (error) {
    console.warn("Не удалось сохранить прогресс:", error);
    notify("Не удалось сохранить данные. Возможно, хранилище браузера заполнено.");
    return false;
  }
}
