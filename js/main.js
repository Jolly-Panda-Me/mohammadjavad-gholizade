/**
 * main.js
 * Boots the page: loads JSON data, renders all sections, wires up interactions.
 */

(async function init() {
  try {
    await I18N.load();
    await PROJECTS.load();
  } catch (err) {
    console.error("Failed to load site data:", err);
    return;
  }

  I18N.applyStatic();
  PROJECTS.render();

  markStaticReveals();
  ScrollReveal.init();

  setupNav();
  setupLangSwitch();
  setupBackToTop();
  setupActiveNavHighlight();

  I18N.onChange(() => {
    PROJECTS.render();
    markStaticReveals();
    ScrollReveal.observeAll();
  });
})();

function markStaticReveals() {
  document
    .querySelectorAll(".section__head, .about__text, .about__highlights, .contact__links, .contact h2, .contact__subtext")
    .forEach((el) => el.classList.add("reveal"));
  if (window.ScrollReveal) ScrollReveal.observeAll();
}

function setupNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

function setupLangSwitch() {
  const btn = document.getElementById("lang-switch");
  btn.addEventListener("click", () => I18N.toggle());
}

function setupBackToTop() {
  const btn = document.getElementById("back-to-top");
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 480),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupActiveNavHighlight() {
  const links = Array.from(document.querySelectorAll(".nav__menu a"));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || !sections.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = "#" + entry.target.id;
        const link = links.find((a) => a.getAttribute("href") === id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((s) => obs.observe(s));
}
