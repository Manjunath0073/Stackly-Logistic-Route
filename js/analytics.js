/* =====================================================
   Analytics & Insights Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Animated Counters ---------- */
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

    document.querySelectorAll('[data-count]').forEach((el) => {
      counterObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals, 10) || 0;
      el.textContent = target.toFixed(decimals) + suffix;
    });
  }

  /* ---------- Performance Section: Bar Chart Animation ---------- */
  const perfBars = document.querySelectorAll('.an-perf-bar-fill');

  if (!prefersReducedMotion && perfBars.length && 'IntersectionObserver' in window) {
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

    perfBars.forEach((bar) => barObserver.observe(bar));
  } else {
    perfBars.forEach((bar) => bar.classList.add('revealed'));
  }

  /* ---------- Data to Decision: Step Reveal ---------- */
  const decisionSteps = document.querySelectorAll('.an-decision-step');

  if (!prefersReducedMotion && decisionSteps.length && 'IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            stepObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    decisionSteps.forEach((step) => stepObserver.observe(step));
  } else {
    decisionSteps.forEach((step) => step.classList.add('revealed'));
  }

  /* ---------- Predictive Section: Insight Card Stagger ---------- */
  const predictCards = document.querySelectorAll('.an-predict-card');

  if (!prefersReducedMotion && predictCards.length && 'IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            predictCards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('revealed');
              }, i * 150);
            });
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const predictSection = document.querySelector('.an-predict-insights');
    if (predictSection) cardObserver.observe(predictSection);
  } else {
    predictCards.forEach((card) => card.classList.add('revealed'));
  }

  /* ---------- CTA Network Animation ---------- */
  const ctaSection = document.querySelector('.an-cta');
  const ctaNodes = document.querySelectorAll('.an-cta-node');
  const ctaConnections = document.querySelectorAll('.an-cta-connections line');

  if (!prefersReducedMotion && ctaSection && 'IntersectionObserver' in window) {
    const networkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNetwork();
            networkObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    networkObserver.observe(ctaSection);
  } else {
    if (ctaNodes.length) {
      ctaNodes.forEach((n) => n.classList.add('active'));
    }
    if (ctaConnections.length) {
      ctaConnections.forEach((l) => l.classList.add('active'));
    }
  }

  function animateNetwork() {
    // Activate nodes progressively
    ctaNodes.forEach((node, i) => {
      setTimeout(() => {
        node.classList.add('active');
      }, i * 80);
    });

    // Activate connections after nodes
    setTimeout(() => {
      ctaConnections.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('active');
        }, i * 100);
      });
    }, 600);
  }

  /* ---------- Sparkline Hover Interaction ---------- */
  const sparklineCards = document.querySelectorAll('.an-perf-card');

  sparklineCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const sparkline = card.querySelector('.an-perf-card-sparkline path');
      if (sparkline) {
        sparkline.style.stroke = 'var(--color-accent-light)';
      }
    });
    card.addEventListener('mouseleave', () => {
      const sparkline = card.querySelector('.an-perf-card-sparkline path');
      if (sparkline) {
        sparkline.style.stroke = '';
      }
    });
  });

  /* ---------- Predictive Card Hover: Highlight prediction zone ---------- */
  const predictCardsHover = document.querySelectorAll('.an-predict-card[data-zone]');

  predictCardsHover.forEach((card) => {
    const zoneId = card.dataset.zone;
    const zone = document.querySelector('.an-predict-zone[data-zone="' + zoneId + '"]');

    if (zone) {
      card.addEventListener('mouseenter', () => {
        zone.style.opacity = '0.4';
      });
      card.addEventListener('mouseleave', () => {
        zone.style.opacity = '';
      });
    }
  });

})();
