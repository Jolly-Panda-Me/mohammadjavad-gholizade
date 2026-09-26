/**
 * animations.js
 * Scroll-triggered reveals (IntersectionObserver).
 * The hero platformer scene animates via pure CSS (animations.css) and
 * is disabled there under prefers-reduced-motion — no JS needed for it.
 */

const ScrollReveal = (() => {
  let observer = null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    if (reduced) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observeAll();
  }

  function observeAll() {
    if (reduced || !observer) return;
    document.querySelectorAll(".reveal:not(.is-visible), .reveal-stagger:not(.is-visible)").forEach((el) => {
      observer.observe(el);
    });
  }

  return { init, observeAll };
})();
