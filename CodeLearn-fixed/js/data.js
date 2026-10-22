"use strict";
const PROJECTS = [
  {
    id: "landing",
    title: "Лендинг разработчика",
    subtitle: "Создай свою первую презентационную страницу.",
    description: "Собери адаптивную страницу портфолио с заголовком, кнопкой действия и красивым оформлением.",
    icon: "</>",
    cover: "cover-landing",
    difficulty: "Начальный",
    category: "HTML · CSS · JS",
    time: "25–40 мин",
    objectives: [
      "Добавить главный заголовок страницы.",
      "Создать кнопку действия.",
      "Выстроить макет с помощью Flexbox или Grid.",
      "Сделать страницу адаптивной.",
      "Оживить кнопку с помощью JavaScript."
    ],
    starter: {
      html: `<main class="hero">
  <span class="eyebrow">МОЁ ПОРТФОЛИО</span>

  <!-- Шаг 1. Добавь главный заголовок страницы (тег h1).
       Например: Привет! Я разработчик. -->

  <p>Создаю полезные цифровые продукты и изучаю веб-разработку.</p>

  <!-- Шаг 2. Добавь кнопку с id="contact-btn"
       и текстом «Связаться со мной». -->

  <!-- Сюда JavaScript выведет сообщение после нажатия -->
  <p id="message" aria-live="polite"></p>
</main>`,
      css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  padding: 24px;
  font-family: Arial, sans-serif;
  background: #10111b;
  color: white;
}

.hero {
  width: min(100%, 680px);
  margin: 40px auto;
  padding: 40px;
  border-radius: 24px;
  background: #202234;
}

.eyebrow {
  color: #a58bff;
  font-size: 12px;
  letter-spacing: 2px;
}

/* Шаг 3. Расположи содержимое .hero с помощью Flexbox или Grid.
   Подсказка: display, flex-direction, gap, align-items. */

/* Шаг 4. Оформи кнопку: фон, отступы, скругление, cursor: pointer. */

/* Шаг 5. Добавь медиазапрос для экранов уже 500px
   и уменьши внутренние отступы .hero. */
`,
      js: `// Шаг 6. Найди кнопку и абзац для сообщения.
// Подсказка: document.querySelector("#contact-btn")

// Шаг 7. Подпиши кнопку на событие "click"
// с помощью метода addEventListener.

// Шаг 8. Внутри обработчика измени текст абзаца #message,
// например, через свойство textContent.
`
    },
    tasks: [
      {
        id: "heading",
        title: "Создай главный заголовок",
        description: "В HTML должен быть заголовок h1 с текстом.",
        hint: "Напиши <h1>Привет! Я разработчик.</h1> вместо комментария «Шаг 1».",
        file: "html",
        pattern: /<h1\b[^>]*>\s*[^<\s][\s\S]*?<\/h1\s*>/i,
        xp: 20
      },
      {
        id: "button",
        title: "Добавь кнопку",
        description: "Создай настоящую HTML-кнопку с текстом.",
        hint: "Используй тег <button id=\"contact-btn\">Связаться со мной</button>.",
        file: "html",
        pattern: /<button\b[^>]*>\s*[^<\s][\s\S]*?<\/button\s*>/i,
        xp: 20
      },
      {
        id: "layout",
        title: "Оформи макет",
        description: "Используй Flexbox или CSS Grid.",
        hint: "Добавь .hero { display: flex; flex-direction: column; gap: 16px; }",
        file: "css",
        pattern: /display\s*:\s*(flex|grid|inline-flex|inline-grid)\b/i,
        xp: 25
      },
      {
        id: "responsive",
        title: "Добавь адаптивность",
        description: "Используй медиазапрос @media с правилами внутри.",
        hint: "@media (max-width: 500px) { .hero { padding: 24px; } }",
        file: "css",
        pattern: /@media[^{]+\{\s*[^}\s][^}]*\{[^}]*\}/i,
        xp: 25
      },
      {
        id: "interaction",
        title: "Добавь интерактивность",
        description: "Обработай клик по кнопке через addEventListener(\"click\", ...).",
        hint: "button.addEventListener(\"click\", () => { ... });",
        file: "js",
        pattern: /addEventListener\s*\(\s*["'`]click["'`]/i,
        xp: 30
      },
      {
        id: "message",
        title: "Покажи результат действия",
        description: "Измени текст элемента или его класс после события.",
        hint: "message.textContent = \"Спасибо! Давай создадим что-нибудь вместе.\";",
        file: "js",
        pattern: /(textContent|innerText)\s*=(?!=)|classList\.(add|toggle|remove)\s*\(/i,
        xp: 30
      }
    ]
  },
  {
    id: "todo",
    title: "Менеджер задач",
    subtitle: "Собери интерактивный список дел.",
    description: "Создай приложение, в котором можно вводить задачи, добавлять их в список и оформлять интерфейс.",
    icon: "✓",
    cover: "cover-todo",
    difficulty: "Средний",
    category: "DOM · Events · CSS",
    time: "35–50 мин",
    objectives: [
      "Создать форму с полем ввода и кнопкой.",
      "Добавить контейнер для списка задач.",
      "Оформить состояние фокуса поля.",
      "Обработать отправку формы.",
      "Создавать новые элементы списка через DOM."
    ],
    starter: {
      html: `<main class="todo-app">
  <span class="eyebrow">МОЯ ПРОДУКТИВНОСТЬ</span>
  <h1>Список задач</h1>
  <p>Маленькие шаги приводят к большим результатам.</p>

  <!-- Шаг 1. Создай форму с id="todo-form". -->
  <!-- Шаг 2. Внутри формы добавь поле ввода с id="todo-input"
       и кнопку type="submit" с текстом «Добавить».
       Подсказка: оберни их в div class="input-row". -->

  <!-- Шаг 3. Добавь пустой список ul с id="todo-list". -->

  <p id="todo-count">Пока нет задач</p>
</main>`,
      css: `* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 30px 16px;
  min-height: 100vh;
  background: #101b24;
  color: #f5f7fb;
  font-family: Arial, sans-serif;
}

.todo-app {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 30px;
  border-radius: 20px;
  background: #1a2a37;
}

.eyebrow { color: #69dfd0; font-size: 11px; letter-spacing: 2px; }

.input-row { display: flex; gap: 8px; }

input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid #435263;
  border-radius: 9px;
  background: #101b24;
  color: white;
}

button {
  padding: 11px 14px;
  border: 0;
  border-radius: 9px;
  background: #69dfd0;
  color: #10202b;
  cursor: pointer;
}

li {
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  background: #253b4a;
  list-style: none;
}

/* Шаг 4. Оформи поле ввода в состоянии фокуса (input:focus),
   например, цветной рамкой outline. */
`,
      js: `// Шаг 5. Найди форму, поле ввода, список и счётчик
// через document.querySelector.

// Шаг 6. Подпишись на событие "submit" формы (addEventListener)
// и отмени перезагрузку страницы: event.preventDefault().

// Шаг 7. Создай новый элемент li (document.createElement),
// запиши в него текст из поля ввода.

// Шаг 8. Добавь элемент в список (append или appendChild),
// очисти поле и обнови счётчик задач.
`
    },
    tasks: [
      {
        id: "input",
        title: "Поле ввода",
        description: "Добавь элемент input в HTML.",
        hint: "<input id=\"todo-input\" placeholder=\"Новая задача\" required>",
        file: "html",
        pattern: /<input\b[^>]*>/i,
        xp: 25
      },
      {
        id: "form",
        title: "Форма добавления",
        description: "Используй форму form для отправки задачи.",
        hint: "<form id=\"todo-form\"> ... </form> — поле и кнопка должны быть внутри.",
        file: "html",
        pattern: /<form\b[^>]*>[\s\S]*?<\/form\s*>/i,
        xp: 25
      },
      {
        id: "list",
        title: "Список элементов",
        description: "Создай контейнер ul или ol.",
        hint: "<ul id=\"todo-list\"></ul>",
        file: "html",
        pattern: /<(ul|ol)\b[^>]*>[\s\S]*?<\/\1\s*>/i,
        xp: 25
      },
      {
        id: "focus",
        title: "Оформи поле ввода",
        description: "Добавь стили состояния :focus.",
        hint: "input:focus { outline: 2px solid #69dfd0; }",
        file: "css",
        pattern: /:focus(-visible)?\s*[,{]/i,
        xp: 25
      },
      {
        id: "event",
        title: "Обработка отправки",
        description: "Обработай событие submit (или click) через addEventListener.",
        hint: "form.addEventListener(\"submit\", (event) => { event.preventDefault(); ... });",
        file: "js",
        pattern: /addEventListener\s*\(\s*["'`](submit|click)["'`]/i,
        xp: 40
      },
      {
        id: "dom",
        title: "Создание элементов",
        description: "Создай элемент через document.createElement.",
        hint: "const item = document.createElement(\"li\");",
        file: "js",
        pattern: /createElement\s*\(\s*["'`]\w+["'`]\s*\)/i,
        xp: 30
      },
      {
        id: "append",
        title: "Добавление задачи",
        description: "Используй append, appendChild или prepend.",
        hint: "list.appendChild(item);",
        file: "js",
        pattern: /\.(append|appendChild|prepend)\s*\(/i,
        xp: 30
      }
    ]
  },
  {
    id: "calculator",
    title: "Калькулятор",
    subtitle: "Создай калькулятор с обработкой действий.",
    description: "Собери интерфейс калькулятора, расположи кнопки сеткой и реализуй вычисления на JavaScript.",
    icon: "±",
    cover: "cover-calculator",
    difficulty: "Средний",
    category: "Logic · Grid · DOM",
    time: "40–60 мин",
    objectives: [
      "Создать дисплей результата.",
      "Добавить кнопки цифр и операций.",
      "Расположить кнопки через CSS Grid.",
      "Обрабатывать нажатия кнопок.",
      "Реализовать вычисление и вывод результата."
    ],
    starter: {
      html: `<main class="calculator">
  <span class="eyebrow">МИНИ-ПРОЕКТ</span>
  <h1>Калькулятор</h1>

  <!-- Шаг 1. Добавь дисплей: элемент output с id="display" и текстом 0. -->

  <div class="keypad">
    <!-- Шаг 2. Добавь кнопки:
         цифры 0–9 и точка:  button с data-value="7"
         операции:           button с data-action="operator" data-value="+"
         равно:              button с data-action="equals"
         очистка:            button с data-action="clear" -->
  </div>
</main>`,
      css: `* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 24px;
  min-height: 100vh;
  background: #211b29;
  color: #fff;
  font-family: Arial, sans-serif;
}

.calculator {
  width: min(100%, 350px);
  margin: 20px auto;
  padding: 22px;
  border-radius: 20px;
  background: #30273a;
  box-shadow: 0 20px 50px #0003;
}

.eyebrow { color: #f1bd83; font-size: 11px; letter-spacing: 2px; }

#display {
  display: block;
  overflow: hidden;
  padding: 20px 10px;
  text-align: right;
  font-size: 36px;
  background: #211b29;
  border-radius: 12px;
}

.keypad {
  margin-top: 14px;
  /* Шаг 3. Расположи кнопки сеткой в 4 колонки.
     Подсказка: display, grid-template-columns, gap. */
}

button {
  min-height: 51px;
  border: 0;
  border-radius: 10px;
  background: #483c54;
  color: white;
  font-size: 17px;
  cursor: pointer;
}

button:hover { background: #5b4969; }
`,
      js: `const display = document.querySelector("#display");
const keypad = document.querySelector(".keypad");

let current = "0";
let previous = null;
let operator = null;

// Шаг 4. Напиши функцию calculate(a, b, op), которая обрабатывает
// операции "+", "-", "*", "/" (через if или switch).
// Не забудь про деление на ноль!

// Шаг 5. Подпишись на клики по .keypad (addEventListener("click", ...))
// и определи нажатую кнопку: event.target.closest("button").
// Данные кнопки лежат в button.dataset.value и button.dataset.action.

// Шаг 6. После каждого действия показывай результат:
// display.textContent = current;
`
    },
    tasks: [
      {
        id: "display",
        title: "Дисплей результата",
        description: "Создай элемент с id=\"display\" для отображения числа.",
        hint: "<output id=\"display\">0</output>",
        file: "html",
        pattern: /<(output|input|div|span|p)\b[^>]*\bid\s*=\s*["']display["']/i,
        xp: 25
      },
      {
        id: "buttons",
        title: "Кнопки калькулятора",
        description: "Добавь минимум 10 кнопок с атрибутом data-value (цифры 0–9).",
        hint: "<button data-value=\"7\">7</button> — и так для каждой цифры.",
        file: "html",
        test: source => (source.match(/<button\b[^>]*\bdata-value\s*=/gi) || []).length >= 10,
        xp: 25
      },
      {
        id: "grid",
        title: "Сетка кнопок",
        description: "Используй display: grid.",
        hint: ".keypad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }",
        file: "css",
        pattern: /display\s*:\s*grid\b/i,
        xp: 30
      },
      {
        id: "click",
        title: "Обработка нажатий",
        description: "Обработай клик через addEventListener(\"click\", ...).",
        hint: "keypad.addEventListener(\"click\", (event) => { ... });",
        file: "js",
        pattern: /addEventListener\s*\(\s*["'`]click["'`]/i,
        xp: 35
      },
      {
        id: "operation",
        title: "Арифметические операции",
        description: "Обработай символы операций \"+\", \"-\", \"*\", \"/\" через if или switch.",
        hint: "if (op === \"+\") return a + b;  или  case \"+\": return a + b;",
        file: "js",
        pattern: /case\s*["'`][+\-*\/]["'`]|===?\s*["'`][+\-*\/]["'`]/,
        xp: 35
      },
      {
        id: "result",
        title: "Отображение результата",
        description: "Обновляй текст дисплея после вычисления.",
        hint: "display.textContent = current;",
        file: "js",
        pattern: /(textContent|innerText|\.value)\s*=(?!=)/i,
        xp: 30
      }
    ]
  }
];

/* ============================================
   УРОКИ
   Шаги: начать урок → тест → практика → завершение
============================================ */

const CL_LESSONS = [
  {
    id: "html-basics", title: "Основы HTML", level: "Начальный", xp: 20, icon: "🧱",
    summary: "Теги, заголовки и абзацы — каркас любой веб-страницы.",
    theory: "HTML задаёт структуру страницы. Тег <h1> создаёт главный заголовок, <p> — абзац, <a> — ссылку, а <img> — изображение. Большинство тегов парные: есть открывающий <p> и закрывающий </p>.",
    example: "<h1>Привет, мир!</h1>\n<p>Это моя первая страница.</p>",
    question: "Какой тег используют для главного заголовка?",
    answers: ["<p>", "<h1>", "<head>"], correct: 1,
    explanation: "<h1> обозначает заголовок первого уровня.",
    practice: {
      type: "html",
      task: "Напиши главный заголовок h1 с любым текстом и под ним абзац p с описанием.",
      starter: "<!-- Напиши свой код ниже -->\n",
      hint: "Не забудь закрывающие теги: <h1>Мой сайт</h1> и <p>Описание</p>.",
      checks: [
        { label: "Есть заголовок h1 с текстом", pattern: /<h1\b[^>]*>\s*[^<\s][\s\S]*?<\/h1\s*>/i },
        { label: "Есть абзац p с текстом", pattern: /<p\b[^>]*>\s*[^<\s][\s\S]*?<\/p\s*>/i }
      ]
    }
  },
  {
    id: "css-basics", title: "Основы CSS", level: "Начальный", xp: 20, icon: "🎨",
    summary: "Селекторы и свойства: как управлять внешним видом.",
    theory: "CSS отвечает за внешний вид страницы: цвета, размеры, отступы и расположение элементов. Селектор выбирает элементы, а внутри фигурных скобок свойства задают их стиль.",
    example: "h1 {\n  color: rebeccapurple;\n  font-size: 32px;\n}",
    question: "Какое свойство меняет цвет текста?",
    answers: ["background", "font-size", "color"], correct: 2,
    explanation: "Свойство color задаёт цвет текста.",
    practice: {
      type: "css",
      task: "Напиши правило для селектора h1 и задай ему цвет текста свойством color.",
      starter: "/* Напиши своё правило ниже */\n",
      hint: "h1 { color: tomato; }",
      checks: [
        { label: "Есть правило для h1", pattern: /(^|[\s,}])h1\s*\{[^}]*\}/i },
        { label: "Внутри задано свойство color", pattern: /(^|[\s,}])h1\s*\{[^}]*(^|[\s;{])color\s*:\s*[^;}\s]/i }
      ]
    }
  },
  {
    id: "js-basics", title: "Основы JavaScript", level: "Начальный", xp: 25, icon: "⚡",
    summary: "Переменные, строки и вывод в консоль.",
    theory: "JavaScript добавляет странице поведение. Переменные хранят значения: const — для значений, которые не переназначаются, let — для изменяемых. console.log выводит данные в консоль разработчика.",
    example: "const name = \"Аня\";\nconsole.log(\"Привет, \" + name + \"!\");",
    question: "Какое ключевое слово объявляет переменную, которую нельзя переназначить?",
    answers: ["const", "let", "var"], correct: 0,
    explanation: "const объявляет привязку, которую нельзя переназначить.",
    practice: {
      type: "js",
      task: "Объяви константу name со своим именем (строкой) и выведи приветствие через console.log.",
      starter: "// Напиши свой код ниже\n",
      hint: "const name = \"Иван\";  console.log(\"Привет, \" + name);",
      checks: [
        { label: "Объявлена константа name со строкой", pattern: /\bconst\s+name\s*=\s*(["'`])[^"'`]+\1/ },
        { label: "Есть вывод через console.log", pattern: /console\.log\s*\(/ }
      ]
    }
  },
  {
    id: "if-else", title: "Условия if / else", level: "Начальный", xp: 25, icon: "🔀",
    summary: "Как программа принимает решения.",
    theory: "Условие позволяет выполнять разные действия в зависимости от результата проверки. Код внутри if выполняется, когда условие истинно; иначе выполняется ветка else.",
    example: "const score = 80;\nif (score >= 60) {\n  console.log(\"Сдано\");\n} else {\n  console.log(\"Попробуй ещё\");\n}",
    question: "Какая ветка выполняется, если условие if ложно и есть else?",
    answers: ["if", "else", "Обе всегда"], correct: 1,
    explanation: "При ложном условии выполняется ветка else.",
    practice: {
      type: "js",
      task: "Объяви переменную age. Если age >= 18 — выведи «Доступ разрешён», иначе — «Доступ запрещён».",
      starter: "// Напиши свой код ниже\n",
      hint: "const age = 20;  if (age >= 18) { ... } else { ... }",
      checks: [
        { label: "Объявлена переменная age", pattern: /\b(const|let|var)\s+age\s*=/ },
        { label: "Есть условие if с age", pattern: /\bif\s*\([^)]*\bage\b[^)]*\)/ },
        { label: "Есть ветка else", pattern: /\belse\b/ }
      ]
    }
  },
  {
    id: "loops", title: "Циклы for", level: "Начальный", xp: 25, icon: "🔁",
    summary: "Повторяем действия без копирования кода.",
    theory: "Цикл for повторяет код несколько раз. В скобках три части: начальное значение счётчика, условие продолжения и шаг изменения. Пока условие истинно, тело цикла выполняется снова.",
    example: "for (let i = 1; i <= 3; i++) {\n  console.log(\"Шаг \" + i);\n}",
    question: "Сколько раз выполнится цикл for (let i = 0; i < 3; i++)?",
    answers: ["2 раза", "3 раза", "4 раза"], correct: 1,
    explanation: "Счётчик принимает значения 0, 1 и 2 — всего три итерации.",
    practice: {
      type: "js",
      task: "С помощью цикла for выведи в консоль числа от 1 до 5.",
      starter: "// Напиши свой код ниже\n",
      hint: "for (let i = 1; i <= 5; i++) { console.log(i); }",
      checks: [
        { label: "Используется цикл for", pattern: /\bfor\s*\(/ },
        { label: "Условие доходит до 5", pattern: /(<=\s*5|<\s*6)\b/ },
        { label: "Есть вывод через console.log", pattern: /console\.log\s*\(/ }
      ]
    }
  },
  {
    id: "dom-events", title: "События в DOM", level: "Средний", xp: 30, icon: "🖱️",
    summary: "Как страница реагирует на действия пользователя.",
    theory: "document.querySelector находит элемент на странице по CSS-селектору. Метод addEventListener подписывает элемент на событие — например, \"click\" — и вызывает функцию, когда событие происходит.",
    example: "const button = document.querySelector(\"#btn\");\nbutton.addEventListener(\"click\", () => {\n  console.log(\"Клик!\");\n});",
    question: "Какой метод подписывает элемент на событие?",
    answers: ["addEventListener", "querySelector", "createElement"], correct: 0,
    explanation: "addEventListener добавляет обработчик события к элементу.",
    practice: {
      type: "js",
      task: "Найди кнопку с id=\"btn\" через querySelector и добавь обработчик click, который выводит сообщение в консоль.",
      starter: "// Напиши свой код ниже\n",
      hint: "const btn = document.querySelector(\"#btn\");  btn.addEventListener(\"click\", () => console.log(\"Клик\"));",
      checks: [
        { label: "Кнопка найдена через querySelector(\"#btn\")", pattern: /querySelector\s*\(\s*["'`]#btn["'`]\s*\)/ },
        { label: "Добавлен обработчик click", pattern: /addEventListener\s*\(\s*["'`]click["'`]/ },
        { label: "Внутри есть console.log", pattern: /console\.log\s*\(/ }
      ]
    }
  }
];

/* ============================================
   ДОСТИЖЕНИЯ
============================================ */

function getCompletedTaskRecords(s) {
  return PROJECTS.flatMap(project =>
    project.tasks
      .filter(task => (s.tasks[project.id] || []).includes(task.id))
      .map(task => ({ ...task, projectId: project.id }))
  );
}

function getCompletedProjectCount(s) {
  return PROJECTS.filter(project => (s.completedProjects || []).includes(project.id)).length;
}

function countTasksByFile(s, file) {
  return getCompletedTaskRecords(s).filter(task => task.file === file).length;
}

function totalTasksByFile(file) {
  return PROJECTS.reduce((n, p) => n + p.tasks.filter(t => t.file === file).length, 0);
}

function totalTaskCount() {
  return PROJECTS.reduce((n, p) => n + p.tasks.length, 0);
}

function hasTask(s, projectId, taskId) {
  return (s.tasks[projectId] || []).includes(taskId);
}

function allProjectTasksComplete(s, projectId) {
  const project = projectById(projectId);
  return !!project && project.tasks.every(task => hasTask(s, projectId, task.id));
}

function hasTaskInEveryProject(s) {
  return PROJECTS.every(project => (s.tasks[project.id] || []).length > 0);
}

function draftChanged(s, project) {
  const draft = s.drafts[project.id];
  return !!draft && FILES.some(f => typeof draft[f] === "string" && draft[f] !== project.starter[f]);
}

const ACHIEVEMENTS = [
  // ПЕРВЫЕ ШАГИ
  { id: "first", icon: "🌱", title: "Первый шаг", description: "Выполни первое задание.", category: "Первые шаги", rarity: "Обычное", xpReward: 10, check: s => getCompletedTaskRecords(s).length >= 1 },
  { id: "tasks3", icon: "🪴", title: "Разминка", description: "Выполни 3 задания.", category: "Первые шаги", rarity: "Обычное", xpReward: 15, check: s => getCompletedTaskRecords(s).length >= 3 },
  { id: "tasks5", icon: "📘", title: "Уже получается", description: "Выполни 5 заданий.", category: "Первые шаги", rarity: "Обычное", xpReward: 20, check: s => getCompletedTaskRecords(s).length >= 5 },
  { id: "tasks10", icon: "🎯", title: "Уверенный старт", description: "Выполни 10 заданий.", category: "Первые шаги", rarity: "Редкое", xpReward: 30, check: s => getCompletedTaskRecords(s).length >= 10 },
  { id: "tasks15", icon: "🚀", title: "Не остановить", description: "Выполни 15 заданий.", category: "Первые шаги", rarity: "Эпическое", xpReward: 40, check: s => getCompletedTaskRecords(s).length >= 15 },
  { id: "firstcode", icon: "⌨️", title: "Первый эксперимент", description: "Измени стартовый код проекта.", category: "Первые шаги", rarity: "Обычное", xpReward: 10, check: s => PROJECTS.some(p => draftChanged(s, p)) },

  // ТЕОРИЯ
  { id: "lesson1", icon: "📖", title: "Теоретик", description: "Заверши первый урок.", category: "Теория", rarity: "Обычное", xpReward: 10, check: s => s.completedLessons.length >= 1 },
  { id: "lessonsHalf", icon: "📚", title: "Книжный червь", description: "Заверши половину уроков.", category: "Теория", rarity: "Редкое", xpReward: 20, check: s => s.completedLessons.length >= Math.ceil(CL_LESSONS.length / 2) },
  { id: "lessonsAll", icon: "🎓", title: "Знаток основ", description: "Заверши все уроки.", category: "Теория", rarity: "Эпическое", xpReward: 40, check: s => s.completedLessons.length >= CL_LESSONS.length },

  // HTML
  { id: "html1", icon: "🧱", title: "Первый кирпич", description: "Выполни первое HTML-задание.", category: "HTML", rarity: "Обычное", xpReward: 10, check: s => countTasksByFile(s, "html") >= 1 },
  { id: "html3", icon: "📐", title: "Строитель страниц", description: "Выполни 3 HTML-задания.", category: "HTML", rarity: "Редкое", xpReward: 20, check: s => countTasksByFile(s, "html") >= 3 },
  { id: "html6", icon: "🏛️", title: "Архитектор разметки", description: "Выполни 6 HTML-заданий.", category: "HTML", rarity: "Эпическое", xpReward: 35, check: s => countTasksByFile(s, "html") >= 6 },
  { id: "htmlmaster", icon: "📄", title: "Мастер HTML", description: "Выполни все HTML-задания платформы.", category: "HTML", rarity: "Легендарное", xpReward: 50, check: s => countTasksByFile(s, "html") >= totalTasksByFile("html") },

  // CSS
  { id: "css1", icon: "🎨", title: "Первый стиль", description: "Выполни первое CSS-задание.", category: "CSS", rarity: "Обычное", xpReward: 10, check: s => countTasksByFile(s, "css") >= 1 },
  { id: "css3", icon: "🖌️", title: "Дизайнер интерфейсов", description: "Выполни 3 CSS-задания.", category: "CSS", rarity: "Редкое", xpReward: 20, check: s => countTasksByFile(s, "css") >= 3 },
  { id: "css4", icon: "📱", title: "Адаптивный мастер", description: "Выполни все CSS-задания платформы.", category: "CSS", rarity: "Эпическое", xpReward: 35, check: s => countTasksByFile(s, "css") >= totalTasksByFile("css") },
  { id: "responsive", icon: "🪄", title: "На любом экране", description: "Выполни задание по адаптивной вёрстке.", category: "CSS", rarity: "Редкое", xpReward: 20, check: s => hasTask(s, "landing", "responsive") },
  { id: "gridMaster", icon: "🔲", title: "Мастер сеток", description: "Выполни задание по CSS Grid.", category: "CSS", rarity: "Редкое", xpReward: 20, check: s => hasTask(s, "calculator", "grid") },

  // JAVASCRIPT
  { id: "js1", icon: "⚡", title: "Искра JavaScript", description: "Выполни первое JavaScript-задание.", category: "JavaScript", rarity: "Обычное", xpReward: 10, check: s => countTasksByFile(s, "js") >= 1 },
  { id: "js3", icon: "🔌", title: "Оживитель интерфейсов", description: "Выполни 3 JavaScript-задания.", category: "JavaScript", rarity: "Редкое", xpReward: 20, check: s => countTasksByFile(s, "js") >= 3 },
  { id: "js6", icon: "🧠", title: "Логика в действии", description: "Выполни 6 JavaScript-заданий.", category: "JavaScript", rarity: "Эпическое", xpReward: 35, check: s => countTasksByFile(s, "js") >= 6 },
  { id: "jsmaster", icon: "💻", title: "Повелитель JavaScript", description: "Выполни все JavaScript-задания платформы.", category: "JavaScript", rarity: "Легендарное", xpReward: 50, check: s => countTasksByFile(s, "js") >= totalTasksByFile("js") },
  { id: "domMaster", icon: "🧬", title: "Повелитель DOM", description: "Выполни задание по созданию элементов DOM.", category: "JavaScript", rarity: "Эпическое", xpReward: 30, check: s => hasTask(s, "todo", "dom") },
  { id: "interactionMaster", icon: "🖱️", title: "Интерактивный гений", description: "Выполни задания по обработке событий в двух проектах.", category: "JavaScript", rarity: "Эпическое", xpReward: 35, check: s => hasTask(s, "landing", "interaction") && hasTask(s, "todo", "event") },

  // ПРОЕКТЫ
  { id: "project", icon: "🛠️", title: "Создатель", description: "Заверши первый проект.", category: "Проекты", rarity: "Редкое", xpReward: 25, check: s => getCompletedProjectCount(s) >= 1 },
  { id: "twoProjects", icon: "🔧", title: "Серийный разработчик", description: "Заверши два проекта.", category: "Проекты", rarity: "Эпическое", xpReward: 40, check: s => getCompletedProjectCount(s) >= 2 },
  { id: "three", icon: "🏆", title: "Архитектор", description: "Заверши все проекты.", category: "Проекты", rarity: "Легендарное", xpReward: 75, check: s => getCompletedProjectCount(s) >= PROJECTS.length },
  { id: "landingMaster", icon: "🌐", title: "Лицо проекта", description: "Полностью заверши лендинг.", category: "Проекты", rarity: "Редкое", xpReward: 25, check: s => allProjectTasksComplete(s, "landing") },
  { id: "todoMaster", icon: "📋", title: "Мастер продуктивности", description: "Полностью заверши менеджер задач.", category: "Проекты", rarity: "Эпическое", xpReward: 35, check: s => allProjectTasksComplete(s, "todo") },
  { id: "calculatorMaster", icon: "➗", title: "Повелитель чисел", description: "Полностью заверши калькулятор.", category: "Проекты", rarity: "Эпическое", xpReward: 35, check: s => allProjectTasksComplete(s, "calculator") },
  { id: "multitask", icon: "🧩", title: "Многозадачность", description: "Начни выполнять задания во всех проектах.", category: "Проекты", rarity: "Редкое", xpReward: 20, check: s => hasTaskInEveryProject(s) },

  // ОПЫТ
  { id: "xp50", icon: "✨", title: "Первые 50 XP", description: "Накопи 50 очков опыта.", category: "Опыт", rarity: "Обычное", xpReward: 10, check: s => s.xp >= 50 },
  { id: "xp100", icon: "💫", title: "Сотня опыта", description: "Накопи 100 XP.", category: "Опыт", rarity: "Обычное", xpReward: 15, check: s => s.xp >= 100 },
  { id: "xp200", icon: "⚡", title: "Вторая скорость", description: "Накопи 200 XP.", category: "Опыт", rarity: "Редкое", xpReward: 20, check: s => s.xp >= 200 },
  { id: "xp300", icon: "🔥", title: "Триста причин продолжать", description: "Накопи 300 XP.", category: "Опыт", rarity: "Редкое", xpReward: 25, check: s => s.xp >= 300 },
  { id: "xp500", icon: "💎", title: "Пятьсот XP", description: "Накопи 500 XP.", category: "Опыт", rarity: "Эпическое", xpReward: 35, check: s => s.xp >= 500 },
  { id: "xp1000", icon: "👑", title: "Тысячник", description: "Накопи 1000 XP.", category: "Опыт", rarity: "Легендарное", xpReward: 50, check: s => s.xp >= 1000 },

  // МАСТЕРСТВО
  { id: "halfway", icon: "🚩", title: "Половина пути", description: "Выполни не менее половины всех заданий.", category: "Мастерство", rarity: "Редкое", xpReward: 25, check: s => getCompletedTaskRecords(s).length >= Math.ceil(totalTaskCount() / 2) },
  { id: "almostThere", icon: "🥇", title: "Почти профессионал", description: "Выполни не менее 75% всех заданий.", category: "Мастерство", rarity: "Эпическое", xpReward: 40, check: s => getCompletedTaskRecords(s).length >= Math.ceil(totalTaskCount() * 0.75) },
  { id: "alltasks", icon: "💠", title: "Идеальное прохождение", description: "Выполни все задания всех проектов.", category: "Мастерство", rarity: "Легендарное", xpReward: 100, check: s => PROJECTS.every(p => allProjectTasksComplete(s, p.id)) },
  { id: "threeLanguages", icon: "🌈", title: "Три языка", description: "Выполни задания по HTML, CSS и JavaScript.", category: "Мастерство", rarity: "Редкое", xpReward: 25, check: s => FILES.every(file => countTasksByFile(s, file) >= 1) },
  { id: "editorExplorer", icon: "🧪", title: "Исследователь редактора", description: "Измени код минимум в двух проектах.", category: "Мастерство", rarity: "Редкое", xpReward: 20, check: s => PROJECTS.filter(p => draftChanged(s, p)).length >= 2 },
  { id: "allRounder", icon: "🌟", title: "Универсальный разработчик", description: "Заверши все проекты и все уроки.", category: "Мастерство", rarity: "Легендарное", xpReward: 100, check: s => getCompletedProjectCount(s) >= PROJECTS.length && s.completedLessons.length >= CL_LESSONS.length }
];

const RARITY_CLASS = {
  "Обычное": "",
  "Редкое": "rarity-rare",
  "Эпическое": "rarity-epic",
  "Легендарное": "rarity-legendary"
};
