/* =====================================================
   Authentication Pages JavaScript
   ===================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════
     SEED DEMO USERS (if none exist)
     ═══════════════════════════════════════ */

  (function seedDemoUsers() {
    try {
      var users = JSON.parse(localStorage.getItem('stackly_users') || '[]');
      if (users.length === 0) {
        users = [
          { name: 'Alex Morgan', email: 'alex@stackly.com', role: 'fleet-manager' },
          { name: 'Jordan Lee', email: 'jordan@stackly.com', role: 'driver' }
        ];
        localStorage.setItem('stackly_users', JSON.stringify(users));
      }
    } catch (e) {}
  })();

  /* ═══════════════════════════════════════
     PASSWORD TOGGLE
     ═══════════════════════════════════════ */

  document.querySelectorAll('.auth-password-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      const input = this.closest('.auth-input-wrap').querySelector('.auth-form-input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      this.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      // Update icon
      const eyeOpen = this.querySelector('.eye-open');
      const eyeClosed = this.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';
      }
    });

    // Set initial state
    const input = toggle.closest('.auth-input-wrap').querySelector('.auth-form-input');
    if (input) {
      toggle.setAttribute('aria-label', 'Show password');
    }
  });

  /* ═══════════════════════════════════════
     FOCUS STATE MANAGEMENT
     ═══════════════════════════════════════ */

  document.querySelectorAll('.auth-form-input').forEach(function (input) {
    input.addEventListener('focus', function () {
      this.closest('.auth-form-group').classList.add('focused');
    });

    input.addEventListener('blur', function () {
      this.closest('.auth-form-group').classList.remove('focused');
    });
  });

  /* ═══════════════════════════════════════
     ROLE SELECTION
     ═══════════════════════════════════════ */

  function setupRoleCards(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) return;

    var cards = section.querySelectorAll('.auth-role-card');
    var radio = section.querySelector('.auth-role-radio');

    cards.forEach(function (card) {
      // Click handler
      card.addEventListener('click', function () {
        selectRoleCard(cards, radio, card);
      });

      // Keyboard handler
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRoleCard(cards, radio, card);
        }
        // Arrow key navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = card.nextElementSibling || card.parentElement.firstElementChild;
          if (next && next.classList.contains('auth-role-card')) {
            next.focus();
            selectRoleCard(cards, radio, next);
          }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = card.previousElementSibling || card.parentElement.lastElementChild;
          if (prev && prev.classList.contains('auth-role-card')) {
            prev.focus();
            selectRoleCard(cards, radio, prev);
          }
        }
      });
    });
  }

  function selectRoleCard(cards, radio, selectedCard) {
    cards.forEach(function (c) {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    selectedCard.classList.add('selected');
    selectedCard.setAttribute('aria-checked', 'true');

    var value = selectedCard.dataset.role;
    radio.value = value;
    radio.checked = true;

    // Clear role error
    var section = selectedCard.closest('.auth-role-section');
    if (section) {
      section.classList.remove('error');
      var errorEl = section.querySelector('.auth-form-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateRole(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) return '';
    var radio = section.querySelector('.auth-role-radio');
    if (!radio || !radio.checked) return 'Please select your role.';
    return '';
  }

  function getRoleValue(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) return '';
    var radio = section.querySelector('.auth-role-radio');
    return radio ? radio.value : '';
  }

  // Initialize role cards on both pages
  setupRoleCards('login-role-section');
  setupRoleCards('signup-role-section');

  /* ═══════════════════════════════════════
     EMAIL VALIDATION
     ═══════════════════════════════════════ */

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
    return '';
  }

  /* ═══════════════════════════════════════
     PASSWORD VALIDATION
     ═══════════════════════════════════════ */

  function validatePassword(value) {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  function validateSignupPassword(value) {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  function validateConfirmPassword(value, passwordValue) {
    if (!value) return 'Please confirm your password.';
    if (value !== passwordValue) return 'Passwords do not match.';
    return '';
  }

  /* ═══════════════════════════════════════
     FULL NAME VALIDATION (Signup)
     ═══════════════════════════════════════ */

  function validateFullName(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Full name is required.';
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return 'Name should only contain letters and spaces.';
    return '';
  }

  /* ═══════════════════════════════════════
     FIELD STATE HELPERS
     ═══════════════════════════════════════ */

  function setFieldError(group, message) {
    group.classList.remove('success');
    group.classList.add('error');
    var errorEl = group.querySelector('.auth-form-error');
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function setFieldSuccess(group) {
    group.classList.remove('error');
    group.classList.add('success');
    var errorEl = group.querySelector('.auth-form-error');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function clearFieldState(group) {
    group.classList.remove('error', 'success');
    var errorEl = group.querySelector('.auth-form-error');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function getGroup(input) {
    return input.closest('.auth-form-group') || input.closest('.auth-checkbox-group');
  }

  /* ═══════════════════════════════════════
     PASSWORD STRENGTH INDICATOR
     ═══════════════════════════════════════ */

  function calculateStrength(password) {
    var score = 0;
    var checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    var strength = 'weak';
    if (score >= 5) strength = 'excellent';
    else if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'fair';

    return { score: score, strength: strength, checks: checks };
  }

  function updateStrengthIndicator(password) {
    var indicator = document.querySelector('.auth-strength');
    if (!indicator) return;

    var result = calculateStrength(password);
    var segments = indicator.querySelectorAll('.auth-strength-segment');
    var label = indicator.querySelector('.auth-strength-label');

    indicator.setAttribute('data-strength', result.score > 0 ? result.strength : '');

    segments.forEach(function (seg, i) {
      seg.classList.toggle('active', i < result.score);
    });

    if (label) {
      var labels = { 0: '', 1: 'Weak', 2: 'Weak', 3: 'Fair', 4: 'Strong', 5: 'Excellent' };
      label.textContent = labels[result.score] || '';
    }

    // Update requirements checklist
    document.querySelectorAll('.auth-password-req').forEach(function (req) {
      var type = req.dataset.req;
      if (checks[type]) {
        req.classList.toggle('met', checks[type]);
      }
    });

    return result;
  }

  var checks = {};

  function updatePasswordRequirements(password) {
    checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    document.querySelectorAll('.auth-password-req').forEach(function (req) {
      var type = req.dataset.req;
      if (checks[type] !== undefined) {
        req.classList.toggle('met', checks[type]);
      }
    });

    return checks;
  }

  /* ═══════════════════════════════════════
     LOGIN FORM
     ═══════════════════════════════════════ */

  var loginForm = document.getElementById('auth-login-form');
  if (loginForm) {
    var loginEmail = loginForm.querySelector('#auth-login-email');
    var loginPassword = loginForm.querySelector('#auth-login-password');
    var loginSubmit = loginForm.querySelector('.auth-submit');
    var loginSuccess = loginForm.querySelector('.auth-success');

    // Blur validation
    if (loginEmail) {
      loginEmail.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validateEmail(this.value);
        if (error) setFieldError(group, error);
        else setFieldSuccess(group);
      });

      loginEmail.addEventListener('input', function () {
        var group = getGroup(this);
        if (group.classList.contains('error')) {
          var error = validateEmail(this.value);
          if (!error) setFieldSuccess(group);
        }
      });
    }

    if (loginPassword) {
      loginPassword.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validatePassword(this.value);
        if (error) setFieldError(group, error);
        else if (this.value) setFieldSuccess(group);
      });

      loginPassword.addEventListener('input', function () {
        var group = getGroup(this);
        if (group.classList.contains('error')) {
          var error = validatePassword(this.value);
          if (!error) setFieldSuccess(group);
        }
      });
    }

    // Submit
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailValid = validateEmail(loginEmail ? loginEmail.value : '');
      var passValid = validatePassword(loginPassword ? loginPassword.value : '');
      var roleValid = validateRole('login-role-section');

      if (emailValid) setFieldError(getGroup(loginEmail), emailValid);
      else setFieldSuccess(getGroup(loginEmail));

      if (passValid) setFieldError(getGroup(loginPassword), passValid);
      else setFieldSuccess(getGroup(loginPassword));

      if (roleValid) {
        var roleSection = document.getElementById('login-role-section');
        if (roleSection) {
          roleSection.classList.add('error');
          var roleError = roleSection.querySelector('.auth-form-error');
          if (roleError) roleError.textContent = roleValid;
        }
      } else {
        var roleSection = document.getElementById('login-role-section');
        if (roleSection) {
          roleSection.classList.remove('error');
          var roleError = roleSection.querySelector('.auth-form-error');
          if (roleError) roleError.textContent = '';
        }
      }

      if (emailValid || passValid || roleValid) {
        // Focus first error
        var firstError = loginForm.querySelector('.auth-form-group.error .auth-form-input, .auth-role-section.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate login
      loginSubmit.classList.add('loading');
      loginSubmit.disabled = true;

      var loginData = {
        email: loginEmail ? loginEmail.value.trim() : '',
        role: getRoleValue('login-role-section')
      };

      setTimeout(function () {
        loginSubmit.classList.remove('loading');
        loginSubmit.disabled = false;

        // Look up stored user
        var users = [];
        try { users = JSON.parse(localStorage.getItem('stackly_users') || '[]'); } catch (e) { users = []; }
        var matchedUser = users.find(function (u) {
          return u.email.toLowerCase() === loginData.email.toLowerCase() && u.role === loginData.role;
        });

        if (!matchedUser) {
          // Create a demo user for first-time login (demo mode)
          matchedUser = {
            name: loginData.email.split('@')[0].replace(/[^a-zA-Z\s]/g, '').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) || 'Fleet Manager',
            email: loginData.email,
            role: loginData.role
          };
          users.push(matchedUser);
          try { localStorage.setItem('stackly_users', JSON.stringify(users)); } catch (e) {}
        }

        // Store current session
        try {
          localStorage.setItem('stackly_session', JSON.stringify({
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            loginTime: Date.now()
          }));
        } catch (e) {}

        loginSuccess.classList.add('show', 'success');
        loginSuccess.innerHTML = '<div class="auth-success-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="auth-success-text" style="color: #10B981;">Login successful. Redirecting...</div>';

        setTimeout(function () {
          if (loginData.role === 'fleet-manager') {
            window.location.href = '../dashboard/index.html';
          } else if (loginData.role === 'driver') {
            window.location.href = '../driver-dashboard/index.html';
          } else {
            window.location.href = '../index.html';
          }
        }, 1200);
      }, 1500);
    });
  }

  /* ═══════════════════════════════════════
     SIGNUP FORM
     ═══════════════════════════════════════ */

  var signupForm = document.getElementById('auth-signup-form');
  if (signupForm) {
    var signupName = signupForm.querySelector('#auth-signup-name');
    var signupEmail = signupForm.querySelector('#auth-signup-email');
    var signupPassword = signupForm.querySelector('#auth-signup-password');
    var signupConfirm = signupForm.querySelector('#auth-signup-confirm');
    var signupTerms = signupForm.querySelector('#auth-signup-terms');
    var signupSubmit = signupForm.querySelector('.auth-submit');
    var signupSuccess = signupForm.querySelector('.auth-success');

    // Name - sanitize input
    if (signupName) {
      signupName.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
      });

      signupName.addEventListener('paste', function (e) {
        var pasted = (e.clipboardData || window.clipboardData).getData('text');
        var sanitized = pasted.replace(/[^a-zA-Z\s]/g, '');
        e.preventDefault();
        this.value = this.value.substring(0, this.selectionStart) + sanitized + this.value.substring(this.selectionEnd);
      });

      signupName.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validateFullName(this.value);
        if (error) setFieldError(group, error);
        else if (this.value.trim()) setFieldSuccess(group);
      });

      signupName.addEventListener('input', function () {
        var group = getGroup(this);
        if (group.classList.contains('error')) {
          var error = validateFullName(this.value);
          if (!error) setFieldSuccess(group);
        }
      });
    }

    // Email
    if (signupEmail) {
      signupEmail.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validateEmail(this.value);
        if (error) setFieldError(group, error);
        else setFieldSuccess(group);
      });

      signupEmail.addEventListener('input', function () {
        var group = getGroup(this);
        if (group.classList.contains('error')) {
          var error = validateEmail(this.value);
          if (!error) setFieldSuccess(group);
        }
      });
    }

    // Password
    if (signupPassword) {
      signupPassword.addEventListener('input', function () {
        updatePasswordRequirements(this.value);
        updateStrengthIndicator(this.value);

        // Also update confirm password validation
        if (signupConfirm && signupConfirm.value) {
          var confirmGroup = getGroup(signupConfirm);
          var confirmError = validateConfirmPassword(signupConfirm.value, this.value);
          if (confirmError) setFieldError(confirmGroup, confirmError);
          else setFieldSuccess(confirmGroup);
        }
      });

      signupPassword.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validateSignupPassword(this.value);
        if (error) setFieldError(group, error);
        else if (this.value) setFieldSuccess(group);
      });
    }

    // Confirm Password
    if (signupConfirm) {
      signupConfirm.addEventListener('input', function () {
        if (signupPassword && signupPassword.value) {
          var group = getGroup(this);
          var error = validateConfirmPassword(this.value, signupPassword.value);
          if (error) setFieldError(group, error);
          else if (this.value) setFieldSuccess(group);
        }
      });

      signupConfirm.addEventListener('blur', function () {
        var group = getGroup(this);
        var error = validateConfirmPassword(this.value, signupPassword ? signupPassword.value : '');
        if (error) setFieldError(group, error);
        else if (this.value) setFieldSuccess(group);
      });
    }

    // Terms checkbox
    if (signupTerms) {
      signupTerms.addEventListener('change', function () {
        var group = this.closest('.auth-checkbox-group');
        if (this.checked) {
          clearFieldState(group);
        }
      });
    }

    // Submit
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameError = validateFullName(signupName ? signupName.value : '');
      var emailError = validateEmail(signupEmail ? signupEmail.value : '');
      var roleError = validateRole('signup-role-section');
      var passError = validateSignupPassword(signupPassword ? signupPassword.value : '');
      var confirmError = validateConfirmPassword(signupConfirm ? signupConfirm.value : '', signupPassword ? signupPassword.value : '');
      var termsError = signupTerms && !signupTerms.checked ? 'You must accept the Terms & Conditions.' : '';

      if (nameError) setFieldError(getGroup(signupName), nameError);
      else setFieldSuccess(getGroup(signupName));

      if (emailError) setFieldError(getGroup(signupEmail), emailError);
      else setFieldSuccess(getGroup(signupEmail));

      if (roleError) {
        var roleSection = document.getElementById('signup-role-section');
        if (roleSection) {
          roleSection.classList.add('error');
          var roleErrorEl = roleSection.querySelector('.auth-form-error');
          if (roleErrorEl) roleErrorEl.textContent = roleError;
        }
      } else {
        var roleSection = document.getElementById('signup-role-section');
        if (roleSection) {
          roleSection.classList.remove('error');
          var roleErrorEl = roleSection.querySelector('.auth-form-error');
          if (roleErrorEl) roleErrorEl.textContent = '';
        }
      }

      if (passError) setFieldError(getGroup(signupPassword), passError);
      else setFieldSuccess(getGroup(signupPassword));

      if (confirmError) setFieldError(getGroup(signupConfirm), confirmError);
      else if (signupConfirm && signupConfirm.value) setFieldSuccess(getGroup(signupConfirm));

      if (termsError) {
        var termsGroup = signupTerms.closest('.auth-checkbox-group');
        if (termsGroup) setFieldError(termsGroup, termsError);
      } else {
        var termsGroup = signupTerms ? signupTerms.closest('.auth-checkbox-group') : null;
        if (termsGroup) clearFieldState(termsGroup);
      }

      if (nameError || emailError || roleError || passError || confirmError || termsError) {
        var firstError = signupForm.querySelector('.auth-form-group.error .auth-form-input, .auth-role-section.error, .auth-checkbox-group.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate signup
      signupSubmit.classList.add('loading');
      signupSubmit.disabled = true;

      var signupData = {
        name: signupName ? signupName.value.trim() : '',
        email: signupEmail ? signupEmail.value.trim() : '',
        role: getRoleValue('signup-role-section')
      };

      // Store user data (no password stored)
      var users = [];
      try { users = JSON.parse(localStorage.getItem('stackly_users') || '[]'); } catch (e) { users = []; }
      var emailExists = users.some(function (u) {
        return u.email.toLowerCase() === signupData.email.toLowerCase();
      });
      if (!emailExists) {
        users.push({ name: signupData.name, email: signupData.email, role: signupData.role });
        try { localStorage.setItem('stackly_users', JSON.stringify(users)); } catch (e) {}
      }

      setTimeout(function () {
        signupSubmit.classList.remove('loading');
        signupSubmit.disabled = false;

        signupSuccess.classList.add('show', 'success');
        signupSuccess.innerHTML = '<div class="auth-success-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="auth-success-text" style="color: #10B981;">Account created successfully. Welcome aboard!</div><div class="auth-success-sub">Redirecting to login...</div>';

        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1500);
      }, 1500);
    });
  }

  /* ═══════════════════════════════════════
     ENTRANCE ANIMATION
     ═══════════════════════════════════════ */

  if (!prefersReducedMotion) {
    // Stagger form elements
    var formGroups = document.querySelectorAll('.auth-form-group, .auth-role-section, .auth-form-footer, .auth-submit');
    formGroups.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.transitionDelay = (i * 0.08 + 0.2) + 's';
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    });

    // Animate header
    var header = document.querySelector('.auth-form-header');
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(16px)';
      header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      setTimeout(function () {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }, 100);
    }

    // Animate brand content
    var brandContent = document.querySelector('.auth-brand-content');
    if (brandContent) {
      brandContent.style.opacity = '0';
      brandContent.style.transform = 'translateY(24px)';
      brandContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      setTimeout(function () {
        brandContent.style.opacity = '1';
        brandContent.style.transform = 'translateY(0)';
      }, 300);
    }
  }

})();
