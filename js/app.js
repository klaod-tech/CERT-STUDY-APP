import { ensureSession } from "./auth.js";
import { initSidebar } from "./sidebar.js";
import { initPanel, setCategory, renderPanel, getCurrentTab } from "./panel.js";
import { renderNoteEditor } from "./note.js";
import { renderConceptEditor } from "./concept.js";
import { renderQuizCreator, renderQuizViewer } from "./quiz.js";

const app = document.getElementById("app");
const boardContent = document.getElementById("board-content");

let currentCategory = null;

async function boot() {
  try {
    await ensureSession();
  } catch (err) {
    app.hidden = false;
    app.innerHTML = `<p style="padding:24px;">Supabase 연결에 실패했습니다. js/supabase.js의 URL/anon key를 확인하세요.<br>${err.message}</p>`;
    return;
  }
  app.hidden = false;
  initSidebar(onCategorySelect);
  initPanel(onItemSelect);
}

function onCategorySelect(category) {
  currentCategory = category;
  boardContent.innerHTML = "";
  setCategory(category);
}

function onItemSelect(tab, item) {
  if (!currentCategory) return;
  if (tab === "notes") {
    renderNoteEditor(boardContent, item, currentCategory.id, () => renderPanel());
  } else if (tab === "concepts") {
    renderConceptEditor(boardContent, item, currentCategory.id, () => renderPanel());
  } else if (tab === "quizzes") {
    renderQuizViewer(boardContent, item, () => renderPanel());
  }
}

document.getElementById("add-item-btn").addEventListener("click", () => {
  if (!currentCategory) {
    alert("먼저 자격증을 선택하세요.");
    return;
  }
  const tab = getCurrentTab();
  boardContent.innerHTML = "";
  if (tab === "notes") {
    renderNoteEditor(boardContent, null, currentCategory.id, () => renderPanel());
  } else if (tab === "concepts") {
    renderConceptEditor(boardContent, null, currentCategory.id, () => renderPanel());
  } else if (tab === "quizzes") {
    renderQuizCreator(boardContent, currentCategory.id, () => renderPanel());
  }
});

boot();
