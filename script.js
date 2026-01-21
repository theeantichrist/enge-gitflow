const STORAGE_KEY = "interactive_list_v1";
const THEME_KEY = "interactive_theme_v1";
const ACCENT_KEY = "interactive_accent_v1";

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const newItemEl = document.getElementById("newItem");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");
const accentEl = document.getElementById("accent");

const clockEl = document.getElementById("clock");
const yearEl = document.getElementById("year");

let items = loadItems();
let filter = "";

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function setAccent(h) {
  document.documentElement.style.setProperty("--accent", `hsl(${h} 90% 55%)`);
  localStorage.setItem(ACCENT_KEY, String(h));
}

function setTheme(isLight) {
  document.body.classList.toggle("light", isLight);
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  themeBtn.textContent = isLight ? "☀️ Thema" : "🌙 Thema";
}

function render() {
  const visible = items.filter(i =>
    i.text.toLowerCase().includes(filter.toLowerCase())
  );

  listEl.innerHTML = "";

  if (visible.length === 0) {
    emptyEl.style.display = "block";
  } else {
    emptyEl.style.display = "none";
  }

  for (const item of visible) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.gap = "10px";
    left.style.alignItems = "center";

    const badge = document.createElement("div");
    badge.className = "badge";

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = item.text;

    left.appendChild(badge);
    left.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "actions";

    const up = document.createElement("button");
    up.className = "iconBtn";
    up.type = "button";
    up.textContent = "⬆️";
    up.title = "Omhoog";
    up.addEventListener("click", () => moveItem(item.id, -1));

    const down = document.createElement("button");
    down.className = "iconBtn";
    down.type = "button";
    down.textContent = "⬇️";
    down.title = "Omlaag";
    down.addEventListener("click", () => moveItem(item.id, +1));

    const del = document.createElement("button");
    del.className = "iconBtn";
    del.type = "button";
    del.textContent = "🗑️";
    del.title = "Verwijderen";
    del.addEventListener("click", () => deleteItem(item.id));

    actions.appendChild(up);
    actions.appendChild(down);
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    listEl.appendChild(li);
  }
}

function addItem(text) {
  const clean = text.trim();
  if (!clean) return;

  items.unshift({ id: uid(), text: clean });
  saveItems();
  render();
}

function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  saveItems();
  render();
}

function moveItem(id, dir) {
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;

  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= items.length) return;

  const copy = [...items];
  const [picked] = copy.splice(idx, 1);
  copy.splice(newIdx, 0, picked);

  items = copy;
  saveItems();
  render();
}


addBtn.addEventListener("click", () => {
  addItem(newItemEl.value);
  newItemEl.value = "";
  newItemEl.focus();
});

newItemEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // geen form submit
    addItem(newItemEl.value);
    newItemEl.value = "";
  }
});

searchEl.addEventListener("input", (e) => {
  filter = e.target.value;
  render();
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Weet je zeker dat je alles wil wissen?")) return;
  items = [];
  saveItems();
  render();
});

themeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(!isLight);
});

accentEl.addEventListener("input", (e) => {
  setAccent(e.target.value);
});


function tick() {
  const now = new Date();
  const t = now.toLocaleTimeString("nl-NL");
  clockEl.textContent = t;
}
setInterval(tick, 1000);
tick();

yearEl.textContent = new Date().getFullYear();


const savedTheme = localStorage.getItem(THEME_KEY);
setTheme(savedTheme === "light");

const savedAccent = localStorage.getItem(ACCENT_KEY);
if (savedAccent) {
  accentEl.value = savedAccent;
  setAccent(savedAccent);
} else {
  setAccent(accentEl.value);
}

render();
