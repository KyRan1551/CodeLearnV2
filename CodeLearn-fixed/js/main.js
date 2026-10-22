"use strict";
/* ============================================
   API ДЛЯ МОДУЛЯ НАВЫКОВ (skills.js)
============================================ */

window.notify = notify;
window.CodeLearnApp = {
  getLevel,
  levels: LEVELS,
  getState: () => state,
  updateSkills(mutator) {
    mutator(state.skills);
    checkAchievements();
    saveState();
    updateStats();
    if (currentPage === "skills") render("skills", { scroll: false });
  }
};

/* ============================================
   ЗАПУСК
============================================ */

applyTheme();
lastShownXp = state.xp;
checkAchievements();   // начисляет XP за уже освоенные навыки после обновления
saveState();
startRouter();         // вместо render("dashboard"): открывает страницу из адреса
