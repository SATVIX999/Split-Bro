/* ============================================
   Expense Form Animations — pure enhancement layer.
   Adds a visual category icon picker that mirrors the
   real <select id="expenseCategory">, animates the split
   summary total, and staggers in split-member rows.
   Never reads/writes expense.js's own state — only
   the DOM elements it already controls.
   ============================================ */
(function () {
  "use strict";

  const CATEGORY_ICONS = {
    Food: "fa-utensils",
    Hotel: "fa-bed",
    Transport: "fa-car",
    Activities: "fa-masks-theater",
    Shopping: "fa-bag-shopping",
    Other: "fa-ellipsis"
  };

  /* ----------------------------------------------
     1. Visual category picker, two-way synced with
     the real <select>. Clicking an icon sets the
     select's value and dispatches a real "change"
     event so expense.js's own listeners still fire.
     ---------------------------------------------- */
  function initCategoryPicker() {
    const select = document.getElementById("expenseCategory");
    if (!select) return;

    const wrap = document.createElement("div");
    wrap.className = "category-picker";

    Array.from(select.options).forEach((opt) => {
      if (!opt.value) return; // skip the "Select category" placeholder
      const icon = CATEGORY_ICONS[opt.value] || "fa-tag";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-chip";
      btn.dataset.value = opt.value;
      btn.innerHTML = `<i class="fa-solid ${icon}"></i><span>${opt.value}</span>`;
      btn.addEventListener("click", () => {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncActiveChip();
      });
      wrap.appendChild(btn);
    });

    // Hide the original select visually (keep it in the DOM, fully functional,
    // and still reachable by keyboard/screen readers) so only the chips show.
    // IMPORTANT: insert the chip picker AFTER the whole .expense-input wrapper,
    // not after the <select> itself — otherwise the chips end up inside the
    // wrapper we're about to visually hide.
    const inputWrap = select.closest(".expense-input");
    const insertAfterEl = inputWrap || select;
    insertAfterEl.insertAdjacentElement("afterend", wrap);
    if (inputWrap) inputWrap.classList.add("visually-hidden-input");

    function syncActiveChip() {
      wrap.querySelectorAll(".category-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.value === select.value);
      });
    }

    // Keep the chips in sync if expense.js ever sets select.value itself
    select.addEventListener("change", syncActiveChip);
    syncActiveChip();
  }

  /* ----------------------------------------------
     2. Count-up for the "Your split" summary total,
     which updates live as the person fills the form.
     ---------------------------------------------- */
  function initSplitSummaryCountUp() {
    const summary = document.getElementById("splitSummary");
    if (!summary) return;
    const strongEl = summary.querySelector("strong");
    if (!strongEl) return;

    let lastRaw = strongEl.textContent;
    let currentShown = extractNumber(strongEl.textContent) || 0;
    let rafId = null;

    const observer = new MutationObserver(() => {
      const raw = strongEl.textContent;
      if (raw === lastRaw) return;
      const target = extractNumber(raw);
      if (target === null) {
        lastRaw = raw;
        return;
      }
      const prefix = raw.match(/^[^\d\-]*/)?.[0] || "";
      lastRaw = raw;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();

      const duration = 350; // snappier since this updates live while typing
      const start = currentShown;
      const startTime = performance.now();
      function step(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const value = Math.max(0, start + (target - start) * p);
        strongEl.textContent = prefix + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          strongEl.textContent = raw;
          currentShown = target;
          observer.observe(strongEl, { childList: true, characterData: true, subtree: true });
        }
      }
      rafId = requestAnimationFrame(step);
    });
    observer.observe(strongEl, { childList: true, characterData: true, subtree: true });
  }

  function extractNumber(text) {
    const n = parseFloat(text.replace(/[^\d.\-]/g, ""));
    return isNaN(n) ? null : n;
  }

  /* ----------------------------------------------
     3. Split member rows — stagger in as expense.js
     renders them into #splitMembers.
     ---------------------------------------------- */
  function initSplitMemberStagger() {
    const container = document.getElementById("splitMembers");
    if (!container) return;

    function animate(nodes) {
      nodes.forEach((node, i) => {
        if (node.nodeType !== 1) return;
        node.classList.add("list-item-enter");
        setTimeout(() => node.classList.add("list-item-in"), 20 + i * 45);
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

  /* ----------------------------------------------
     4. Page-load entrance for the two main cards
     ---------------------------------------------- */
  function initPageEntrance() {
    const form = document.querySelector(".expense-form-card");
    const preview = document.querySelector(".expense-preview-card");
    [form, preview].forEach((el, i) => {
      if (!el) return;
      el.classList.add("page-enter");
      setTimeout(() => el.classList.add("page-enter-in"), 60 + i * 100);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCategoryPicker();
    initSplitSummaryCountUp();
    initSplitMemberStagger();
    initPageEntrance();
  });
})();
