"use strict";

/* ============================================
   CODELEARN 4.0
   Уроки, практические проекты и проверка кода
   Файлы: index.html / style.css / script.js /
          skills.css / skills.js
============================================ */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = "codelearn-v3";
const OLD_STORAGE_KEY = "codelearn-v2";
const OLD_SKILLS_KEY = "codelearn_skill_tree_v1";
const STATE_VERSION = 4;
const PROJECT_BONUS = 50;

const FILES = ["html", "css", "js"];

const FILE_INFO = {
  html: { label: "HTML", filename: "index.html" },
  css: { label: "CSS", filename: "style.css" },
  js: { label: "JavaScript", filename: "script.js" }
};

/* Единая система уровней для всего сайта (используется и в skills.js) */
const LEVELS = [
  { name: "Новичок", min: 0, color: "#94a3b8" },
  { name: "Ученик", min: 150, color: "#60a5fa" },
  { name: "Практикант", min: 350, color: "#34d399" },
  { name: "Разработчик", min: 650, color: "#a78bfa" },
  { name: "Эксперт", min: 1000, color: "#f59e0b" },
  { name: "Мастер", min: 1500, color: "#fb7185" }
];

/* ============================================
   ПРОЕКТЫ
   Стартовый код — только каркас с подсказками.
   Комментарии перед проверкой удаляются,
   поэтому подсказки в них не засчитываются.
============================================ */
