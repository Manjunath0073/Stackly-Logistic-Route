/* =====================================================
   Stackly Route Main JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar ---------- */
  const navbar = document.getElementById('navbar');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const navLinks = document.querySelectorAll('.nav-link');
  const navIndicator = document.querySelector('.nav-indicator');
  const navbarNav = document.querySelector('.navbar-nav');

  const isPermanentNavbar = navbar && navbar.hasAttribute('data-navbar-permanent');

  function handleScroll() {
    if (isPermanentNavbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (!isPermanentNavbar) handleScroll();

  /* Mobile menu */
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenuToggle.classList.toggle('active', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen && mobileMenuToggle) {
      mobileMenuToggle.focus();
    }
  }

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', toggleMobileMenu);
  }

  /* ---------- Footer newsletter ---------- */
  const newsletterForms = document.querySelectorAll('.footer-newsletter');
  newsletterForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.footer-newsletter-input');
      const column = form.closest('.footer-column');
      const note = column ? column.querySelector('.footer-newsletter-note') : null;
      if (!input || !note) return;
      const email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.focus();
        return;
      }
      note.textContent = 'Thanks for subscribing!';
      form.reset();
    });
  });

  /* Nav indicator animation */
  function moveIndicator(target) {
    if (!navIndicator || !navbarNav) return;
    const parentRect = navbarNav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    navIndicator.style.left = `${targetRect.left - parentRect.left}px`;
    navIndicator.style.width = `${targetRect.width}px`;
  }

  function initIndicator() {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) moveIndicator(activeLink);
  }

  if (!prefersReducedMotion && navbarNav) {
    navLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => moveIndicator(link));
    });

    navbarNav.addEventListener('mouseleave', () => {
      const activeLink = document.querySelector('.nav-link.active');
      if (activeLink) moveIndicator(activeLink);
    });

    window.addEventListener('resize', initIndicator);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initIndicator);
    } else {
      window.addEventListener('load', initIndicator);
      initIndicator();
    }
  }

  /* ---------- Scroll reveal ---------- */
  const allRevealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const revealElements = Array.from(allRevealElements).filter((el) => !el.closest('.hero'));

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    allRevealElements.forEach((el) => el.classList.add('revealed'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-value[data-count], .metric-value[data-count]');

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
      el.textContent = current.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toFixed(decimals);
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
    counters.forEach((counter) => {
      const target = parseFloat(counter.dataset.count);
      const decimals = parseInt(counter.dataset.decimals, 10) || 0;
      counter.textContent = target.toFixed(decimals);
    });
  }

  /* ---------- Process line progress ---------- */
  const processSection = document.querySelector('.process-section');
  const processProgress = document.querySelector('.process-line-progress');

  if (!prefersReducedMotion && processSection && processProgress && 'IntersectionObserver' in window) {
    const processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processProgress.style.width = '100%';
            processObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    processObserver.observe(processSection);
  } else if (processProgress) {
    processProgress.style.width = '100%';
  }

  /* ---------- Stagger index assignment ---------- */
  function setStaggerIndex(selector, propName) {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.style.setProperty(propName, String(index));
    });
  }

  setStaggerIndex('.feature-card.reveal-up', '--feature-index');
  setStaggerIndex('.process-step.reveal-up', '--step-index');
  setStaggerIndex('.visibility-list li.reveal-up', '--item-index');

  /* ---------- Hero title line mask ---------- */
  const titleLines = document.querySelectorAll('.title-line');
  titleLines.forEach((line) => {
    const text = line.textContent;
    line.innerHTML = `<span>${text}</span>`;
  });

  /* ---------- Video error handling ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- Accessibility: close mobile menu on Esc ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      toggleMobileMenu();
    }
  });
})();
