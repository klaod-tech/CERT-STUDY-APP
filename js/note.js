import { saveNote } from "./store.js";
import { escapeHtml } from "./utils.js";

let debounceTimer = null;

export function renderNoteEditor(container, note, categoryId, onSaved) {
  container.innerHTML = `
    <input type="text" id="note-title" class="editor-title" placeholder="제목" value="${escapeHtml(note?.title ?? "")}" />
    <textarea id="note-content" class="editor-content">${escapeHtml(note?.content ?? "")}</textarea>
  `;

  const state = { id: note?.id, category_id: categoryId };

  const trigger = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      state.title = document.getElementById("note-title").value;
      state.content = document.getElementById("note-content").value;
      const saved = await saveNote(state);
      state.id = saved.id;
      onSaved && onSaved(saved);
    }, 500);
  };

  document.getElementById("note-title").addEventListener("input", trigger);
  document.getElementById("note-content").addEventListener("input", trigger);
}
