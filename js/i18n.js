/**
 * i18n.js
 * Loads data/site.json and handles bilingual (EN/FA) rendering.
 * No backend — language preference persists via localStorage.
 */

const I18N = (() => {
  const STORAGE_KEY = "mjg-lang";
  const DEFAULT_LANG = "en";

  let data = null;
  let lang = DEFAULT_LANG;
  const listeners = [];

  function detectInitialLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fa") return saved;
    } catch (e) { /* localStorage unavailable — fall back silently */ }
    return DEFAULT_LANG;
  }

  function get(path, fallback = "") {
    if (!data) return fallback;
    const parts = path.split(".");
    let node = data;
    for (const p of parts) {
      if (node == null) return fallback;
      node = node[p];
    }
    if (node == null) return fallback;
    if (typeof node === "object" && (lang in node)) return node[lang];
    return node;
  }

  async function load() {
    const res = await fetch("data/site.json");
    if (!res.ok) throw new Error("Failed to load site.json");
    data = await res.json();
    lang = detectInitialLang();
    applyDocumentDirection();
    return data;
  }

  function applyDocumentDirection() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }

  function applyStatic() {
    document.querySelectorAll("[data-i18n-text]").forEach((el) => {
      const key = el.getAttribute("data-i18n-text");
      const val = get(key, null);
      if (val === null) return;
      el.textContent = val;
      el.style.display = val === "" ? "none" : "";
    });

    document.title = get("meta.title") || `${get("hero.name")} — ${get("hero.eyebrow")}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", get("meta.description"));

    const heroName = document.getElementById("hero-name");
    if (heroName) heroName.textContent = lang === "fa" ? get("hero.nameFa") : get("hero.name");

    const aboutPhoto = document.getElementById("about-photo");
    if (aboutPhoto) aboutPhoto.setAttribute("alt", lang === "fa" ? get("hero.nameFa") : get("hero.name"));

    const footerName = document.getElementById("footer-name");
    if (footerName) footerName.textContent = lang === "fa" ? get("hero.nameFa") : get("hero.name");

    const langLabel = document.getElementById("lang-switch-label");
    if (langLabel) langLabel.textContent = get("ui.langSwitch");

    const navToggle = document.getElementById("nav-toggle");
    if (navToggle) navToggle.setAttribute("aria-label", get("ui.menuOpen"));

    const navEl = document.querySelector(".nav");
    if (navEl) navEl.setAttribute("aria-label", get("ui.navLabel"));

    const navLinkedin = document.getElementById("nav-linkedin");
    if (navLinkedin) {
      const url = get("contact.linkedin");
      if (url) {
        navLinkedin.style.display = "";
        navLinkedin.setAttribute("href", url);
        navLinkedin.setAttribute("aria-label", get("contact.linkedinLabel"));
      } else {
        navLinkedin.style.display = "none";
      }
    }

    const madeByLink = document.getElementById("footer-madeby-link");
    if (madeByLink) {
      madeByLink.textContent = get("footer.madeByName");
      madeByLink.setAttribute("href", get("footer.madeByUrl"));
    }

    const backToTop = document.getElementById("back-to-top");
    if (backToTop) backToTop.setAttribute("aria-label", get("ui.backToTop"));

    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    renderAbout();
    renderTimeline();
    renderSkills();
    renderEducation();
    renderAwards();
    renderContact();
  }

  function renderAbout() {
    const wrap = document.getElementById("about-paragraphs");
    const hi = document.getElementById("about-highlights");
    if (!wrap || !hi) return;
    const paragraphs = data.about.paragraphs || [];
    wrap.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p[lang])}</p>`).join("");
    hi.innerHTML = (data.about.highlights || [])
      .map(
        (h) => `<li><span class="h-label">${escapeHtml(h.label[lang])}</span><span class="h-value">${escapeHtml(h.value[lang])}</span></li>`
      )
      .join("");
  }

  function renderTimeline() {
    const wrap = document.getElementById("experience-timeline");
    if (!wrap) return;
    const items = data.experience.items || [];
    wrap.innerHTML = items
      .map((it) => {
        const desc = it.description ? it.description[lang] : "";
        const location = it.location ? it.location[lang] : "";
        return `
      <div class="timeline-item reveal" data-stage="${it.stage || ""}">
        <div class="timeline-item__meta">
          <span class="timeline-item__role">${escapeHtml(it.role[lang])}</span>
          <span class="timeline-item__company">${escapeHtml(it.company[lang])}</span>
          <span class="timeline-item__dates">${escapeHtml(it.dates[lang])}</span>
        </div>
        ${location ? `<div class="timeline-item__location">${escapeHtml(location)}</div>` : ""}
        ${desc ? `<p class="timeline-item__desc">${escapeHtml(desc)}</p>` : ""}
        <ul class="timeline-item__resp">
          ${(it.responsibilities || []).map((r) => `<li>${escapeHtml(r[lang])}</li>`).join("")}
        </ul>
      </div>`;
      })
      .join("");
  }

  function renderSkills() {
    const wrap = document.getElementById("skills-grid");
    if (!wrap) return;
    const categories = data.skills.categories || [];
    wrap.innerHTML = categories
      .map(
        (cat) => `
      <div class="skill-card reveal">
        <h3>${escapeHtml(cat.name[lang])}</h3>
        <ul>${(cat.items || [])
          .map(
            (i) => `<li class="skill-pill"><span>${escapeHtml(i[lang])}</span>${
              i.level ? `<span class="skill-pill__level">${escapeHtml(i.level[lang])}</span>` : ""
            }</li>`
          )
          .join("")}</ul>
      </div>`
      )
      .join("");
  }

  function renderEducation() {
    const wrap = document.getElementById("education-list");
    if (!wrap) return;
    const items = data.education.items || [];
    wrap.innerHTML = items
      .map((it) => {
        const dates = it.dates ? it.dates[lang] : "";
        const desc = it.description ? it.description[lang] : "";
        return `
      <div class="education-item reveal">
        <div class="education-item__main">
          <div class="degree">${escapeHtml(it.degree[lang])}</div>
          <div class="institution">${escapeHtml(it.institution[lang])}</div>
          ${desc ? `<div class="desc">${escapeHtml(desc)}</div>` : ""}
        </div>
        ${dates ? `<div class="education-item__dates">${escapeHtml(dates)}</div>` : ""}
      </div>`;
      })
      .join("");
  }

  function renderAwards() {
    const wrap = document.getElementById("awards-list");
    if (!wrap || !data.awards) return;
    const items = data.awards.items || [];
    wrap.innerHTML = items
      .map((it) => {
        const title = escapeHtml(it.title[lang]);
        const titleHtml = it.url
          ? `<a class="award-item__title" href="${it.url}" target="_blank" rel="noopener">${title}</a>`
          : `<span class="award-item__title">${title}</span>`;
        return `
      <div class="award-item reveal">
        ${titleHtml}
        <span class="award-item__year">${escapeHtml(it.year)}</span>
      </div>`;
      })
      .join("");
  }

  const ICONS = {
    email:
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13zm2.2.5 7.8 6.2L19.8 6H4.2zM20 8.3l-7.4 5.9a1 1 0 0 1-1.2 0L4 8.3V18h16V8.3z"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1.1L6.6 10.8z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5.001zM.5 8.98h4.96V23H.5V8.98zM8.34 8.98h4.76v1.92h.07c.66-1.25 2.28-2.57 4.7-2.57 5.03 0 5.96 3.31 5.96 7.62V23h-4.96v-6.24c0-1.49-.03-3.4-2.07-3.4-2.08 0-2.4 1.62-2.4 3.29V23H8.34V8.98z"/></svg>',
    website:
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 8h-3.05a15.7 15.7 0 0 0-1.2-5.32A8.03 8.03 0 0 1 18.9 10zM12 4.06c.9 1.2 1.7 3.15 1.98 5.94h-3.96c.28-2.79 1.08-4.74 1.98-5.94zM4.26 12h3.79c.07 1.6.32 3.1.72 4.4A8.02 8.02 0 0 1 4.26 12zm0-2a8.02 8.02 0 0 1 4.51-6.4c-.4 1.3-.65 2.8-.72 4.4H4.26zm5.76 0c.07-1.94.34-3.66.74-5.02A7.98 7.98 0 0 0 8.6 10h1.42zm0 2H8.6a7.98 7.98 0 0 0 2.16 5.02c-.4-1.36-.67-3.08-.74-5.02zm2 5.94c-.9-1.2-1.7-3.15-1.98-5.94h3.96c-.28 2.79-1.08 4.74-1.98 5.94zM15.35 16.4c.4-1.3.65-2.8.72-4.4h3.79a8.02 8.02 0 0 1-4.51 6.4h1.2-1.2c.4-1.3.65-2.8.72-4.4h-.72z"/></svg>',
  };

  function renderContact() {
    const wrap = document.getElementById("contact-links");
    if (!wrap) return;
    const c = data.contact;
    const links = [];
    links.push(
      `<a href="mailto:${c.email}" title="${escapeHtml(c.emailLabel[lang])}: ${c.email}" aria-label="${escapeHtml(c.emailLabel[lang])}: ${c.email}">${ICONS.email}</a>`
    );
    if (c.phone) {
      links.push(
        `<a href="tel:${c.phone.replace(/\s+/g, "")}" title="${escapeHtml(c.phoneLabel[lang])}: ${c.phone}" aria-label="${escapeHtml(c.phoneLabel[lang])}: ${c.phone}">${ICONS.phone}</a>`
      );
    }
    if (c.phoneSecondary) {
      links.push(
        `<a href="tel:${c.phoneSecondary.replace(/\s+/g, "")}" title="${escapeHtml(c.phoneLabel[lang])}: ${c.phoneSecondary}" aria-label="${escapeHtml(c.phoneLabel[lang])}: ${c.phoneSecondary}">${ICONS.phone}</a>`
      );
    }
    if (c.linkedin) {
      links.push(
        `<a href="${c.linkedin}" target="_blank" rel="noopener" title="${escapeHtml(c.linkedinLabel[lang])}" aria-label="${escapeHtml(c.linkedinLabel[lang])}">${ICONS.linkedin}</a>`
      );
    }
    if (c.website) {
      links.push(
        `<a href="${c.website}" target="_blank" rel="noopener" title="${escapeHtml(c.websiteLabel[lang])}" aria-label="${escapeHtml(c.websiteLabel[lang])}">${ICONS.website}</a>`
      );
    }
    wrap.innerHTML = links.join("");
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function setLang(next) {
    if (next !== "en" && next !== "fa") return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    applyDocumentDirection();
    applyStatic();
    listeners.forEach((fn) => fn(lang));
  }

  function toggle() {
    setLang(lang === "en" ? "fa" : "en");
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return {
    load,
    applyStatic,
    setLang,
    toggle,
    onChange,
    get,
    getData: () => data,
    getLang: () => lang,
    escapeHtml,
  };
})();
