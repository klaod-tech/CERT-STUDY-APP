import { getCategories, addCategory, updateCategory } from "./store.js";

let selectedCategoryId = null;

export async function renderSidebar(onSelect) {
  const list = document.getElementById("category-list");
  const categories = await getCategories();
  list.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.dataset.id = cat.id;
    if (cat.id === selectedCategoryId) li.classList.add("selected");

    const nameSpan = document.createElement("span");
    nameSpan.className = "category-name";
    nameSpan.textContent = cat.name;
    li.appendChild(nameSpan);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";
    editBtn.title = "이름 수정";
    editBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const name = prompt("자격증 이름 수정", cat.name);
      if (!name || name === cat.name) return;
      await updateCategory(cat.id, name);
      await renderSidebar(onSelect);
    });
    li.appendChild(editBtn);

    li.addEventListener("click", () => {
      document.querySelectorAll("#category-list li").forEach((el) => el.classList.remove("selected"));
      li.classList.add("selected");
      selectedCategoryId = cat.id;
      onSelect(cat);
    });
    list.appendChild(li);
  });
}

export function initSidebar(onSelect) {
  document.getElementById("add-category-btn").addEventListener("click", async () => {
    const name = prompt("자격증 이름");
    if (!name) return;
    await addCategory(name);
    await renderSidebar(onSelect);
  });

  document.getElementById("collapse-toggle").addEventListener("click", () => {
    document.getElementById("app").classList.toggle("collapsed");
  });

  renderSidebar(onSelect);
}
