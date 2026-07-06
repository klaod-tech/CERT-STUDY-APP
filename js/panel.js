import { getNotes, getConcepts, getQuizzes, updateItemTitle } from "./store.js";

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

    const titleSpan = document.createElement("span");
    titleSpan.className = "item-title";
    titleSpan.textContent = item.title || "(제목 없음)";
    li.appendChild(titleSpan);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";
    editBtn.title = "제목 수정";
    editBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const title = prompt("제목 수정", item.title || "");
      if (!title || title === item.title) return;
      await updateItemTitle(currentTab, item.id, title);
      await renderPanel();
    });
    li.appendChild(editBtn);

    li.addEventListener("click", () => itemSelectHandler && itemSelectHandler(currentTab, item));
    list.appendChild(li);
  });
}

function labelOf(tab) {
  return { notes: "필기", concepts: "핵심개념", quizzes: "문제풀이" }[tab];
}
