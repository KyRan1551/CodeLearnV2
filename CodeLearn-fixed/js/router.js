"use strict";
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

/* Мгновенно прокручивает наверх всё, что может прокручиваться */
function scrollPageTop() {
  const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const main = document.querySelector(".main-area");
    if (main) main.scrollTop = 0;
    const content = document.querySelector("#content");
    if (content) content.scrollTop = 0;
  };
  reset();
  requestAnimationFrame(reset); // повтор после того, как браузер перерисовал страницу
}

/* ============================================
   РОУТЕР
   #dashboard, #lessons, #lessons/html-basics,
   #projects, #workspace/todo, #skills ...
============================================ */

let routerApplying = false;
let lastAppliedHash = "";

function routeHash() {
  if (currentPage === "workspace") return `#workspace/${encodeURIComponent(currentProjectId)}`;
  if (currentPage === "lessons" && clCurrentLesson) return `#lessons/${encodeURIComponent(clCurrentLesson)}`;
  return `#${currentPage}`;
}

/* Вызывается в конце render(): записывает текущую страницу в адрес */
function syncHash() {
  if (routerApplying) return;
  const hash = routeHash();
  if (location.hash !== hash) {
    history.pushState(null, "", hash);
  }
  lastAppliedHash = hash;
}

function applyRoute(force = false) {
  if (!force && location.hash === lastAppliedHash) return;

  const [rawPage = "", rawId = ""] = location.hash.slice(1).split("/");
  const page = decodeURIComponent(rawPage);
  const id = decodeURIComponent(rawId);

  routerApplying = true;
  try {
    if (page === "workspace") {
      const project = projectById(id) || projectById(currentProjectId);
      currentProjectId = project.id;
      currentFile = "html";
      ensureDraft(project);
      render("workspace", { scroll: true });
    } else if (page === "lessons") {
      clCurrentLesson = lessonById(id) ? id : null;
      clPracticeResult = null;
      render("lessons", { scroll: true });
    } else {
      clCurrentLesson = null;
      render(PAGE_NAMES[page] ? page : "dashboard", { scroll: true });
    }
  } finally {
    routerApplying = false;
  }

  // Исправляем адрес (например, "" или #abc → #dashboard) без новой записи в истории
  const hash = routeHash();
  if (location.hash !== hash) history.replaceState(null, "", hash);
  lastAppliedHash = hash;
}

function startRouter() {
  // Стрелочные обёртки обязательны: иначе объект события попадёт в force
  window.addEventListener("popstate", () => applyRoute());
  window.addEventListener("hashchange", () => applyRoute());
  applyRoute(true); // первый запуск — отрисовываем всегда
}
