/* =====================================================
   Contact Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========== FORM VALIDATION ========== */
  const form = document.getElementById('ct-contact-form');
  if (!form) return;

  const fields = {
    name: form.querySelector('#ct-name'),
    email: form.querySelector('#ct-email'),
    mobile: form.querySelector('#ct-mobile'),
    company: form.querySelector('#ct-company'),
    subject: form.querySelector('#ct-subject'),
    message: form.querySelector('#ct-message'),
  };

  const submitBtn = form.querySelector('.ct-form-submit');
  const successMessage = form.querySelector('.ct-form-success');

  /* --- Name Field: Only alphabets and spaces --- */
  if (fields.name) {
    fields.name.addEventListener('input', function () {
      // Remove any non-alphabet characters (allow spaces between names)
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
      clearFieldState('name');
    });

    fields.name.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const sanitized = pasted.replace(/[^a-zA-Z\s]/g, '');
      this.value = this.value.substring(0, this.selectionStart) + sanitized + this.value.substring(this.selectionEnd);
      clearFieldState('name');
    });

    fields.name.addEventListener('blur', function () {
      if (this.value.trim() && !/^[a-zA-Z\s]+$/.test(this.value.trim())) {
        setFieldError('name', 'Please enter a valid name (letters and spaces only).');
      }
    });
  }

  /* --- Email Field --- */
  if (fields.email) {
    fields.email.addEventListener('input', function () {
      clearFieldState('email');
    });

    fields.email.addEventListener('blur', function () {
      if (this.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.trim())) {
        setFieldError('email', 'Please enter a valid email address.');
      }
    });
  }

  /* --- Mobile Field: Numbers only --- */
  if (fields.mobile) {
    fields.mobile.addEventListener('input', function () {
      // Allow only digits
      this.value = this.value.replace(/[^0-9]/g, '');
      // Enforce max length
      if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
      }
      clearFieldState('mobile');
    });

    fields.mobile.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const sanitized = pasted.replace(/[^0-9]/g, '').slice(0, 10);
      this.value = this.value.substring(0, this.selectionStart) + sanitized + this.value.substring(this.selectionEnd);
      clearFieldState('mobile');
    });

    fields.mobile.addEventListener('blur', function () {
      if (this.value.trim() && this.value.trim().length !== 10) {
        setFieldError('mobile', 'Please enter a valid 10-digit mobile number.');
      }
    });
  }

  /* --- Company Field (optional) --- */
  if (fields.company) {
    fields.company.addEventListener('input', function () {
      clearFieldState('company');
    });
  }

  /* --- Subject Field --- */
  if (fields.subject) {
    fields.subject.addEventListener('change', function () {
      clearFieldState('subject');
    });
  }

  /* --- Message Field: Min 10 chars --- */
  if (fields.message) {
    fields.message.addEventListener('input', function () {
      clearFieldState('message');
      updateCharCount(this);
    });

    fields.message.addEventListener('blur', function () {
      const val = this.value.trim();
      if (val && val.length < 10) {
        setFieldError('message', 'Message must contain at least 10 characters.');
      }
    });
  }

  /* --- Character Counter --- */
  function updateCharCount(textarea) {
    const counter = textarea.closest('.ct-form-group').querySelector('.ct-form-char-count');
    if (!counter) return;
    const len = textarea.value.length;
    counter.textContent = `${len} / 500`;
    counter.classList.remove('near-limit', 'at-limit');
    if (len >= 480) {
      counter.classList.add('at-limit');
    } else if (len >= 400) {
      counter.classList.add('near-limit');
    }
  }

  /* --- Validation Helpers --- */
  function setFieldError(fieldName, message) {
    const group = fields[fieldName]?.closest('.ct-form-group');
    if (!group) return;
    group.classList.add('error');
    group.classList.remove('success');
    const errorEl = group.querySelector('.ct-form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'flex';
    }
  }

  function clearFieldState(fieldName) {
    const group = fields[fieldName]?.closest('.ct-form-group');
    if (!group) return;
    group.classList.remove('error');
    const errorEl = group.querySelector('.ct-form-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function validateField(fieldName) {
    const field = fields[fieldName];
    if (!field) return true;
    const val = field.value.trim();
    const group = field.closest('.ct-form-group');

    switch (fieldName) {
      case 'name':
        if (!val) {
          setFieldError('name', 'Name is required.');
          return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(val)) {
          setFieldError('name', 'Please enter a valid name (letters and spaces only).');
          return false;
        }
        clearFieldState('name');
        group.classList.add('success');
        return true;

      case 'email':
        if (!val) {
          setFieldError('email', 'Email address is required.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          setFieldError('email', 'Please enter a valid email address.');
          return false;
        }
        clearFieldState('email');
        group.classList.add('success');
        return true;

      case 'mobile':
        if (!val) {
          setFieldError('mobile', 'Mobile number is required.');
          return false;
        }
        if (val.length !== 10) {
          setFieldError('mobile', 'Please enter a valid 10-digit mobile number.');
          return false;
        }
        clearFieldState('mobile');
        group.classList.add('success');
        return true;

      case 'message':
        if (!val) {
          setFieldError('message', 'Message is required.');
          return false;
        }
        if (val.length < 10) {
          setFieldError('message', 'Message must contain at least 10 characters.');
          return false;
        }
        clearFieldState('message');
        group.classList.add('success');
        return true;

      default:
        return true;
    }
  }

  /* --- Form Submission --- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate all required fields
    const isNameValid = validateField('name');
    const isEmailValid = validateField('email');
    const isMobileValid = validateField('mobile');
    const isMessageValid = validateField('message');

    if (!isNameValid || !isEmailValid || !isMobileValid || !isMessageValid) {
      // Scroll to first error
      const firstError = form.querySelector('.ct-form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.querySelector('input, select, textarea')?.focus();
      }
      return;
    }

    // All valid — simulate submission
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(function () {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Show success
      successMessage.classList.add('show');

      // Hide after 3 seconds
      setTimeout(function () {
        successMessage.classList.remove('show');

        // Reset form
        form.reset();
        // Clear all validation states
        form.querySelectorAll('.ct-form-group').forEach(function (group) {
          group.classList.remove('error', 'success');
        });
        form.querySelectorAll('.ct-form-error').forEach(function (err) {
          err.textContent = '';
          err.style.display = 'none';
        });
        // Reset char count
        const charCount = form.querySelector('.ct-form-char-count');
        if (charCount) {
          charCount.textContent = '0 / 500';
          charCount.classList.remove('near-limit', 'at-limit');
        }
      }, 3000);
    }, 1200);
  });

  /* ========== CTA NETWORK ANIMATION ========== */
  const ctaSection = document.querySelector('.ct-cta');
  const ctaNodes = document.querySelectorAll('.ct-cta-node');
  const ctaConnections = document.querySelectorAll('.ct-cta-connections line');

  if (!prefersReducedMotion && ctaSection && 'IntersectionObserver' in window) {
    const networkObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
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
    // Fallback: activate immediately
    ctaNodes.forEach(function (n) { n.classList.add('active'); });
    ctaConnections.forEach(function (l) { l.classList.add('active'); });
  }

  function animateNetwork() {
    ctaNodes.forEach(function (node, i) {
      setTimeout(function () {
        node.classList.add('active');
      }, i * 60);
    });

    setTimeout(function () {
      ctaConnections.forEach(function (line, i) {
        setTimeout(function () {
          line.classList.add('active');
        }, i * 80);
      });
    }, 500);
  }

  /* ========== SCROLL REVEALS FOR FORM SECTION ========== */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.ct-form-card, .ct-info-panel, .ct-map-container, .ct-cta-content').forEach(function (el) {
      el.classList.add('reveal-up');
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.ct-form-card, .ct-info-panel, .ct-map-container, .ct-cta-content').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

})();
