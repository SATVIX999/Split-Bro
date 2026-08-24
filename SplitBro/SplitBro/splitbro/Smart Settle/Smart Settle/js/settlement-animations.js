/* ============================================
   Settlement Animations — pure enhancement layer.
   Observes DOM only, never touches settlement.js state.
   ============================================ */
(function () {
  "use strict";

  function extractNumber(text) {
    const n = parseFloat(text.replace(/[^\d.\-]/g, ""));
    return isNaN(n) ? null : n;
  }
  function formatNumber(value, decimals) {
    return value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

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
     1. Top stat count-up (Outstanding, Transactions Needed)
     ---------------------------------------------- */
  function initStatCountUp() {
    watchNumberElement(document.getElementById("totalOutstanding"), { decimals: 2 });
    watchNumberElement(document.getElementById("transactionCount"), { decimals: 0 });
  }

  /* ----------------------------------------------
     2. Member balance rows — proportional bar + entrance,
     mirroring the dashboard treatment.
     ---------------------------------------------- */
  function initMemberBalanceBars() {
    const container = document.getElementById("settlementMembers");
    if (!container) return;

    function apply() {
      const rows = Array.from(container.querySelectorAll(".settlement-member"));
      if (rows.length === 0) return;

      const magnitudes = rows.map((row) => {
        const balEl = row.querySelector(".positive-balance, .negative-balance, .zero-balance");
        if (!balEl) return 0;
        const n = extractNumber(balEl.textContent);
        return n === null ? 0 : Math.abs(n);
      });
      const max = Math.max(...magnitudes, 1);

      rows.forEach((row, i) => {
        if (!row.classList.contains("list-item-enter")) {
          row.classList.add("list-item-enter");
          setTimeout(() => row.classList.add("list-item-in"), 20 + i * 55);
        }
        if (row.querySelector(".member-balance-bar-track")) return;

        const balEl = row.querySelector(".positive-balance, .negative-balance, .zero-balance");
        if (!balEl) return;
        const isNegative = balEl.classList.contains("negative-balance");
        const pct = Math.round((magnitudes[i] / max) * 100);

        const track = document.createElement("div");
        track.className = "member-balance-bar-track";
        const fill = document.createElement("div");
        fill.className = "member-balance-bar-fill" + (isNegative ? " negative" : " positive");
        track.appendChild(fill);
        row.appendChild(track);

        requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = pct + "%")));
      });
    }

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
  }

  /* ----------------------------------------------
     3. Transaction rows (the payment plan) — staggered
     entrance, since these visually represent the debt
     flow (already has an arrow icon between people).
     ---------------------------------------------- */
  function initTransactionStagger() {
    const container = document.getElementById("settlementTransactions");
    if (!container) return;

    function animate(nodes) {
      nodes.forEach((node, i) => {
        if (node.nodeType !== 1 || !node.classList.contains("settlement-transaction")) return;
        node.classList.add("list-item-enter");
        setTimeout(() => node.classList.add("list-item-in"), 30 + i * 90);
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
     4. Mark-paid button — visual success feedback only.
     Does not touch settlement.js's own click handling;
     just layers a checkmark-pulse animation on click.
     ---------------------------------------------- */
  function initMarkPaidFeedback() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".mark-paid-button");
      if (!btn) return;
      btn.classList.remove("mark-paid-pulse");
      void btn.offsetWidth;
      btn.classList.add("mark-paid-pulse");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStatCountUp();
    initMemberBalanceBars();
    initTransactionStagger();
    initMarkPaidFeedback();
  });
})();
