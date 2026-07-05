import { getCategories, addCategory } from "./store.js";

export async function renderSidebar(onSelect) {
  const list = document.getElementById("category-list");
  const categories = await getCategories();
  list.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = cat.name;
    li.dataset.id = cat.id;
    li.addEventListener("click", () => {
      document.querySelectorAll("#category-list li").forEach((el) => el.classList.remove("selected"));
      li.classList.add("selected");
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
