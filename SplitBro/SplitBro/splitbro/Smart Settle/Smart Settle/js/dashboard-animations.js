/* ============================================
   Dashboard Animations — pure enhancement layer
   Does not read/write app state. Only observes DOM
   changes that dashboard.js already makes, and adds
   motion on top. Safe to remove without breaking
   any existing functionality.
   ============================================ */
(function () {
  "use strict";

  /* ----------------------------------------------
     1. Count-up animation for number displays
     Watches an element for text changes (made by
     dashboard.js) and animates from the previous
     shown value to the new one instead of snapping.
     ---------------------------------------------- */
  function animateNumberElement(el, { decimals = 2 } = {}) {
    if (!el) return;

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

      const duration = 700;
      const startTime = performance.now();

      function step(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        const value = startVal + (target - startVal) * eased;
        el.textContent = prefix + formatNumber(value, decimals) + suffix;

        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          el.textContent = raw; // land exactly on the real string
          currentShown = target;
          observer.observe(el, { childList: true, characterData: true, subtree: true });
        }
      }
      rafId = requestAnimationFrame(step);
    });

    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

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

  function initCountUpNumbers() {
    animateNumberElement(document.getElementById("overviewTotal"), { decimals: 2 });
    animateNumberElement(document.getElementById("overviewPaid"), { decimals: 2 });
    animateNumberElement(document.getElementById("overviewBalance"), { decimals: 2 });
    animateNumberElement(document.getElementById("totalExpenses"), { decimals: 2 });
    animateNumberElement(document.getElementById("dashboardMemberCount"), { decimals: 0 });
    animateNumberElement(document.getElementById("expenseCount"), { decimals: 0 });
  }

  /* ----------------------------------------------
     2. Scroll-reveal for static section cards
     ---------------------------------------------- */
  function initScrollReveal() {
    const selectors = [
      ".overview-card",
      ".current-group-card",
      ".dashboard-grid .glass-card",
      ".quick-card",
      ".step-card",
      ".dashboard-cta"
    ];
    const els = document.querySelectorAll(selectors.join(","));
    els.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("in-view"), (i % 3) * 90);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------
     3. Staggered entrance for dynamically-rendered
     list items (members, expenses) — watches the
     container dashboard.js populates and animates
     each new row in as it's added.
     ---------------------------------------------- */
  function initListStagger(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function animateNewChildren(nodes) {
      nodes.forEach((node, i) => {
        if (node.nodeType !== 1) return;
        node.classList.add("list-item-enter");
        setTimeout(() => {
          node.classList.add("list-item-in");
        }, 30 + i * 60);
      });
    }

    // Animate anything already present at script-run time
    animateNewChildren(Array.from(container.children));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.addedNodes.length) {
          animateNewChildren(Array.from(m.addedNodes));
        }
      });
    });
    observer.observe(container, { childList: true });
  }

  /* ----------------------------------------------
     4. Proportional balance bars under each member row.
     Reads the rendered .member-balance text (already
     written by dashboard.js) and draws a bar showing
     relative magnitude — purely visual, no state.
     ---------------------------------------------- */
  function initMemberBalanceBars() {
    const container = document.getElementById("dashboardMembers");
    if (!container) return;

    function applyBars() {
      const rows = Array.from(container.querySelectorAll(".dashboard-member"));
      if (rows.length === 0) return;

      const magnitudes = rows.map((row) => {
        const balEl = row.querySelector(".member-balance");
        if (!balEl) return 0;
        const n = extractNumber(balEl.textContent);
        return n === null ? 0 : Math.abs(n);
      });
      const max = Math.max(...magnitudes, 1);

      rows.forEach((row, i) => {
        if (row.querySelector(".member-balance-bar-track")) return; // already added
        const balEl = row.querySelector(".member-balance");
        if (!balEl) return;

        const isNegative = balEl.classList.contains("negative-member-balance");
        const pct = Math.round((magnitudes[i] / max) * 100);

        const track = document.createElement("div");
        track.className = "member-balance-bar-track";
        const fill = document.createElement("div");
        fill.className = "member-balance-bar-fill" + (isNegative ? " negative" : " positive");
        track.appendChild(fill);
        row.appendChild(track);

        // animate width in on next frame so the transition actually plays
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            fill.style.width = pct + "%";
          });
        });
      });
    }

    applyBars();
    const observer = new MutationObserver(applyBars);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
  }

  /* ----------------------------------------------
     Init once DOM is ready
     ---------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initCountUpNumbers();
    initScrollReveal();
    initListStagger("dashboardMembers");
    initListStagger("recentExpenses");
    initMemberBalanceBars();
  });
})();
