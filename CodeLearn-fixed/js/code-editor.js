"use strict";
/* ============================================
   РЕДАКТОР CODEMIRROR 6
   • загружается с CDN только когда нужен;
   • textarea остаётся источником данных: CodeMirror пишет в неё
     и вызывает событие input — остальной код ничего не замечает;
   • если CDN недоступен — остаётся обычная textarea.
============================================ */

(function () {
  const CDN = "https://esm.sh/";
  const PACKAGES = [
    "codemirror@6",
    "@codemirror/state@6",
    "@codemirror/view@6",
    "@codemirror/language@6",
    "@codemirror/commands@6",
    "@codemirror/lang-html@6",
    "@codemirror/lang-css@6",
    "@codemirror/lang-javascript@6",
    "@codemirror/theme-one-dark@6"
  ];
  const EMMET = "@emmetio/codemirror6-plugin";

  const views = new Map(); // textarea → EditorView
  let libPromise = null;
  let emmetPromise = null;
  let shared = null;

  const isDark = () => document.documentElement.dataset.theme !== "light";

  /* ---------- Загрузка библиотек ---------- */

  function load() {
    if (!libPromise) {
      libPromise = Promise.all(PACKAGES.map(p => import(CDN + p)))
        .then(([cm, st, vw, lng, cmd, h, c, j, od]) => {
          const lib = {
            basicSetup: cm.basicSetup,
            EditorView: vw.EditorView,
            Decoration: vw.Decoration,
            keymap: vw.keymap,
            EditorState: st.EditorState,
            Compartment: st.Compartment,
            StateField: st.StateField,
            StateEffect: st.StateEffect,
            Prec: st.Prec,
            syntaxHighlighting: lng.syntaxHighlighting,
            defaultHighlightStyle: lng.defaultHighlightStyle,
            indentWithTab: cmd.indentWithTab,
            html: h.html,
            css: c.css,
            javascript: j.javascript,
            oneDarkHighlightStyle: od.oneDarkHighlightStyle
          };
          shared = buildShared(lib);
          return lib;
        });
      libPromise.catch(() => { libPromise = null; }); // при следующем открытии попробуем снова
    }
    return libPromise;
  }

  function loadEmmet() {
    if (!emmetPromise) {
      emmetPromise = import(CDN + EMMET).catch(error => {
        console.warn("Emmet не загрузился, редактор работает без него:", error);
        return null;
      });
    }
    return emmetPromise;
  }

  /* ---------- Тема в цветах сайта ---------- */

  const THEME = {
    "&": { height: "100%", backgroundColor: "var(--surface-2)", color: "var(--text)", fontSize: "12.5px" },
    ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.75" },
    ".cm-content": { caretColor: "var(--accent)", padding: "12px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)", borderLeftWidth: "2px" },
    "&.cm-focused": { outline: "2px solid var(--accent)", outlineOffset: "-2px" },
    ".cm-gutters": { backgroundColor: "var(--surface-2)", color: "var(--muted)", border: "none", borderRight: "1px solid var(--border)" },
    ".cm-activeLine": { backgroundColor: "var(--accent-soft)" },
    ".cm-activeLineGutter": { backgroundColor: "var(--accent-soft)", color: "var(--text)" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(124, 92, 255, .3)"
    },
    ".cm-tooltip": { backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--accent-soft)", color: "var(--text)" },
    ".cm-panels": { backgroundColor: "var(--surface)", color: "var(--text)" },
    ".cm-error-line": { backgroundColor: "var(--red-soft)", boxShadow: "inset 3px 0 0 var(--red)" }
  };

  function themeExt(lib, dark) {
    return [
      lib.EditorView.theme(THEME, { dark }),
      lib.syntaxHighlighting(dark ? lib.oneDarkHighlightStyle : lib.defaultHighlightStyle)
    ];
  }

  /* ---------- Общие расширения: тема и строка с ошибкой ---------- */

  function buildShared(lib) {
    const { StateField, StateEffect, Decoration, EditorView, Compartment } = lib;
    const setErrorLine = StateEffect.define();
    const errorLine = Decoration.line({ class: "cm-error-line" });

    const errorField = StateField.define({
      create: () => Decoration.none,
      update(deco, tr) {
        if (tr.docChanged) deco = Decoration.none; // начал исправлять — подсветка исчезает
        for (const effect of tr.effects) {
          if (!effect.is(setErrorLine)) continue;
          const n = effect.value;
          deco = n && n >= 1 && n <= tr.state.doc.lines
            ? Decoration.set([errorLine.range(tr.state.doc.line(n).from)])
            : Decoration.none;
        }
        return deco;
      },
      provide: field => EditorView.decorations.from(field)
    });

    const themeCompartment = new Compartment();

    // Тема сайта переключилась — меняем тему во всех редакторах
    let lastDark = isDark();
    new MutationObserver(() => {
      const dark = isDark();
      if (dark === lastDark) return;
      lastDark = dark;
      views.forEach(view => view.dispatch({ effects: themeCompartment.reconfigure(themeExt(lib, dark)) }));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return { setErrorLine, errorField, themeCompartment };
  }

  /* ---------- Создание редактора ---------- */

  function extensions(ta, lib, lang, emmet) {
    const isProject = ta.classList.contains("editor-input");
    const language = lang === "html" ? lib.html() : lang === "css" ? lib.css() : lib.javascript();

    const ext = [
      lib.Prec.highest(lib.keymap.of([
        { key: "Mod-Enter", run: () => { if (isProject && typeof runPreview === "function") runPreview(true); return true; } },
        { key: "Mod-s", preventDefault: true, run: () => {
          if (typeof saveCurrentDraft === "function") saveCurrentDraft();
          if (typeof saveState === "function") saveState();
          if (typeof notify === "function") notify("Сохранено.");
          return true;
        } }
      ])),
      lib.basicSetup,
      lib.keymap.of([lib.indentWithTab]),
      language,
      shared.themeCompartment.of(themeExt(lib, isDark())),
      shared.errorField,
      lib.EditorView.contentAttributes.of({
        "aria-label": ta.getAttribute("aria-label") || "Редактор кода",
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off"
      }),
      lib.EditorView.updateListener.of(update => {
        if (!update.docChanged) return;
        ta.value = update.state.doc.toString();
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      })
    ];

    if (ta.readOnly) ext.push(lib.EditorState.readOnly.of(true), lib.EditorView.editable.of(false));

    if (emmet && (lang === "html" || lang === "css")) {
      ext.push(lib.Prec.high(emmet.abbreviationTracker()));
      if (emmet.expandAbbreviation) ext.push(lib.keymap.of([{ key: "Mod-e", run: emmet.expandAbbreviation }]));
    }
    return ext;
  }

  function create(ta, lib, emmet) {
    const lang = ta.dataset.editorFile || ta.dataset.lang || "js";
    const host = document.createElement("div");
    host.className = "cm-host" + (ta.classList.contains("cl-code-input") ? " cm-host-lesson" : "");
    host.hidden = ta.hidden;
    ta.after(host);

    const attempt = withEmmet => new lib.EditorView({
      state: lib.EditorState.create({ doc: ta.value, extensions: extensions(ta, lib, lang, withEmmet ? emmet : null) }),
      parent: host
    });

    let view;
    try {
      view = attempt(true);
    } catch (firstError) {
      try {
        host.textContent = "";
        view = attempt(false); // возможно, Emmet несовместим — пробуем без него
        console.warn("Редактор запущен без Emmet:", firstError);
      } catch (error) {
        console.warn("CodeMirror не запустился, остаётся простой редактор:", error);
        host.remove();
        ta.dataset.cmFailed = "1";
        return;
      }
    }

    ta.classList.add("cm-source");
    views.set(ta, view);

    // switchFile() меняет hidden у textarea — повторяем это для редактора
    new MutationObserver(() => {
      host.hidden = ta.hidden;
      if (!ta.hidden) { view.requestMeasure(); view.focus(); }
    }).observe(ta, { attributes: true, attributeFilter: ["hidden"] });
  }

  async function mount() {
    views.forEach((view, ta) => {
      if (!ta.isConnected) { view.destroy(); views.delete(ta); }
    });

    const targets = [...document.querySelectorAll("textarea.editor-input, textarea.cl-code-input")]
      .filter(ta => !views.has(ta) && !ta.dataset.cmFailed);
    if (!targets.length) return;

    let lib;
    try {
      lib = await load();
    } catch (error) {
      console.warn("CodeMirror не загрузился (нет сети?), используется простой редактор:", error);
      return;
    }
    const emmet = await loadEmmet();

    // Пока грузились, страница могла перерисоваться
    targets.forEach(ta => { if (ta.isConnected && !views.has(ta)) create(ta, lib, emmet); });
  }

  // Заранее подгружаем редактор, пока пользователь смотрит обзор
  setTimeout(() => { load().catch(() => {}); loadEmmet(); }, 2500);

  window.CodeLearnEditor = {
    mount,
    refresh() { views.forEach(view => view.requestMeasure()); },
    markError(file, line) {
      if (!shared) return;
      views.forEach((view, ta) => {
        if (ta.dataset.editorFile === file) view.dispatch({ effects: shared.setErrorLine.of(line) });
      });
    },
    clearErrors() {
      if (!shared) return;
      views.forEach(view => view.dispatch({ effects: shared.setErrorLine.of(null) }));
    }
  };
})();
