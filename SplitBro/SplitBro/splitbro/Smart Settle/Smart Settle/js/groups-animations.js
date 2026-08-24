/* ============================================
   Groups Animations — pure enhancement layer
   Observes DOM only, never touches groups.js state.
   ============================================ */
(function () {
  "use strict";

  function extractNumber(text) {
    const cleaned = text.replace(/[^\d.\-]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }

  function formatNumber(value, decimals) {
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /* Generic count-up watcher, reusable across any element whose
     text content dynamically changes to a number. */
  function watchNumberElement(el, { decimals = 2 } = {}) {
    if (!el || el.dataset.countUpBound) return;
    el.dataset.countUpBound = "true";

    let lastRaw = el.textContent;
    let currentShown = extractNumber(el.textContent);
    let rafId = null;

    const observer = new MutationObserver(() => {
      const raw = el.textContent;
      if (raw === lastRaw) return;
      const target = extractNumber(raw);
      if (target === null) {
        lastRaw = raw;
        return;
      }
      const prefix = raw.match(/^[^\d\-]*/)?.[0] || "";
      const suffix = raw.match(/[^\d.,]*$/)?.[0] || "";
      const startVal = currentShown === null ? 0 : currentShown;

      lastRaw = raw;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();

      const duration = 650;
      const startTime = performance.now();
      function step(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = startVal + (target - startVal) * eased;
        el.textContent = prefix + formatNumber(value, decimals) + suffix;
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          el.textContent = raw;
          currentShown = target;
          observer.observe(el, { childList: true, characterData: true, subtree: true });
        }
      }
      rafId = requestAnimationFrame(step);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  /* ----------------------------------------------
     1. Group card entrance — staggered fade/slide in
     as groups.js renders cards into #groupsContainer
     ---------------------------------------------- */
  function initGroupCardEntrance() {
    const container = document.getElementById("groupsContainer");
    if (!container) return;

    function handleNewCards(nodes) {
      nodes.forEach((node, i) => {
        if (node.nodeType !== 1 || !node.classList.contains("group-card")) return;
        node.classList.add("card-enter");
        setTimeout(() => node.classList.add("card-enter-in"), 40 + i * 70);

        // Watch any .group-stat strong values inside this card for count-up
        node.querySelectorAll(".group-stat strong").forEach((el) => {
          const looksLikeCurrency = /[₹$]/.test(el.textContent);
          watchNumberElement(el, { decimals: looksLikeCurrency ? 2 : 0 });
        });
      });
    }

    handleNewCards(Array.from(container.children));
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.addedNodes.length) handleNewCards(Array.from(m.addedNodes));
      });
    });
    observer.observe(container, { childList: true });
  }

  /* ----------------------------------------------
     2. Copy-code button — visual pulse feedback only.
     Does not touch clipboard logic or button text/icon,
     so it can't conflict with whatever groups.js already
     does on click.
     ---------------------------------------------- */
  function initCopyFeedback() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-code-button");
      if (!btn) return;
      btn.classList.remove("copy-pulse");
      // force reflow so the animation can restart on repeated clicks
      void btn.offsetWidth;
      btn.classList.add("copy-pulse");
    });
  }

  /* ----------------------------------------------
     3. Selected-member rows (in Create/Edit Group
     modals) — stagger in as they're added.
     ---------------------------------------------- */
  function initSelectedMemberStagger(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function animate(nodes) {
      nodes.forEach((node, i) => {
        if (node.nodeType !== 1) return;
        node.classList.add("list-item-enter");
        setTimeout(() => node.classList.add("list-item-in"), 20 + i * 50);
      });
    }
    animate(Array.from(container.children));
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.addedNodes.length) animate(Array.from(m.addedNodes));
      });
    });
    observer.observe(container, { childList: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGroupCardEntrance();
    initCopyFeedback();
    initSelectedMemberStagger("selectedMembers");
    initSelectedMemberStagger("editSelectedMembers");
  });
})();
