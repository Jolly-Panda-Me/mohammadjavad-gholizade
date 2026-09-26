/**
 * projects.js
 * Loads data/projects.json and renders a JSON-driven, filterable project grid.
 */

const PROJECTS = (() => {
  let projects = [];
  let activeFilter = "all";

  async function load() {
    const res = await fetch("data/projects.json");
    if (!res.ok) throw new Error("Failed to load projects.json");
    const json = await res.json();
    projects = json.projects || [];
    return projects;
  }

  function collectCategories() {
    const map = new Map();
    projects.forEach((p) => (p.category || []).forEach((c) => map.set(c.id, c)));
    return Array.from(map.values());
  }

  function renderFilters() {
    const wrap = document.getElementById("project-filters");
    if (!wrap) return;
    wrap.setAttribute("aria-label", I18N.get("projectsSection.filterGroupLabel", "Filter projects"));
    const cats = collectCategories();
    if (cats.length <= 1) {
      wrap.innerHTML = "";
      wrap.style.display = "none";
      return;
    }
    wrap.style.display = "";
    const lang = I18N.getLang();
    const allLabel = I18N.get("projectsSection.filterAll", "All");
    const buttons = [`<button data-filter="all" class="${activeFilter === "all" ? "is-active" : ""}">${allLabel}</button>`]
      .concat(
        cats.map(
          (c) =>
            `<button data-filter="${I18N.escapeHtml(c.id)}" class="${activeFilter === c.id ? "is-active" : ""}">${I18N.escapeHtml(c[lang] || c.en)}</button>`
        )
      );
    wrap.innerHTML = buttons.join("");
    wrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter");
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const wrap = document.getElementById("project-grid");
    if (!wrap) return;
    const lang = I18N.getLang();
    const fallbackAlt = I18N.get("projectsSection.imageAltFallback", "Project artwork placeholder");
    const viewLabel = I18N.get("projectsSection.viewProject", "View project");

    const visible = projects.filter(
      (p) => activeFilter === "all" || (p.category || []).some((c) => c.id === activeFilter)
    );

    wrap.innerHTML = visible
      .map((p) => {
        const title = p.title[lang] || p.title.en;
        const client = p.client ? p.client[lang] || p.client.en : "";
        const desc = p.description[lang] || p.description.en;
        const catLabels = (p.category || []).map((c) => c[lang] || c.en);
        const techLabels = (p.technologies || []).map((t) => t[lang] || t.en);
        const tags = [...catLabels, ...techLabels].filter(Boolean);
        const links = (p.links || []).filter((l) => l.url);

        return `
        <article class="project-card reveal">
          <div class="project-card__media">
            <img
              src="${p.image}"
              alt="${I18N.escapeHtml(title)}"
              loading="lazy"
              width="480" height="360"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
            >
            <div class="media-fallback" style="display:none;">${I18N.escapeHtml(fallbackAlt)}</div>
          </div>
          <div class="project-card__body">
            ${client ? `<span class="project-card__client">${I18N.escapeHtml(client)}</span>` : ""}
            <h3 class="project-card__title">${I18N.escapeHtml(title)}</h3>
            ${desc ? `<p class="project-card__desc">${I18N.escapeHtml(desc)}</p>` : ""}
            <div class="project-card__tags">${tags.map((t) => `<span>${I18N.escapeHtml(t)}</span>`).join("")}</div>
            ${
              links.length
                ? `<div class="project-card__links">${links
                    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${I18N.escapeHtml(l.label)}</a>`)
                    .join("")}</div>`
                : p.url
                ? `<div class="project-card__links"><a href="${p.url}" target="_blank" rel="noopener">${I18N.escapeHtml(viewLabel)}</a></div>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");

    if (window.ScrollReveal) window.ScrollReveal.observeAll();
  }

  function render() {
    renderFilters();
    renderGrid();
  }

  return { load, render };
})();
