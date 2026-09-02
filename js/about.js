/* =====================================================
   About Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Animated Counters ─── */
  const counters = document.querySelectorAll('[data-count]');

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
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals, 10) || 0;
      el.textContent = target.toFixed(decimals) + suffix;
    });
  }

  /* ─── Story Route Progress ─── */
  const storySection = document.querySelector('.about-story');
  const routeProgress = document.querySelector('.about-story-route-progress');

  if (!prefersReducedMotion && storySection && routeProgress && 'IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            routeProgress.style.height = '100%';
            storyObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    storyObserver.observe(storySection);
  } else if (routeProgress) {
    routeProgress.style.height = '100%';
  }

  /* ─── Approach Accordion ─── */
  const approachItems = document.querySelectorAll('.about-approach-item');

  approachItems.forEach((item) => {
    const header = item.querySelector('.about-approach-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      approachItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });

    // Keyboard accessibility
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Update aria-expanded on toggle
  if (approachItems.length) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const item = mutation.target;
          const header = item.querySelector('.about-approach-header');
          if (header) {
            header.setAttribute('aria-expanded', String(item.classList.contains('active')));
          }
        }
      });
    });

    approachItems.forEach((item) => {
      observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ─── Impact Bar Animation ─── */
  const impactBars = document.querySelectorAll('.about-impact-card-bar-fill');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.dataset.width || '100%';
            bar.style.width = width;
            barObserver.unobserve(bar);
          }
        });
      },
      { threshold: 0.3 }
    );
    impactBars.forEach((bar) => barObserver.observe(bar));
  } else {
    impactBars.forEach((bar) => {
      bar.style.width = bar.dataset.width || '100%';
    });
  }

  /* ─── Impact Route Line Draw ─── */
  const impactLines = document.querySelectorAll('.about-impact-route-line');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('drawn');
            lineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    impactLines.forEach((line) => lineObserver.observe(line));
  } else {
    impactLines.forEach((line) => line.classList.add('drawn'));
  }

  /* ─── CTA Network Animation ─── */
  const ctaSection = document.querySelector('.about-cta');
  const ctaNodes = document.querySelectorAll('.about-cta-node');
  const ctaLines = document.querySelectorAll('.about-cta-connections line');

  if (!prefersReducedMotion && ctaSection && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate nodes
            ctaNodes.forEach((node, i) => {
              setTimeout(() => {
                node.classList.add('visible');
              }, i * 60);
            });

            // Animate connections after nodes
            setTimeout(() => {
              ctaLines.forEach((line, i) => {
                setTimeout(() => {
                  line.classList.add('visible');
                }, i * 80);
              });
            }, ctaNodes.length * 60 + 200);

            ctaObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    ctaObserver.observe(ctaSection);
  } else {
    ctaNodes.forEach((n) => n.classList.add('visible'));
    ctaLines.forEach((l) => l.classList.add('visible'));
  }

})();
