/* =====================================================
   Solutions Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Operations Tab Selector ---------- */
  const tabs = document.querySelectorAll('.sol-ops-tab');
  const panels = document.querySelectorAll('.sol-ops-panel');

  function activateTab(index) {
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const index = parseInt(tab.dataset.ops, 10);
      activateTab(index);
    });

    tab.addEventListener('keydown', (e) => {
      let index = parseInt(tab.dataset.ops, 10);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        index = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        index = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        index = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        index = tabs.length - 1;
      } else {
        return;
      }

      activateTab(index);
      tabs[index].focus();
    });
  });

  /* ---------- Visibility Counters ---------- */
  const visCounters = document.querySelectorAll('.sol-vis-stat-value[data-count]');
  const impactValues = document.querySelectorAll('.sol-impact-value[data-count]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    visCounters.forEach((counter) => counterObserver.observe(counter));
    impactValues.forEach((counter) => counterObserver.observe(counter));
  } else {
    visCounters.forEach((counter) => {
      const target = parseFloat(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const decimals = parseInt(counter.dataset.decimals, 10) || 0;
      counter.textContent = target.toFixed(decimals) + suffix;
    });
    impactValues.forEach((counter) => {
      const target = parseFloat(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const decimals = parseInt(counter.dataset.decimals, 10) || 0;
      counter.textContent = target.toFixed(decimals) + suffix;
    });
  }

  /* ---------- Impact Bar Animation ---------- */
  const impactCards = document.querySelectorAll('.sol-impact-card');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    impactCards.forEach((card) => barObserver.observe(card));
  } else {
    impactCards.forEach((card) => card.classList.add('revealed'));
  }

  /* ---------- Integration Nodes Reveal ---------- */
  const intNodes = document.querySelectorAll('.sol-int-node');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const nodeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay, 10) || 0;
            setTimeout(() => {
              entry.target.style.opacity = '1';
            }, delay * 150);
            nodeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    intNodes.forEach((node) => {
      node.style.opacity = '0';
      nodeObserver.observe(node);
    });
  } else {
    intNodes.forEach((node) => {
      node.style.opacity = '1';
    });
  }

  /* ---------- Stagger index assignment ---------- */
  function setStaggerIndex(selector, propName) {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.style.setProperty(propName, String(index));
    });
  }

  setStaggerIndex('.sol-bento-card.reveal-up', '--feature-index');
  setStaggerIndex('.sol-impact-card.reveal-up', '--feature-index');
})();
