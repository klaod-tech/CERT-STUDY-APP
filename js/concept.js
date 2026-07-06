import { saveConcept } from "./store.js";
import { escapeHtml } from "./utils.js";

let debounceTimer = null;

export function renderConceptEditor(container, concept, categoryId, onSaved) {
  const state = {
    id: concept?.id,
    category_id: categoryId,
    title: concept?.title ?? "",
    items: concept?.items?.length ? concept.items.map((i) => ({ ...i })) : [{ term: "", meaning: "" }],
  };

  render();

  function render() {
    container.innerHTML = `
      <input type="text" id="concept-title" class="editor-title" placeholder="제목" spellcheck="false" value="${escapeHtml(state.title)}" />
      <div id="concept-rows"></div>
      <button type="button" id="add-row-btn">+ 행 추가</button>
    `;

    const rows = document.getElementById("concept-rows");
    state.items.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "concept-row";
      row.innerHTML = `
        <input type="text" class="term-input" placeholder="단어" spellcheck="false" value="${escapeHtml(item.term)}" data-i="${i}" />
        <input type="text" class="meaning-input" placeholder="뜻" spellcheck="false" value="${escapeHtml(item.meaning)}" data-i="${i}" />
        <button type="button" class="remove-row-btn" data-i="${i}">×</button>
      `;
      rows.appendChild(row);
    });

    document.getElementById("concept-title").addEventListener("input", (e) => {
      state.title = e.target.value;
      triggerSave();
    });
    rows.querySelectorAll(".term-input").forEach((el) =>
      el.addEventListener("input", (e) => {
        state.items[+e.target.dataset.i].term = e.target.value;
        triggerSave();
      })
    );
    rows.querySelectorAll(".meaning-input").forEach((el) =>
      el.addEventListener("input", (e) => {
        state.items[+e.target.dataset.i].meaning = e.target.value;
        triggerSave();
      })
    );
    rows.querySelectorAll(".remove-row-btn").forEach((el) =>
      el.addEventListener("click", (e) => {
        state.items.splice(+e.target.dataset.i, 1);
        if (state.items.length === 0) state.items.push({ term: "", meaning: "" });
        render();
        triggerSave();
      })
    );
    document.getElementById("add-row-btn").addEventListener("click", () => {
      state.items.push({ term: "", meaning: "" });
      render();
    });
  }

  function triggerSave() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const saved = await saveConcept({
        id: state.id,
        category_id: state.category_id,
        title: state.title,
        items: state.items,
      });
      state.id = saved.id;
      onSaved && onSaved(saved);
    }, 500);
  }
}
