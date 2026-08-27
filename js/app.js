/* ========================================
   Life Dashboard — Main JavaScript
   Handles: Clock, Greeting, Timer, To-Do, Quick Links, Theme
   ======================================== */

// ===== DOM Elements =====
const greetingEl = document.getElementById('greeting-text');
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date-text');
const nameDisplay = document.getElementById('name-display');
const editNameBtn = document.getElementById('edit-name-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerStopBtn = document.getElementById('timer-stop');
const timerResetBtn = document.getElementById('timer-reset');

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const duplicateWarning = document.getElementById('duplicate-warning');

const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

// ===== Constants =====
const STORAGE_KEYS = {
  name: 'dashboard-name',
  theme: 'dashboard-theme',
  todos: 'dashboard-todos',
  links: 'dashboard-links',
};

const POMODORO_MINUTES = 25;


// ==========================================
// 1. CLOCK & GREETING
// ==========================================

function updateClock() {
  const now = new Date();

  // format time as HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = hours + ':' + minutes + ':' + seconds;

  // format date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);

  // greeting based on hour
  const hour = now.getHours();
  let greeting = 'Good Evening';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  }

  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  if (savedName) {
    greetingEl.textContent = greeting + ', ' + savedName + '!';
  } else {
    greetingEl.textContent = greeting + '!';
  }
}

// update every second
setInterval(updateClock, 1000);
updateClock();


// ==========================================
// 2. CUSTOM NAME (Challenge)
// ==========================================

function loadName() {
  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  if (savedName) {
    nameDisplay.textContent = '👤 ' + savedName;
  } else {
    nameDisplay.textContent = 'Set your name';
    nameDisplay.style.opacity = '0.5';
  }
}

function promptName() {
  const currentName = localStorage.getItem(STORAGE_KEYS.name) || '';
  const newName = prompt('Enter your name:', currentName);

  if (newName !== null && newName.trim() !== '') {
    localStorage.setItem(STORAGE_KEYS.name, newName.trim());
    nameDisplay.textContent = '👤 ' + newName.trim();
    nameDisplay.style.opacity = '1';
    updateClock(); // refresh greeting
  }
}

editNameBtn.addEventListener('click', promptName);
nameDisplay.addEventListener('click', promptName);
loadName();


// ==========================================
// 3. FOCUS TIMER (Pomodoro)
// ==========================================

let timerSeconds = POMODORO_MINUTES * 60;
let timerInterval = null;
let timerRunning = false;

function formatTimer(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return mins + ':' + secs;
}

function renderTimer() {
  timerDisplay.textContent = formatTimer(timerSeconds);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStartBtn.disabled = true;
  timerStopBtn.disabled = false;

  timerInterval = setInterval(function () {
    timerSeconds--;
    renderTimer();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerStartBtn.disabled = false;
      timerStopBtn.disabled = true;
      alert('⏰ Time is up! Take a break.');
      resetTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerStartBtn.disabled = false;
  timerStopBtn.disabled = true;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = POMODORO_MINUTES * 60;
  renderTimer();
  timerStartBtn.disabled = false;
  timerStopBtn.disabled = true;
}

timerStartBtn.addEventListener('click', startTimer);
timerStopBtn.addEventListener('click', stopTimer);
timerResetBtn.addEventListener('click', resetTimer);
renderTimer();


// ==========================================
// 4. TO-DO LIST
// ==========================================

let todos = [];

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEYS.todos);
  if (saved) {
    todos = JSON.parse(saved);
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
}

function isDuplicate(text) {
  return todos.some(function (todo) {
    return todo.text.toLowerCase() === text.toLowerCase();
  });
}

function renderTodos() {
  todoList.innerHTML = '';

  todos.forEach(function (todo, index) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

    // checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', function () {
      toggleTodo(index);
    });

    // text
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // action buttons
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      editTodo(index);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
      deleteTodo(index);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function addTodo(text) {
  // prevent duplicate (challenge)
  if (isDuplicate(text)) {
    duplicateWarning.hidden = false;
    setTimeout(function () {
      duplicateWarning.hidden = true;
    }, 2500);
    return;
  }

  duplicateWarning.hidden = true;
  todos.push({ text: text, completed: false });
  saveTodos();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderTodos();
}

function editTodo(index) {
  const newText = prompt('Edit task:', todos[index].text);
  if (newText !== null && newText.trim() !== '') {
    // check duplicate (but allow same text if it's the same task)
    const trimmed = newText.trim();
    const existsElsewhere = todos.some(function (todo, i) {
      return i !== index && todo.text.toLowerCase() === trimmed.toLowerCase();
    });

    if (existsElsewhere) {
      alert('⚠️ A task with that name already exists!');
      return;
    }

    todos[index].text = trimmed;
    saveTodos();
    renderTodos();
  }
}

function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text === '') return;
  addTodo(text);
  todoInput.value = '';
});

loadTodos();
renderTodos();


// ==========================================
// 5. QUICK LINKS
// ==========================================

let links = [];

function loadLinks() {
  const saved = localStorage.getItem(STORAGE_KEYS.links);
  if (saved) {
    links = JSON.parse(saved);
  }
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

function renderLinks() {
  linksContainer.innerHTML = '';

  links.forEach(function (link, index) {
    const item = document.createElement('div');
    item.className = 'link-item';

    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'link-remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', function () {
      removeLink(index);
    });

    item.appendChild(anchor);
    item.appendChild(removeBtn);
    linksContainer.appendChild(item);
  });
}

function addLink(name, url) {
  // add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  links.push({ name: name, url: url });
  saveLinks();
  renderLinks();
}

function removeLink(index) {
  links.splice(index, 1);
  saveLinks();
  renderLinks();
}

linkForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();
  if (name === '' || url === '') return;
  addLink(name, url);
  linkNameInput.value = '';
  linkUrlInput.value = '';
});

loadLinks();
renderLinks();


// ==========================================
// 6. THEME TOGGLE (Light / Dark Mode)
// ==========================================

function loadTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_KEYS.theme, 'light');
    themeIcon.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(STORAGE_KEYS.theme, 'dark');
    themeIcon.textContent = '☀️';
  }
}

themeToggle.addEventListener('click', toggleTheme);
loadTheme();
