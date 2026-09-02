/* =====================================================
   Route Optimization Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Multi-Stop Route Animation ---------- */
  const multistopSection = document.querySelector('.ro-multistop');
  const multistopStops = document.querySelectorAll('.ro-multistop-stop');

  if (!prefersReducedMotion && multistopSection && 'IntersectionObserver' in window) {
    const stopObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            multistopStops.forEach((stop, index) => {
              setTimeout(() => {
                stop.classList.add('revealed');
              }, index * 200);
            });
            stopObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    stopObserver.observe(multistopSection);
  } else {
    multistopStops.forEach((stop) => stop.classList.add('revealed'));
  }

  /* ---------- Dynamic Reroute Simulation ---------- */
  const rerouteSection = document.querySelector('.ro-reroute');
  const rerouteStatus = document.querySelector('.ro-reroute-scene-status');
  const rerouteAlert = document.querySelector('.ro-reroute-alert');
  const rerouteResult = document.querySelector('.ro-reroute-result');
  const originalRoute = document.querySelector('.ro-reroute-route-original');
  const newRoute = document.querySelector('.ro-reroute-route-new');
  const rerouteButtons = document.querySelectorAll('.ro-reroute-btn');

  let rerouteState = 'normal';
  let rerouteTimeline = null;

  function resetReroute() {
    rerouteState = 'normal';
    if (rerouteStatus) {
      rerouteStatus.className = 'ro-reroute-scene-status ro-reroute-status-normal';
      rerouteStatus.textContent = 'Route Normal';
    }
    if (rerouteAlert) rerouteAlert.classList.remove('show');
    if (rerouteResult) rerouteResult.classList.remove('show');
    if (originalRoute) {
      originalRoute.classList.remove('hidden');
      originalRoute.style.opacity = '1';
    }
    if (newRoute) newRoute.classList.remove('show');
    if (rerouteButtons) {
      rerouteButtons.forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.state === 'normal') btn.classList.add('active');
      });
    }
  }

  function triggerAlert() {
    rerouteState = 'alert';
    if (rerouteStatus) {
      rerouteStatus.className = 'ro-reroute-scene-status ro-reroute-status-alert';
      rerouteStatus.textContent = 'Traffic Congestion Detected';
    }
    if (rerouteAlert) rerouteAlert.classList.add('show');
    if (rerouteButtons) {
      rerouteButtons.forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.state === 'alert') btn.classList.add('active');
      });
    }
  }

  function triggerReroute() {
    rerouteState = 'rerouted';
    if (rerouteStatus) {
      rerouteStatus.className = 'ro-reroute-scene-status ro-reroute-status-rerouted';
      rerouteStatus.textContent = 'Route Optimized';
    }
    if (originalRoute) {
      originalRoute.classList.add('hidden');
    }
    if (newRoute) {
      setTimeout(() => {
        newRoute.classList.add('show');
      }, 300);
    }
    if (rerouteResult) {
      setTimeout(() => {
        rerouteResult.classList.add('show');
      }, 800);
    }
    if (rerouteButtons) {
      rerouteButtons.forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.state === 'rerouted') btn.classList.add('active');
      });
    }
  }

  function runRerouteSequence() {
    if (rerouteTimeline) clearTimeout(rerouteTimeline);
    resetReroute();

    rerouteTimeline = setTimeout(() => {
      triggerAlert();
      rerouteTimeline = setTimeout(() => {
        triggerReroute();
      }, 2500);
    }, 1500);
  }

  if (!prefersReducedMotion && rerouteSection && 'IntersectionObserver' in window) {
    const rerouteObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runRerouteSequence();
            rerouteObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    rerouteObserver.observe(rerouteSection);
  }

  if (rerouteButtons) {
    rerouteButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const state = btn.dataset.state;
        if (state === 'normal') resetReroute();
        else if (state === 'alert') { resetReroute(); triggerAlert(); }
        else if (state === 'rerouted') { resetReroute(); triggerReroute(); }
      });
    });
  }

  /* ---------- Compare Route Animation ---------- */
  const compareSection = document.querySelector('.ro-compare');
  const compareRoutes = document.querySelectorAll('.ro-compare-route-before, .ro-compare-route-after');

  if (!prefersReducedMotion && compareSection && 'IntersectionObserver' in window) {
    const compareObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            compareRoutes.forEach((route) => {
              route.classList.add('revealed');
            });
            compareObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    compareObserver.observe(compareSection);
  } else {
    compareRoutes.forEach((route) => route.classList.add('revealed'));
  }

  /* ---------- Animated Counters for Savings ---------- */
  const savingsValues = document.querySelectorAll('.ro-compare-savings-value, .ro-hero-stat-value');

  function animateValue(el) {
    const text = el.textContent;
    const match = text.match(/([\d.]+)/);
    if (!match) return;

    const target = parseFloat(match[1]);
    const prefix = text.slice(0, text.indexOf(match[1]));
    const suffix = text.slice(text.indexOf(match[1]) + match[1].length);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = text;
      }
    }

    requestAnimationFrame(update);
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const valueObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            valueObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    savingsValues.forEach((el) => valueObserver.observe(el));
  }

  /* ---------- Stagger index assignment ---------- */
  function setStaggerIndex(selector, propName) {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.style.setProperty(propName, String(index));
    });
  }

  setStaggerIndex('.ro-multistop-stop', '--stop-index');

})();
