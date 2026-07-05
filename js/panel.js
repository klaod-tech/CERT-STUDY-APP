import { getNotes, getConcepts, getQuizzes } from "./store.js";

const fetchers = {
  notes: getNotes,
  concepts: getConcepts,
  quizzes: getQuizzes,
};

let currentTab = "notes";
let currentCategoryId = null;
let itemSelectHandler = null;

export function initPanel(onItemSelect) {
  itemSelectHandler = onItemSelect;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      renderPanel();
    });
  });
}

export function setCategory(category) {
  currentCategoryId = category.id;
  renderPanel();
}

export function getCurrentTab() {
  return currentTab;
}

export function getCurrentCategoryId() {
  return currentCategoryId;
}

export async function renderPanel() {
  if (!currentCategoryId) return;
  const items = await fetchers[currentTab](currentCategoryId);

  document.getElementById("progress-count").textContent = `${labelOf(currentTab)} ${items.length}번 진행`;

  const list = document.getElementById("item-list");
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.title || "(제목 없음)";
    li.addEventListener("click", () => itemSelectHandler && itemSelectHandler(currentTab, item));
    list.appendChild(li);
  });
}

function labelOf(tab) {
  return { notes: "필기", concepts: "핵심개념", quizzes: "문제풀이" }[tab];
}
