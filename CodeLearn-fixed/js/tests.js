"use strict";
/* ============================================
   ПОВЕДЕНЧЕСКИЕ ТЕСТЫ ПРОЕКТОВ
   Каждая функция выполняется ВНУТРИ iframe с кодом ученика:
   нажимает кнопки, вводит текст и смотрит на результат.

   Правила:
   • функция НЕ может использовать внешние переменные —
     она передаётся в iframe как текст через toString();
   • доступен помощник t (см. testRunner в editor.js);
   • return true — критерий выполнен;
   • throw new Error("…") — не выполнен, текст увидит ученик.
============================================ */

const BEHAVIOR_TESTS = {
  landing: {
    heading: {
      check: t => {
        const h1 = t.$("h1");
        if (!h1) throw new Error("На странице нет заголовка h1.");
        if (!t.text(h1)) throw new Error("Заголовок h1 пустой — добавь в него текст.");
        return true;
      }
    },
    button: {
      check: t => {
        const button = t.$("button");
        if (!button) throw new Error("На странице нет элемента button.");
        if (!t.text(button)) throw new Error("Кнопка пустая — добавь в неё текст.");
        return true;
      }
    },
    layout: {
      check: t => {
        if (!t.hasDisplay(/^(inline-)?(flex|grid)$/)) throw new Error("Ни один элемент не использует display: flex или display: grid.");
        return true;
      }
    },
    responsive: {
      check: t => {
        const media = t.cssRules().filter(r => r instanceof CSSMediaRule);
        if (!media.length) throw new Error("В CSS нет медиазапроса @media.");
        if (!media.some(r => r.cssRules.length > 0)) throw new Error("Медиазапрос есть, но внутри него нет правил.");
        return true;
      }
    },
    interaction: {
      check: async t => {
        const button = t.$("#contact-btn") || t.$("button");
        if (!button) throw new Error("Нет кнопки, по которой можно кликнуть.");
        const before = t.snapshot();
        button.click();
        await t.wait();
        if (t.snapshot() === before) throw new Error("После клика по кнопке на странице ничего не изменилось.");
        return true;
      }
    },
    message: {
      description: "После клика измени текст или класс абзаца #message.",
      check: async t => {
        const button = t.$("#contact-btn") || t.$("button");
        const message = t.$("#message");
        if (!message) throw new Error("Не найден абзац с id=\"message\".");
        if (!button) throw new Error("Не найдена кнопка.");
        const read = () => t.text(message) + "|" + message.className;
        const before = read();
        button.click();
        await t.wait();
        if (read() === before) throw new Error("После клика текст и класс #message не изменились.");
        return true;
      }
    }
  },

  todo: {
    input: {
      check: t => {
        if (!t.$("input:not([type=hidden]):not([type=submit]):not([type=button])")) throw new Error("Нет поля ввода input.");
        return true;
      }
    },
    form: {
      check: t => {
        const form = t.$("form");
        if (!form) throw new Error("Нет элемента form.");
        if (!form.querySelector("input")) throw new Error("Поле ввода должно находиться внутри формы.");
        return true;
      }
    },
    list: {
      check: t => {
        if (!t.$("ul, ol")) throw new Error("Нет списка ul или ol.");
        return true;
      }
    },
    focus: {
      check: t => {
        if (!t.cssRules().some(r => r.selectorText && /:focus/.test(r.selectorText))) throw new Error("В CSS нет правила с :focus или :focus-visible.");
        return true;
      }
    },
    event: {
      check: async t => {
        const input = t.$("input");
        if (!input) throw new Error("Нет поля ввода — нечего отправлять.");
        const before = t.snapshot();
        t.type(input, "Проверочная задача");
        t.submit(input.form || t.$("form"));
        await t.wait();
        if (t.lastSubmitPrevented === true || t.snapshot() !== before) return true;
        if (t.lastSubmitPrevented === false) throw new Error("Форма отправилась и перезагрузила бы страницу. Вызови event.preventDefault() в обработчике submit.");
        throw new Error("После отправки ничего не произошло.");
      }
    },
    dom: {
      description: "После добавления задачи на странице должен появиться новый элемент (document.createElement).",
      check: async t => {
        const input = t.$("input");
        if (!input) throw new Error("Нет поля ввода.");
        const count = t.$$("body *").length;
        t.type(input, "Купить хлеб");
        t.submit(input.form || t.$("form"));
        await t.wait();
        if (t.$$("body *").length <= count) throw new Error("После добавления задачи новых элементов не появилось. Создай li через document.createElement.");
        return true;
      }
    },
    append: {
      check: async t => {
        const input = t.$("input");
        if (!input || !t.$("ul, ol")) throw new Error("Нужны поле ввода и список ul или ol.");
        t.type(input, "Позвонить маме");
        t.submit(input.form || t.$("form"));
        await t.wait();
        const found = t.$$("ul li, ol li").some(li => li.textContent.includes("Позвонить маме"));
        if (!found) throw new Error("Задача не появилась в списке. Бери текст из input.value и добавляй li через append / appendChild.");
        return true;
      }
    }
  },

  calculator: {
    display: {
      check: t => {
        if (!t.$("#display")) throw new Error("Не найден элемент с id=\"display\".");
        return true;
      }
    },
    buttons: {
      description: "Добавь кнопки цифр 0–9 с атрибутом data-value.",
      check: t => {
        const values = t.$$("button[data-value]").map(b => b.dataset.value);
        const missing = "0123456789".split("").filter(d => !values.includes(d));
        if (missing.length) throw new Error("Не хватает кнопок с data-value: " + missing.join(", ") + ".");
        return true;
      }
    },
    grid: {
      check: t => {
        if (!t.hasDisplay(/^(inline-)?grid$/)) throw new Error("Ни один элемент не использует display: grid.");
        return true;
      }
    },
    click: {
      check: async t => {
        const before = t.display();
        t.press("7");
        await t.wait();
        if (t.display() === before) throw new Error("После нажатия «7» дисплей не изменился.");
        return true;
      }
    },
    result: {
      check: async t => {
        ["4", "+", "4", "="].forEach(key => t.press(key));
        await t.wait();
        const shown = t.display();
        if (t.num(shown) !== 8) throw new Error("4 + 4 = показывает «" + shown + "», а должно быть 8.");
        return true;
      }
    },
    operation: {
      description: "Калькулятор должен правильно считать +, −, × и ÷.",
      check: async t => {
        if (!t.button("C")) throw new Error("Добавь кнопку очистки с data-action=\"clear\" — она нужна, чтобы проверить несколько примеров подряд.");
        const cases = [["2", "+", "3", 5], ["9", "-", "4", 5], ["6", "*", "7", 42], ["8", "/", "2", 4]];
        for (const [a, op, b, expected] of cases) {
          t.press("C");
          [a, op, b, "="].forEach(key => t.press(key));
          await t.wait(10);
          const shown = t.display();
          if (t.num(shown) !== expected) throw new Error(`${a} ${op} ${b} = показывает «${shown}», а должно быть ${expected}.`);
        }
        return true;
      }
    }
  }
};

/* Подключаем тесты и уточнённые описания к заданиям из data.js */
PROJECTS.forEach(project => {
  const tests = BEHAVIOR_TESTS[project.id] || {};
  project.tasks.forEach(task => {
    if (tests[task.id]) Object.assign(task, tests[task.id]);
  });
});
