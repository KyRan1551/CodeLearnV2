"use strict";
/* ============================================
   НАВИГАЦИЯ
============================================ */

const PAGE_NAMES = {
  dashboard: "Обзор",
  skills: "Дерево навыков",
  lessons: "Уроки",
  projects: "Практические проекты",
  workspace: "Редактор проекта",
  achievements: "Достижения",
  profile: "Мой профиль"
};

function render(page = currentPage, options = {}) {
  const changed = page !== currentPage;
  if (currentPage === "workspace" && page !== "workspace") saveCurrentDraft();

  currentPage = PAGE_NAMES[page] ? page : "dashboard";
  $("#page-name").textContent = PAGE_NAMES[currentPage];


  $$(".nav-item").forEach(button => {
    const active = button.dataset.page === currentPage;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  const renderers = {
    dashboard: renderDashboard,
    skills: renderSkillsPage,
    lessons: renderLessonsPage,
    projects: renderProjects,
    workspace: () => renderWorkspace(currentProjectId),
    achievements: renderAchievements,
    profile: renderProfile
  };

  $("#content").innerHTML = renderers[currentPage]();
    window.CodeLearnEditor?.mount();
  
  if (currentPage === "profile") window.CodeLearnFX?.mountSettings($("#fx-settings"));

  document.title = `${PAGE_NAMES[currentPage]} — CodeLearn`;

  updateStats();
  applyTheme();
  closeMobileMenu();

  if (currentPage === "workspace") { initWorkspace(); runPreview(false); }
  if (options.scroll !== false && (changed || options.scroll)) scrollPageTop();
  syncHash();

}

function closeMobileMenu() {
  $("#sidebar").classList.remove("open");
  $("#sidebar-backdrop").classList.remove("show");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}

function openProject(projectId) {
  const project = projectById(projectId);
  if (!project) return;
  currentProjectId = projectId;
  currentFile = "html";
  ensureDraft(project);
  render("workspace", { scroll: true });
}

/* ============================================
   ДОСТИЖЕНИЯ И НАГРАДЫ ЗА НАВЫКИ
============================================ */

function rewardSkills() {
  if (!window.CodeLearnSkills || typeof window.CodeLearnSkills.getAutoMastered !== "function") return [];
  const rewarded = [];
  window.CodeLearnSkills.getAutoMastered(state, PROJECTS).forEach(skill => {
    if (!state.skills.rewarded.includes(skill.id)) {
      state.skills.rewarded.push(skill.id);
      state.xp += skill.xp;
      rewarded.push(skill);
    }
  });
  return rewarded;
}

function checkAchievements() {
  const unlocked = [];
  const skills = [];
  let changed = true;

  while (changed) {
    changed = false;
    rewardSkills().forEach(skill => { skills.push(skill); changed = true; });

    ACHIEVEMENTS.forEach(achievement => {
      if (state.achievements.includes(achievement.id)) return;
      let passed = false;
      try { passed = achievement.check(state); } catch (error) { console.warn("Ошибка проверки достижения:", achievement.id, error); }
      if (passed) {
        state.achievements.push(achievement.id);
        state.xp += achievement.xpReward;
        unlocked.push(achievement);
        changed = true;
      }
    });
  }

  if (skills.length === 1) notify(`🧠 Навык освоен: ${skills[0].title} (+${skills[0].xp} XP)`);
  else if (skills.length > 1) notify(`🧠 Освоено навыков: ${skills.length} (+${skills.reduce((s, k) => s + k.xp, 0)} XP)`);

  if (unlocked.length) window.CodeLearnFX?.play("achievement");

  
  if (unlocked.length === 1) notify(`${unlocked[0].icon} Достижение: ${unlocked[0].title} (+${unlocked[0].xpReward} XP)`);
  else if (unlocked.length > 1) notify(`🏆 Новых достижений: ${unlocked.length} (+${unlocked.reduce((s, a) => s + a.xpReward, 0)} XP)`);

  return unlocked;
}