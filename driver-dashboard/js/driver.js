/* =====================================================
   Driver / Field Operator Dashboard — SPA Core
   Premium, data-rich, mobile-first
   ===================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentView = null;
  var chartInstances = {};

  /* ═══════════════════════════════════════
     AUTH CHECK (demo — always allow)
     ═══════════════════════════════════════ */

  var session = null;
  try { session = JSON.parse(localStorage.getItem('stackly_session')); } catch (e) { session = null; }

  var appEl = document.getElementById('drv-app');
  if (appEl) appEl.style.display = 'flex';

  /* ═══════════════════════════════════════
     USER DATA
     ═══════════════════════════════════════ */

  var userName = (session && session.name) || 'Jordan Lee';
  var userEmail = (session && session.email) || 'jordan@stackly.com';
  var userRole = 'Driver / Field Operator';

  function getInitials(name) {
    var parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  var initials = getInitials(userName);

  function setUserUI() {
    var els = {
      'sidebar-avatar': initials,
      'sidebar-user-name': userName,
      'topbar-avatar': initials,
      'topbar-user-name': userName,
      'dropdown-avatar': initials,
      'dropdown-name': userName,
      'dropdown-email': userEmail
    };
    Object.keys(els).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = els[id];
    });
  }
  setUserUI();

  /* ═══════════════════════════════════════
     SIDEBAR / MOBILE NAV
     ═══════════════════════════════════════ */

  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  var hamburger = document.getElementById('hamburger-btn');
  var sidebarClose = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);

  /* ═══════════════════════════════════════
     PROFILE DROPDOWN
     ═══════════════════════════════════════ */

  var profileTrigger = document.getElementById('profile-trigger');
  var profileDropdown = document.getElementById('profile-dropdown');

  function toggleProfile() {
    var isOpen = profileDropdown.classList.toggle('open');
    profileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  if (profileTrigger) {
    profileTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleProfile();
    });
    profileTrigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProfile(); }
      if (e.key === 'Escape') { profileDropdown.classList.remove('open'); profileTrigger.setAttribute('aria-expanded', 'false'); }
    });
  }
  document.addEventListener('click', function () {
    if (profileDropdown) profileDropdown.classList.remove('open');
    if (profileTrigger) profileTrigger.setAttribute('aria-expanded', 'false');
  });

  /* ═══════════════════════════════════════
     LOGOUT
     ═══════════════════════════════════════ */

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      try { localStorage.removeItem('stackly_session'); } catch (e) {}
      window.location.href = '../pages/login.html';
    });
  }

  /* ═══════════════════════════════════════
     DEMO STATE — Driver personal data
     ═══════════════════════════════════════ */

  var state = {
    route: {
      id: 'RT-204',
      name: 'Downtown Circuit',
      status: 'active',
      stops: 8,
      distance: 86,
      completedDistance: 38,
      plannedDurationMin: 220,
      actualDurationMin: 152,
      eta: '11:30 AM',
      currentStop: 4,
      efficiency: 93,
      timeSavedMin: 18
    },
    deliveries: [
      { id: 'DL-1001', customer: 'Metro Electronics', address: '142 Main St, Suite 200', time: '8:30 AM', status: 'delivered', packages: 3, weight: '12.4 kg', durationMin: 14 },
      { id: 'DL-1002', customer: 'Fresh Market Grocery', address: '88 Oak Avenue', time: '9:15 AM', status: 'delivered', packages: 5, weight: '28.1 kg', durationMin: 11 },
      { id: 'DL-1003', customer: 'Tech Solutions Inc.', address: '305 Commerce Blvd, Floor 3', time: '10:00 AM', status: 'delivered', packages: 2, weight: '8.7 kg', durationMin: 18 },
      { id: 'DL-1004', customer: 'Green Valley Pharmacy', address: '22 Health Park Dr', time: '10:45 AM', status: 'inprogress', packages: 4, weight: '6.2 kg', durationMin: 9 },
      { id: 'DL-1005', customer: 'City Library Branch', address: '500 Knowledge Way', time: '11:30 AM', status: 'pending', packages: 8, weight: '32.5 kg', durationMin: 13 },
      { id: 'DL-1006', customer: 'Harbor View Restaurant', address: '77 Waterfront Ave', time: '12:15 PM', status: 'pending', packages: 2, weight: '15.8 kg', durationMin: 8 },
      { id: 'DL-1007', customer: 'Summit Fitness Center', address: '410 Hilltop Rd', time: '1:00 PM', status: 'pending', packages: 1, weight: '4.3 kg', durationMin: 6 },
      { id: 'DL-1008', customer: 'Riverside Office Park', address: '1200 River Rd, Building C', time: '2:00 PM', status: 'pending', packages: 6, weight: '22.0 kg', durationMin: 16 }
    ],
    stops: [
      { num: 1, name: 'Metro Electronics', address: '142 Main St, Suite 200', time: '8:30 AM', status: 'completed', plannedMin: 15, actualMin: 14 },
      { num: 2, name: 'Fresh Market Grocery', address: '88 Oak Avenue', time: '9:15 AM', status: 'completed', plannedMin: 12, actualMin: 11 },
      { num: 3, name: 'Tech Solutions Inc.', address: '305 Commerce Blvd, Floor 3', time: '10:00 AM', status: 'completed', plannedMin: 20, actualMin: 18 },
      { num: 4, name: 'Green Valley Pharmacy', address: '22 Health Park Dr', time: '10:45 AM', status: 'current', plannedMin: 10, actualMin: 9 },
      { num: 5, name: 'City Library Branch', address: '500 Knowledge Way', time: '11:30 AM', status: 'upcoming', plannedMin: 14, actualMin: 0 },
      { num: 6, name: 'Harbor View Restaurant', address: '77 Waterfront Ave', time: '12:15 PM', status: 'upcoming', plannedMin: 8, actualMin: 0 },
      { num: 7, name: 'Summit Fitness Center', address: '410 Hilltop Rd', time: '1:00 PM', status: 'upcoming', plannedMin: 7, actualMin: 0 },
      { num: 8, name: 'Riverside Office Park', address: '1200 River Rd, Building C', time: '2:00 PM', status: 'upcoming', plannedMin: 15, actualMin: 0 }
    ],
    schedule: [
      { time: '7:00 AM', title: 'Shift Start', desc: 'Check in and load vehicle FL-101', type: 'shift', status: 'completed' },
      { time: '7:30 AM', title: 'Pre-Route Check', desc: 'Verify packages and route plan', type: 'check', status: 'completed' },
      { time: '8:00 AM', title: 'Route RT-204 Start', desc: 'Begin Downtown Circuit route', type: 'route', status: 'completed' },
      { time: '8:30 AM', title: 'Stop 1 — Metro Electronics', desc: '3 packages, 12.4 kg', type: 'delivery', status: 'completed' },
      { time: '9:15 AM', title: 'Stop 2 — Fresh Market', desc: '5 packages, 28.1 kg', type: 'delivery', status: 'completed' },
      { time: '10:00 AM', title: 'Stop 3 — Tech Solutions', desc: '2 packages, 8.7 kg', type: 'delivery', status: 'completed' },
      { time: '10:45 AM', title: 'Stop 4 — Green Valley Pharmacy', desc: '4 packages, 6.2 kg', type: 'delivery', status: 'current' },
      { time: '11:30 AM', title: 'Stop 5 — City Library', desc: '8 packages, 32.5 kg', type: 'delivery', status: 'upcoming' },
      { time: '12:00 PM', title: 'Lunch Break', desc: '30 minutes', type: 'break', status: 'upcoming' },
      { time: '12:15 PM', title: 'Stop 6 — Harbor View Restaurant', desc: '2 packages, 15.8 kg', type: 'delivery', status: 'upcoming' },
      { time: '1:00 PM', title: 'Stop 7 — Summit Fitness', desc: '1 package, 4.3 kg', type: 'delivery', status: 'upcoming' },
      { time: '2:00 PM', title: 'Stop 8 — Riverside Office Park', desc: '6 packages, 22.0 kg', type: 'delivery', status: 'upcoming' },
      { time: '2:45 PM', title: 'Route Complete', desc: 'Return to depot', type: 'route', status: 'upcoming' },
      { time: '3:00 PM', title: 'Shift End', desc: 'Check out and vehicle inspection', type: 'shift', status: 'upcoming' }
    ],
    timeDist: [
      { label: 'Driving', value: 4.2, color: '#06B6D4' },
      { label: 'Delivery', value: 2.1, color: '#8B5CF6' },
      { label: 'Waiting', value: 0.8, color: '#F59E0B' },
      { label: 'Break', value: 0.5, color: '#10B981' }
    ],
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      deliveries: [22, 26, 24, 29, 26],
      onTime: [94, 96, 95, 98, 97],
      distance: [118, 132, 124, 141, 128],
      hours: [7.1, 7.4, 6.9, 7.8, 7.2]
    },
    perf: {
      score: 92,
      deliveriesCompleted: 156,
      onTimeRate: 97.2,
      distanceCovered: 1240,
      avgRouteEfficiency: 93,
      deliverablesPerHour: 4.6,
      avgStopMin: 12,
      drivingHours: 84,
      activeHours: 112,
      rankPct: 15,
      monthDeliveries: [124, 138, 129, 142, 150, 156],
      monthLabels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      efficiencyTrend: [84, 87, 89, 90, 92, 93],
      productivity: [
        { label: 'Deliveries / Hour', value: 4.6 },
        { label: 'Avg Stop Duration', value: 12 },
        { label: 'Driving Hours', value: 84 },
        { label: 'Active Hours', value: 112 }
      ],
      insights: [
        { icon: 'route', title: 'Best route efficiency this week', desc: 'RT-204 hit 96% efficiency — 14 km saved vs plan.' },
        { icon: 'streak', title: 'Delivery streak extended', desc: '11 consecutive days with zero late deliveries.' },
        { icon: 'speed', title: 'Fastest average delivery time', desc: '12.4 min average across this week’s 26 stops.' },
        { icon: 'trend', title: 'On-time performance improved', desc: '97.2% on-time — up 2.1% from last month.' }
      ]
    }
  };

  /* ═══════════════════════════════════════
     SPA NAVIGATION
     ═══════════════════════════════════════ */

  var navLinks = document.querySelectorAll('.drv-nav-link');
  var contentEl = document.getElementById('drv-content');
  var topbarTitle = document.getElementById('topbar-title');

  function setActiveNav(view) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.view === view);
    });
  }

  function navigateTo(view) {
    if (currentView === view) return;
    currentView = view;

    var link = document.querySelector('.drv-nav-link[data-view="' + view + '"]');
    var title = link ? link.dataset.title : 'Dashboard';
    if (topbarTitle) topbarTitle.textContent = title;
    document.title = title + ' | Stackly';
    setActiveNav(view);
    closeSidebar();

    destroyAllCharts();

    contentEl.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'drv-view';
    contentEl.appendChild(wrapper);

    switch (view) {
      case 'overview': renderOverview(wrapper); break;
      case 'route': renderRoute(wrapper); break;
      case 'deliveries': renderDeliveries(wrapper); break;
      case 'schedule': renderSchedule(wrapper); break;
      case 'performance': renderPerformance(wrapper); break;
      case 'profile': renderProfile(wrapper); break;
      default: renderOverview(wrapper); break;
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo(this.dataset.view);
    });
  });

  var dropdownItems = profileDropdown ? profileDropdown.querySelectorAll('[data-view]') : [];
  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo(this.dataset.view);
    });
  });

  function getHashView() {
    var hash = window.location.hash.replace('#', '');
    if (['overview', 'route', 'deliveries', 'schedule', 'performance', 'profile'].indexOf(hash) !== -1) return hash;
    return 'overview';
  }
  window.addEventListener('hashchange', function () { navigateTo(getHashView()); });
  navigateTo(getHashView());

  /* ═══════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════ */

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function showToast(msg) {
    var toast = document.getElementById('drv-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  function getDeliveredCount() {
    return state.deliveries.filter(function (d) { return d.status === 'delivered'; }).length;
  }
  function getIssueCount() {
    return state.deliveries.filter(function (d) { return d.status === 'issue'; }).length;
  }
  function getInProgressCount() {
    return state.deliveries.filter(function (d) { return d.status === 'inprogress'; }).length;
  }
  function getPendingCount() {
    return state.deliveries.filter(function (d) { return d.status === 'pending'; }).length;
  }
  function getCompletedStops() {
    return state.stops.filter(function (s) { return s.status === 'completed'; }).length;
  }
  function getCurrentStop() {
    return state.stops.filter(function (s) { return s.status === 'current'; })[0] || null;
  }
  function getNextStop() {
    var cur = getCurrentStop();
    if (cur) return cur;
    var upcoming = state.stops.filter(function (s) { return s.status === 'upcoming'; })[0];
    return upcoming || null;
  }

  function animateCounter(el, target, suffix, decimals, duration) {
    suffix = suffix || '';
    decimals = decimals || 0;
    duration = duration || 900;
    if (prefersReducedMotion) {
      el.textContent = (typeof target === 'number' ? target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : target) + suffix;
      return;
    }
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runCounters(container) {
    setTimeout(function () {
      container.querySelectorAll('[data-count]').forEach(function (el) {
        animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '', parseInt(el.dataset.decimals, 10) || 0);
      });
    }, 80);
  }

  function formatStatus(s) {
    var map = { pending: 'Pending', inprogress: 'In Progress', delivered: 'Delivered', issue: 'Issue' };
    return map[s] || s;
  }

  function icon(name) {
    var icons = {
      pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      nav: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      route: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
      box: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      flag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
      bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      streak: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      speed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
      trend: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
      fuel: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    };
    return icons[name] || '';
  }

  /* ═══════════════════════════════════════
     CHART HELPERS (Chart.js — same lib as Fleet)
     ═══════════════════════════════════════ */

  function gradient(ctx, c1, c2) {
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 100);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
  }

  function makeChart(id, cfg) {
    if (typeof Chart === 'undefined') return null;
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    var existing = chartInstances[id];
    if (existing) { existing.destroy(); chartInstances[id] = null; }
    var ctx = canvas.getContext('2d');
    chartInstances[id] = new Chart(ctx, cfg);
    return chartInstances[id];
  }

  function destroyAllCharts() {
    Object.keys(chartInstances).forEach(function (k) {
      if (chartInstances[k]) { chartInstances[k].destroy(); chartInstances[k] = null; }
    });
    chartInstances = {};
  }

  var chartBase = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(148, 163, 184, 0.15)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: false
      }
    }
  };

  function chartDefaults() {
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = '#94A3B8';
      Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.08)';
      Chart.defaults.font = { family: "'Inter', system-ui, sans-serif", size: 11 };
      Chart.defaults.plugins.tooltip = {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(148, 163, 184, 0.15)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: false
      };
      if (prefersReducedMotion) {
        Chart.defaults.animation = false;
      }
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
    }
  }
  chartDefaults();

  function makeChart(id, cfg) {
    if (typeof Chart === 'undefined') return null;
    var canvas = document.getElementById(id);
    if (!canvas) return null;
    var existing = chartInstances[id];
    if (existing) { existing.destroy(); chartInstances[id] = null; }
    var ctx = canvas.getContext('2d');
    chartInstances[id] = new Chart(ctx, cfg);
    return chartInstances[id];
  }

  /* ═══════════════════════════════════════
     VIEW: OVERVIEW — Operational Command Center
     ═══════════════════════════════════════ */

  function renderOverview(container) {
    var firstName = userName.split(' ')[0];
    var delivered = getDeliveredCount();
    var total = state.deliveries.length;
    var completedStops = getCompletedStops();
    var totalStops = state.stops.length;
    var nextStop = getNextStop();
    var remaining = totalStops - completedStops;
    var pct = Math.round((completedStops / totalStops) * 100);
    var onTimeToday = 100; // demo — all completed deliveries were on time
    var pace = 100; // demo — on track
    var statusTxt = 'On Track';
    var statusCls = 'good';

    var heroStats =
      '<div class="drv-brief-metrics">' +
        '<span class="drv-brief-pill"><strong>' + totalStops + '</strong> stops scheduled</span>' +
        '<span class="drv-brief-pill"><strong>' + completedStops + '</strong> completed</span>' +
        '<span class="drv-brief-pill"><strong>' + remaining + '</strong> remaining</span>' +
      '</div>';

    container.innerHTML = '' +
      '<div class="drv-brief drv-panel">' +
        '<div class="drv-brief-left">' +
          '<p class="drv-eyebrow">Daily Briefing</p>' +
          '<h2 class="drv-brief-title">' + getGreeting() + ', ' + firstName + '</h2>' +
          '<p class="drv-brief-sub">Here’s what’s ahead on your route today.</p>' +
          heroStats +
        '</div>' +
        '<div class="drv-brief-right">' +
          '<span class="drv-brief-status drv-brief-status--' + statusCls + '">' + icon('check') + statusTxt + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="drv-kpi-zone">' +
        '<div class="drv-kpi drv-kpi--ring">' +
          '<div class="drv-ring" style="--pct:' + pct + '"><div class="drv-ring-inner"><span class="drv-ring-val">' + pct + '%</span><span class="drv-ring-label">Route</span></div></div>' +
          '<div class="drv-kpi-body">' +
            '<div class="drv-kpi-label">Route Progress</div>' +
            '<div class="drv-kpi-big" data-count="' + completedStops + '" data-suffix="/' + totalStops + '">0/' + totalStops + '</div>' +
            '<div class="drv-kpi-sub">' + (totalStops - completedStops) + ' stops to go</div>' +
            '<div class="drv-bar"><div class="drv-bar-fill" style="width:' + pct + '%"></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="drv-kpi">' +
          '<div class="drv-kpi-head"><span class="drv-kpi-label">Deliveries Done</span>' + icon('box') + '</div>' +
          '<div class="drv-kpi-big accent" data-count="' + delivered + '">0</div>' +
          '<div class="drv-kpi-trend up">' + icon('trend') + ' +2 vs yesterday</div>' +
          '<div class="drv-spark" id="spark-deliveries"><canvas id="spark-canvas-deliveries"></canvas></div>' +
        '</div>' +

        '<div class="drv-kpi">' +
          '<div class="drv-kpi-head"><span class="drv-kpi-label">Distance Covered</span>' + icon('pin') + '</div>' +
          '<div class="drv-kpi-big" data-count="' + state.route.completedDistance + '" data-suffix=" km">0 km</div>' +
          '<div class="drv-kpi-trend up">' + icon('trend') + ' 44% of route</div>' +
          '<div class="drv-spark" id="spark-distance"><canvas id="spark-canvas-distance"></canvas></div>' +
        '</div>' +

        '<div class="drv-kpi">' +
          '<div class="drv-kpi-head"><span class="drv-kpi-label">Active Driving</span>' + icon('clock') + '</div>' +
          '<div class="drv-kpi-big violet" data-count="2" data-suffix="h ">0h </div>' +
          '<div class="drv-kpi-trend up">' + icon('check') + ' 4h 12m planned</div>' +
          '<div class="drv-spark" id="spark-time"><canvas id="spark-canvas-time"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-overview-grid">' +
        '<div class="drv-panel drv-route-viz">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Route RT-204</div><div class="drv-panel-sub">' + state.route.name + ' · ' + completedStops + ' of ' + totalStops + ' stops</div></div><span class="drv-badge drv-badge--live">' + icon('bolt') + ' Live</span></div>' +
          buildRouteMap() +
          '<div class="drv-route-viz-stats">' +
            '<div><span class="drv-route-viz-val">' + pct + '%</span><span class="drv-route-viz-label">Progress</span></div>' +
            '<div><span class="drv-route-viz-val">' + state.route.completedDistance + ' km</span><span class="drv-route-viz-label">Covered</span></div>' +
            '<div><span class="drv-route-viz-val">' + state.route.eta + '</span><span class="drv-route-viz-label">Est. Done</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="drv-panel drv-next-intel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Next Stop</div><div class="drv-panel-sub">Stop ' + (nextStop ? nextStop.num : '—') + ' of ' + totalStops + '</div></div><span class="drv-badge drv-badge--accent">' + icon('nav') + ' Navigate</span></div>' +
          (nextStop ? (
            '<div class="drv-next-body">' +
              '<div class="drv-next-name">' + nextStop.name + '</div>' +
              '<div class="drv-next-addr">' + icon('pin') + ' ' + nextStop.address + '</div>' +
              '<div class="drv-next-meta">' +
                '<div><span class="drv-next-meta-label">Window</span><span class="drv-next-meta-val">' + nextStop.time + '</span></div>' +
                '<div><span class="drv-next-meta-label">Est. Arrival</span><span class="drv-next-meta-val">' + state.route.eta + '</span></div>' +
                '<div><span class="drv-next-meta-label">Pkgs</span><span class="drv-next-meta-val">' + (state.deliveries[nextStop.num - 1] ? state.deliveries[nextStop.num - 1].packages : '—') + '</span></div>' +
              '</div>' +
              '<div class="drv-next-actions">' +
                '<a class="drv-btn drv-btn-primary drv-btn-sm drv-btn-flex" href="../404.html">' + icon('nav') + ' Navigate</a>' +
                '<a class="drv-btn drv-btn-outline drv-btn-sm drv-btn-flex" href="../404.html">View Route</a>' +
              '</div>' +
            '</div>'
          ) : '<p class="drv-empty">No upcoming stop.</p>') +
        '</div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Delivery Completion</div><div class="drv-panel-sub">Today · planned vs actual</div></div><span class="drv-badge drv-badge--accent">' + delivered + ' of ' + total + '</span></div>' +
          '<div class="drv-chart-box" style="height:230px;"><canvas id="ov-completion"></canvas></div>' +
        '</div>' +

        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Time Performance</div><div class="drv-panel-sub">Planned vs actual timing</div></div><span class="drv-badge drv-badge--emerald">' + state.route.timeSavedMin + ' min saved</span></div>' +
          '<div class="drv-time-bars">' +
            '<div class="drv-time-row"><span class="drv-time-label">Driving</span><div class="drv-time-track"><div class="drv-time-fill" style="width:64%"></div></div><span class="drv-time-val">4h 12m</span></div>' +
            '<div class="drv-time-row"><span class="drv-time-label">Stops</span><div class="drv-time-track"><div class="drv-time-fill violet" style="width:41%"></div></div><span class="drv-time-val">2h 8m</span></div>' +
            '<div class="drv-time-row"><span class="drv-time-label">Waiting</span><div class="drv-time-track"><div class="drv-time-fill amber" style="width:18%"></div></div><span class="drv-time-val">38m</span></div>' +
            '<div class="drv-time-row"><span class="drv-time-label">Saved</span><div class="drv-time-track"><div class="drv-time-fill emerald" style="width:12%"></div></div><span class="drv-time-val">18m</span></div>' +
          '</div>' +
          '<div class="drv-time-note">' + icon('bolt') + ' You’re 12 min ahead of the planned schedule.</div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-quick-actions">' +
        '<button class="drv-quick-action" data-nav="route"><div class="drv-quick-action-icon drv-quick-action-icon--cyan">' + icon('route') + '</div>My Route</button>' +
        '<button class="drv-quick-action" data-nav="deliveries"><div class="drv-quick-action-icon drv-quick-action-icon--emerald">' + icon('box') + '</div>Deliveries</button>' +
        '<button class="drv-quick-action" data-nav="schedule"><div class="drv-quick-action-icon drv-quick-action-icon--violet">' + icon('clock') + '</div>Schedule</button>' +
        '<button class="drv-quick-action" id="drv-report-issue"><div class="drv-quick-action-icon drv-quick-action-icon--amber">' + icon('flag') + '</div>Report Issue</button>' +
      '</div>';

    document.querySelectorAll('.drv-quick-action[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigateTo(this.dataset.nav); });
    });
    var reportBtn = document.getElementById('drv-report-issue');
    if (reportBtn) reportBtn.addEventListener('click', function () { showToast('Issue reported — support notified'); });

    runCounters(container);

    setTimeout(function () {
      makeChart('ov-completion', {
        type: 'line',
        data: {
          labels: ['7a', '8a', '9a', '10a', '11a', '12p', '1p'],
          datasets: [
            { label: 'Planned', data: [0, 1, 2, 4, 5, 6, 8], borderColor: '#64748B', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: 0.35 },
            { label: 'Actual', data: [0, 1, 3, 4, 5, 6, 7], borderColor: '#06B6D4', borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#06B6D4', tension: 0.35, fill: true, backgroundColor: function (c) { return gradient(c.chart.ctx, 'rgba(6,182,212,0.25)', 'rgba(6,182,212,0)'); } }
          ]
        },
        options: Object.assign({}, chartBase, {
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { stepSize: 2, font: { size: 10 } } }
          },
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 14 } } }
        })
      });

      makeChart('spark-canvas-deliveries', {
        type: 'line',
        data: { labels: ['', '', '', '', '', '', ''], datasets: [{ data: [4, 6, 5, 8, 7, 9, 8], borderColor: '#06B6D4', borderWidth: 2, pointRadius: 0, tension: 0.4 }] },
        options: Object.assign({}, chartBase, { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } })
      });
      makeChart('spark-canvas-distance', {
        type: 'line',
        data: { labels: ['', '', '', '', '', '', ''], datasets: [{ data: [8, 12, 16, 20, 26, 31, 38], borderColor: '#8B5CF6', borderWidth: 2, pointRadius: 0, tension: 0.4 }] },
        options: Object.assign({}, chartBase, { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } })
      });
      makeChart('spark-canvas-time', {
        type: 'line',
        data: { labels: ['', '', '', '', '', '', ''], datasets: [{ data: [0.4, 0.8, 1.1, 1.4, 1.7, 1.9, 2.2], borderColor: '#10B981', borderWidth: 2, pointRadius: 0, tension: 0.4 }] },
        options: Object.assign({}, chartBase, { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } })
      });
    }, 120);
  }

  function buildRouteMap() {
    var w = 640, h = 220;
    var positions = [
      [40, 180], [120, 150], [200, 165], [280, 120], [360, 140],
      [440, 100], [520, 115], [600, 70]
    ];
    var completed = getCompletedStops();
    var fullPath = 'M' + positions[0][0] + ' ' + positions[0][1];
    for (var i = 1; i < positions.length; i++) fullPath += ' L' + positions[i][0] + ' ' + positions[i][1];
    var donePath = '';
    if (completed > 0) {
      donePath = 'M' + positions[0][0] + ' ' + positions[0][1];
      for (var j = 1; j < completed && j < positions.length; j++) donePath += ' L' + positions[j][0] + ' ' + positions[j][1];
    }
    var dots = '';
    state.stops.forEach(function (s, idx) {
      var pos = positions[idx];
      var cls = s.status === 'completed' ? 'drv-map-dot drv-map-dot--done' : (s.status === 'current' ? 'drv-map-dot drv-map-dot--current' : 'drv-map-dot drv-map-dot--up');
      dots += '<circle class="' + cls + '" cx="' + pos[0] + '" cy="' + pos[1] + '" r="7"/>' +
              '<text x="' + pos[0] + '" y="' + (pos[1] - 13) + '" class="drv-map-label">' + s.num + '</text>';
    });
    var cur = positions[Math.min(completed, positions.length - 1)];
    return '<div class="drv-map-box">' +
      '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet">' +
        '<path class="drv-map-path" d="' + fullPath + '"/>' +
        (donePath ? '<path class="drv-map-path drv-map-path--done" d="' + donePath + '"/>' : '') +
        dots +
        '<g class="drv-map-vehicle" transform="translate(' + cur[0] + ' ' + (cur[1] - 6) + ')"><circle r="5" fill="#06B6D4"/><circle r="9" fill="#06B6D4" opacity="0.2"/></g>' +
      '</svg>' +
      '<span class="drv-map-legend drv-map-legend--done">' + completed + ' done</span>' +
      '<span class="drv-map-legend drv-map-legend--up">' + (state.stops.length - completed) + ' ahead</span>' +
    '</div>';
  }

  /* ═══════════════════════════════════════
     VIEW: MY ROUTE
     ═══════════════════════════════════════ */

  function renderRoute(container) {
    var completedStops = getCompletedStops();
    var totalStops = state.stops.length;
    var routeStatus = state.route.status;
    var pct = Math.round((completedStops / totalStops) * 100);

    var routeActions = '';
    if (routeStatus === 'ready') {
      routeActions = '<button class="drv-btn drv-btn-primary drv-btn-full" id="drv-route-start">Start Route</button>';
    } else if (routeStatus === 'active') {
      routeActions = '<a class="drv-btn drv-btn-primary drv-btn-flex" href="../404.html">' + icon('nav') + ' Navigate</a><button class="drv-btn drv-btn-outline drv-btn-flex" id="drv-route-pause">Pause</button><button class="drv-btn drv-btn-danger drv-btn-flex" id="drv-route-complete">Complete</button>';
    } else if (routeStatus === 'paused') {
      routeActions = '<button class="drv-btn drv-btn-primary drv-btn-flex" id="drv-route-resume">' + icon('nav') + ' Resume</button><button class="drv-btn drv-btn-outline drv-btn-flex" id="drv-route-complete">Complete</button>';
    } else {
      routeActions = '<div class="drv-empty">Route completed — nice work.</div>';
    }

    container.innerHTML = '' +
      '<div class="drv-route-summary drv-panel">' +
        '<div class="drv-route-summary-id">' +
          '<span class="drv-eyebrow">My Route</span>' +
          '<h2 class="drv-route-summary-title">' + state.route.id + '</h2>' +
          '<p class="drv-route-summary-name">' + state.route.name + '</p>' +
        '</div>' +
        '<div class="drv-route-summary-grid">' +
          '<div class="drv-rs-cell"><span class="drv-rs-val">' + totalStops + '</span><span class="drv-rs-label">Stops</span></div>' +
          '<div class="drv-rs-cell"><span class="drv-rs-val">' + state.route.distance + ' km</span><span class="drv-rs-label">Distance</span></div>' +
          '<div class="drv-rs-cell"><span class="drv-rs-val">' + state.route.plannedDurationMin + 'm</span><span class="drv-rs-label">Est. Time</span></div>' +
          '<div class="drv-rs-cell"><span class="drv-rs-val">' + state.route.efficiency + '%</span><span class="drv-rs-label">Efficiency</span></div>' +
        '</div>' +
        '<div class="drv-rs-progress"><div class="drv-rs-progress-head"><span>' + completedStops + ' of ' + totalStops + ' stops</span><span>' + pct + '%</span></div><div class="drv-bar"><div class="drv-bar-fill" style="width:' + pct + '%"></div></div></div>' +
        '<div class="drv-rs-actions">' + routeActions + '</div>' +
      '</div>' +

      '<div class="drv-panel drv-route-bigmap">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Route Visualization</div><div class="drv-panel-sub">Live progress along RT-204</div></div><span class="drv-badge drv-badge--live">' + icon('bolt') + ' ' + routeStatus.charAt(0).toUpperCase() + routeStatus.slice(1) + '</span></div>' +
        '<div style="height:300px;">' + buildRouteMap() + '</div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Route Efficiency</div><div class="drv-panel-sub">Distance planned vs actual</div></div><span class="drv-badge drv-badge--emerald">' + state.route.timeSavedMin + ' min saved</span></div>' +
          '<div class="drv-chart-box" style="height:230px;"><canvas id="rt-efficiency"></canvas></div>' +
        '</div>' +

        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Stop Performance</div><div class="drv-panel-sub">Planned vs actual stop time</div></div></div>' +
          '<div class="drv-chart-box" style="height:230px;"><canvas id="rt-stops"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Route Timeline</div><div class="drv-panel-sub">Activity along the way</div></div></div>' +
        '<div class="drv-timeline drv-timeline--route">' +
          state.schedule.slice(0, 9).map(function (item) {
            var cls = 'drv-timeline-item ' + item.status;
            return '<div class="' + cls + '"><div class="drv-timeline-dot">' + (item.status === 'completed' ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '') + '</div><div class="drv-timeline-time">' + item.time + '</div><div class="drv-timeline-title">' + item.title + '</div><div class="drv-timeline-desc">' + item.desc + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>';

    var rs = document.getElementById('drv-route-start');
    if (rs) rs.addEventListener('click', function () { updateRouteStatus('active'); navigateTo('route'); showToast('Route started'); });
    var rp = document.getElementById('drv-route-pause');
    if (rp) rp.addEventListener('click', function () { updateRouteStatus('paused'); navigateTo('route'); showToast('Route paused'); });
    var rr = document.getElementById('drv-route-resume');
    if (rr) rr.addEventListener('click', function () { updateRouteStatus('active'); navigateTo('route'); showToast('Route resumed'); });
    var rc = document.getElementById('drv-route-complete');
    if (rc) rc.addEventListener('click', function () {
      updateRouteStatus('completed');
      state.stops.forEach(function (s) { s.status = 'completed'; });
      state.deliveries.forEach(function (d) { if (d.status !== 'delivered') d.status = 'delivered'; });
      navigateTo('route');
      showToast('Route completed!');
    });

    setTimeout(function () {
      var planned = state.stops.map(function (s) { return s.plannedMin; });
      var actual = state.stops.map(function (s) { return s.actualMin; });
      makeChart('rt-efficiency', {
        type: 'bar',
        data: {
          labels: ['Planned', 'Actual'],
          datasets: [{ label: 'Distance (km)', data: [86, 74], backgroundColor: ['rgba(100,116,139,0.5)', 'rgba(6,182,212,0.75)'], borderRadius: 6, borderSkipped: false, barPercentage: 0.5 }]
        },
        options: Object.assign({}, chartBase, {
          indexAxis: 'y',
          scales: { x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { font: { size: 10 } } }, y: { grid: { display: false } } }
        })
      });
      makeChart('rt-stops', {
        type: 'bar',
        data: {
          labels: state.stops.map(function (s) { return 'S' + s.num; }),
          datasets: [
            { label: 'Planned', data: planned, backgroundColor: 'rgba(100,116,139,0.4)', borderRadius: 4, borderSkipped: false },
            { label: 'Actual', data: actual, backgroundColor: 'rgba(6,182,212,0.75)', borderRadius: 4, borderSkipped: false }
          ]
        },
        options: Object.assign({}, chartBase, {
          scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { font: { size: 10 } } } },
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 14 } } }
        })
      });
    }, 120);
  }

  /* ═══════════════════════════════════════
     VIEW: DELIVERIES
     ═══════════════════════════════════════ */

  function renderDeliveries(container) {
    var delivered = getDeliveredCount();
    var total = state.deliveries.length;
    var pending = getPendingCount();
    var inProg = getInProgressCount();
    var issues = getIssueCount();

    var list = state.deliveries.map(function (d, i) {
      var statusCls = 'drv-badge drv-badge--' + (d.status === 'delivered' ? 'emerald' : d.status === 'inprogress' ? 'accent' : d.status === 'issue' ? 'danger' : 'muted');
      var actions = '';
      if (d.status === 'pending') actions = '<button class="drv-btn drv-btn-primary drv-btn-sm drv-del-start" data-idx="' + i + '">Start</button>';
      else if (d.status === 'inprogress') actions = '<button class="drv-btn drv-btn-primary drv-btn-sm drv-del-complete" data-idx="' + i + '">Complete</button><button class="drv-btn drv-btn-danger drv-btn-sm drv-del-issue" data-idx="' + i + '">Issue</button>';
      return '<div class="drv-del-row">' +
        '<div class="drv-del-row-icon">' + icon('box') + '</div>' +
        '<div class="drv-del-row-main"><div class="drv-del-row-id">' + d.id + '</div><div class="drv-del-row-cust">' + d.customer + '</div><div class="drv-del-row-addr">' + icon('pin') + ' ' + d.address + '</div></div>' +
        '<div class="drv-del-row-meta"><span>' + d.packages + ' pkgs</span><span>' + d.weight + '</span><span>' + d.time + '</span></div>' +
        '<div class="drv-del-row-side"><span class="' + statusCls + '">' + formatStatus(d.status) + '</span>' + (actions ? '<div class="drv-del-row-actions">' + actions + '</div>' : '') + '</div>' +
      '</div>';
    }).join('');

    container.innerHTML = '' +
      '<div class="drv-del-summary drv-panel">' +
        '<div class="drv-del-summary-head"><div><span class="drv-eyebrow">Deliveries</span><h2 class="drv-del-summary-title">Today’s Deliveries</h2><p class="drv-del-summary-sub">' + delivered + ' of ' + total + ' completed</p></div><div class="drv-del-summary-ring" style="--pct:' + Math.round(delivered / total * 100) + '"><div class="drv-del-summary-ring-inner">' + Math.round(delivered / total * 100) + '%</div></div></div>' +
        '<div class="drv-del-summary-stats">' +
          '<div class="drv-ds-cell"><span class="drv-ds-val emerald">' + delivered + '</span><span class="drv-ds-label">Completed</span></div>' +
          '<div class="drv-ds-cell"><span class="drv-ds-val accent">' + inProg + '</span><span class="drv-ds-label">In Progress</span></div>' +
          '<div class="drv-ds-cell"><span class="drv-ds-val">' + pending + '</span><span class="drv-ds-label">Pending</span></div>' +
          '<div class="drv-ds-cell"><span class="drv-ds-val rose">' + issues + '</span><span class="drv-ds-label">Issues</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Delivery Status</div><div class="drv-panel-sub">Distribution of today’s deliveries</div></div></div>' +
          '<div class="drv-chart-box" style="height:220px;"><canvas id="dl-status"></canvas></div>' +
        '</div>' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Weekly Trend</div><div class="drv-panel-sub">Deliveries completed per day</div></div><span class="drv-badge drv-badge--accent">+12% WoW</span></div>' +
          '<div class="drv-chart-box" style="height:220px;"><canvas id="dl-trend"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Delivery List</div><div class="drv-panel-sub">' + total + ' items</div></div><div class="drv-toolbar"><button class="drv-chip-btn active">All</button><button class="drv-chip-btn" data-f="delivered">Done</button><button class="drv-chip-btn" data-f="pending">Pending</button></div></div>' +
        '<div class="drv-del-list">' + list + '</div>' +
      '</div>';

    document.querySelectorAll('.drv-del-start').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx, 10);
        state.deliveries[idx].status = 'inprogress';
        navigateTo('deliveries');
        showToast('Delivery started');
      });
    });
    document.querySelectorAll('.drv-del-complete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx, 10);
        state.deliveries[idx].status = 'delivered';
        var stopIdx = idx;
        if (stopIdx < state.stops.length && state.stops[stopIdx].status !== 'completed') {
          state.stops[stopIdx].status = 'completed';
          if (stopIdx + 1 < state.stops.length && state.stops[stopIdx + 1].status === 'upcoming') state.stops[stopIdx + 1].status = 'current';
        }
        navigateTo('deliveries');
        showToast('Delivery completed');
      });
    });
    document.querySelectorAll('.drv-del-issue').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx, 10);
        state.deliveries[idx].status = 'issue';
        navigateTo('deliveries');
        showToast('Issue reported for ' + state.deliveries[idx].id);
      });
    });
    document.querySelectorAll('.drv-chip-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.drv-chip-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.f || 'all';
        document.querySelectorAll('.drv-del-row').forEach(function (row, i) {
          var d = state.deliveries[i];
          var show = f === 'all' ? true : d.status === f;
          row.style.display = show ? '' : 'none';
        });
      });
    });

    setTimeout(function () {
      makeChart('dl-status', {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Pending', 'Issues'],
          datasets: [{ data: [delivered, inProg, pending, issues], backgroundColor: ['#10B981', '#06B6D4', '#64748B', '#F43F5E'], borderWidth: 0, spacing: 3 }]
        },
        options: Object.assign({}, chartBase, {
          cutout: '68%',
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 12 } } }
        })
      });
      makeChart('dl-trend', {
        type: 'line',
        data: {
          labels: state.weekly.labels,
          datasets: [{ label: 'Deliveries', data: state.weekly.deliveries, borderColor: '#06B6D4', borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#06B6D4', tension: 0.4, fill: true, backgroundColor: function (c) { return gradient(c.chart.ctx, 'rgba(6,182,212,0.22)', 'rgba(6,182,212,0)'); } }]
        },
        options: Object.assign({}, chartBase, {
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' } } }
        })
      });
    }, 120);
  }

  /* ═══════════════════════════════════════
     VIEW: SCHEDULE
     ═══════════════════════════════════════ */

  function renderSchedule(container) {
    var today = new Date();
    var dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    container.innerHTML = '' +
      '<div class="drv-panel drv-sched-head">' +
        '<div><span class="drv-eyebrow">Schedule</span><h2 class="drv-sched-title">' + dateStr + '</h2><p class="drv-sched-sub">Your planned day at a glance</p></div>' +
        '<div class="drv-sched-shift"><span class="drv-sched-shift-label">Shift</span><span class="drv-sched-shift-val">7:00 AM – 3:00 PM</span></div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Time Distribution</div><div class="drv-panel-sub">How your shift breaks down</div></div></div>' +
          '<div class="drv-chart-box" style="height:240px;"><canvas id="sc-time-dist"></canvas></div>' +
        '</div>' +
        '<div class="drv-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Weekly Workload</div><div class="drv-panel-sub">Deliveries and hours this week</div></div></div>' +
          '<div class="drv-chart-box" style="height:240px;"><canvas id="sc-weekly"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Today’s Timeline</div><div class="drv-panel-sub">Delivery windows and breaks</div></div></div>' +
        '<div class="drv-timeline drv-timeline--route">' +
          state.schedule.map(function (item) {
            var cls = 'drv-timeline-item ' + item.status;
            return '<div class="' + cls + '"><div class="drv-timeline-dot">' + (item.status === 'completed' ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '') + '</div><div class="drv-timeline-time">' + item.time + '</div><div class="drv-timeline-title">' + item.title + '</div><div class="drv-timeline-desc">' + item.desc + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Upcoming Assignments</div><div class="drv-panel-sub">Next scheduled work</div></div></div>' +
        '<div class="drv-assign">' +
          '<div class="drv-assign-row"><div class="drv-assign-date"><span class="drv-assign-day">Thu</span><span class="drv-assign-num">5</span></div><div class="drv-assign-info"><div class="drv-assign-title">Route RT-208 · North Express</div><div class="drv-assign-sub">8 stops · 67 km · 7:00 AM</div></div><span class="drv-badge drv-badge--muted">Assigned</span></div>' +
          '<div class="drv-assign-row"><div class="drv-assign-date"><span class="drv-assign-day">Fri</span><span class="drv-assign-num">6</span></div><div class="drv-assign-info"><div class="drv-assign-title">Route RT-211 · Industrial Loop</div><div class="drv-assign-sub">15 stops · 38 km · 7:30 AM</div></div><span class="drv-badge drv-badge--muted">Assigned</span></div>' +
          '<div class="drv-assign-row"><div class="drv-assign-date"><span class="drv-assign-day">Sat</span><span class="drv-assign-num">7</span></div><div class="drv-assign-info"><div class="drv-assign-title">Weekend Depot Shift</div><div class="drv-assign-sub">Loading & inspection · 8:00 AM</div></div><span class="drv-badge drv-badge--accent">Optional</span></div>' +
        '</div>' +
      '</div>';

    setTimeout(function () {
      makeChart('sc-time-dist', {
        type: 'doughnut',
        data: {
          labels: state.timeDist.map(function (t) { return t.label; }),
          datasets: [{ data: state.timeDist.map(function (t) { return t.value; }), backgroundColor: state.timeDist.map(function (t) { return t.color; }), borderWidth: 0, spacing: 3 }]
        },
        options: Object.assign({}, chartBase, {
          cutout: '66%',
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 12 } } }
        })
      });
      makeChart('sc-weekly', {
        type: 'bar',
        data: {
          labels: state.weekly.labels,
          datasets: [
            { label: 'Deliveries', data: state.weekly.deliveries, backgroundColor: 'rgba(6,182,212,0.75)', borderRadius: 5, borderSkipped: false, yAxisID: 'y' },
            { label: 'Hours', data: state.weekly.hours, type: 'line', borderColor: '#8B5CF6', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#8B5CF6', tension: 0.4, yAxisID: 'y1', fill: false }
          ]
        },
        options: Object.assign({}, chartBase, {
          scales: {
            x: { grid: { display: false } },
            y: { position: 'left', grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { font: { size: 10 } } },
            y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 } } }
          },
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 14 } } }
        })
      });
    }, 120);
  }

  /* ═══════════════════════════════════════
     VIEW: PERFORMANCE
     ═══════════════════════════════════════ */

  function renderPerformance(container) {
    var p = state.perf;

    var productivityHtml = p.productivity.map(function (item, i) {
      var max = Math.max.apply(null, p.productivity.map(function (x) { return x.value; }));
      var w = Math.round((item.value / max) * 100);
      return '<div class="drv-prod-row"><div class="drv-prod-label">' + item.label + '</div><div class="drv-prod-track"><div class="drv-prod-fill" style="width:' + w + '%"></div></div><div class="drv-prod-val">' + item.value + '</div></div>';
    }).join('');

    container.innerHTML = '' +
      '<div class="drv-perf-hero drv-panel">' +
        '<div class="drv-score-ring" style="--pct:92"><div class="drv-score-inner"><span class="drv-score-val" data-count="92">0</span><span class="drv-score-max">/100</span></div></div>' +
        '<div class="drv-perf-hero-main">' +
          '<span class="drv-eyebrow">Your Performance</span>' +
          '<h2 class="drv-perf-hero-title">Excellent route efficiency</h2>' +
          '<p class="drv-perf-hero-sub">' + p.onTimeRate + '% on-time rate · Top ' + p.rankPct + '% of drivers</p>' +
          '<div class="drv-perf-hero-badges">' +
            '<span class="drv-badge drv-badge--emerald">' + icon('check') + ' On Track</span>' +
            '<span class="drv-badge drv-badge--accent">' + icon('bolt') + ' +3.2% this month</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel drv-chart-panel drv-chart-panel--wide">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Weekly Performance Trend</div><div class="drv-panel-sub">Deliveries and on-time rate</div></div><div class="drv-toolbar"><button class="drv-chip-btn active" data-m="deliveries">Deliveries</button><button class="drv-chip-btn" data-m="ontime">On-Time %</button></div></div>' +
          '<div class="drv-chart-box" style="height:260px;"><canvas id="pf-weekly"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Route Efficiency Trend</div><div class="drv-panel-sub">Optimization over the months</div></div><span class="drv-badge drv-badge--emerald">' + p.avgRouteEfficiency + '% avg</span></div>' +
          '<div class="drv-chart-box" style="height:230px;"><canvas id="pf-efficiency"></canvas></div>' +
        '</div>' +
        '<div class="drv-panel drv-chart-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Monthly Deliveries</div><div class="drv-panel-sub">Completed deliveries</div></div><span class="drv-badge drv-badge--accent">' + p.deliveriesCompleted + ' total</span></div>' +
          '<div class="drv-chart-box" style="height:230px;"><canvas id="pf-monthly"></canvas></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Productivity Analysis</div><div class="drv-panel-sub">Key drivers of your output</div></div></div>' +
        '<div class="drv-prod">' + productivityHtml + '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Performance Insights</div><div class="drv-panel-sub">What went well</div></div></div>' +
        '<div class="drv-insights">' +
          p.insights.map(function (ins) {
            return '<div class="drv-insight"><div class="drv-insight-icon">' + icon(ins.icon) + '</div><div><div class="drv-insight-title">' + ins.title + '</div><div class="drv-insight-desc">' + ins.desc + '</div></div></div>';
          }).join('') +
        '</div>' +
      '</div>';

    runCounters(container);

    setTimeout(function () {
      makeChart('pf-weekly', {
        type: 'bar',
        data: {
          labels: state.weekly.labels,
          datasets: [{ label: 'Deliveries', data: state.weekly.deliveries, backgroundColor: 'rgba(6,182,212,0.75)', borderRadius: 6, borderSkipped: false }]
        },
        options: Object.assign({}, chartBase, {
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' } } }
        })
      });
      makeChart('pf-efficiency', {
        type: 'line',
        data: {
          labels: p.monthLabels,
          datasets: [{ label: 'Efficiency %', data: p.efficiencyTrend, borderColor: '#8B5CF6', borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#8B5CF6', tension: 0.4, fill: true, backgroundColor: function (c) { return gradient(c.chart.ctx, 'rgba(139,92,246,0.25)', 'rgba(139,92,246,0)'); } }]
        },
        options: Object.assign({}, chartBase, {
          scales: { x: { grid: { display: false } }, y: { min: 80, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; }, font: { size: 10 } } } }
        })
      });
      makeChart('pf-monthly', {
        type: 'line',
        data: {
          labels: p.monthLabels,
          datasets: [{ label: 'Deliveries', data: p.monthDeliveries, borderColor: '#06B6D4', borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#06B6D4', tension: 0.4, fill: true, backgroundColor: function (c) { return gradient(c.chart.ctx, 'rgba(6,182,212,0.22)', 'rgba(6,182,212,0)'); } }]
        },
        options: Object.assign({}, chartBase, {
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' } } }
        })
      });

      // metric switcher
      var pfChart = chartInstances['pf-weekly'];
      var chips = container.querySelectorAll('.drv-chip-btn[data-m]');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          if (!pfChart) return;
          if (chip.dataset.m === 'ontime') {
            pfChart.data.datasets = [{ label: 'On-Time %', data: state.weekly.onTime, backgroundColor: 'rgba(139,92,246,0.75)', borderRadius: 6, borderSkipped: false }];
            pfChart.options.scales.y.max = 100;
            pfChart.options.scales.y.min = 90;
          } else {
            pfChart.data.datasets = [{ label: 'Deliveries', data: state.weekly.deliveries, backgroundColor: 'rgba(6,182,212,0.75)', borderRadius: 6, borderSkipped: false }];
            pfChart.options.scales.y.max = undefined;
            pfChart.options.scales.y.min = undefined;
          }
          pfChart.update();
        });
      });
    }, 120);
  }

  /* ═══════════════════════════════════════
     VIEW: PROFILE
     ═══════════════════════════════════════ */

  function renderProfile(container) {
    var p = state.perf;

    container.innerHTML = '' +
      '<div class="drv-panel drv-profile-card">' +
        '<div class="drv-profile-avatar drv-avatar-lg">' + initials + '</div>' +
        '<div class="drv-profile-card-info"><h2 class="drv-profile-name-heading">' + userName + '</h2><div class="drv-profile-email-text">' + userEmail + '</div><div class="drv-profile-role-section"><span class="drv-status drv-status--active">' + userRole + '</span></div></div>' +
      '</div>' +

      '<div class="drv-chart-row">' +
        '<div class="drv-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Personal Activity</div><div class="drv-panel-sub">Your lifetime field stats</div></div></div>' +
          '<div class="drv-activity">' +
            '<div class="drv-activity-stat"><div class="drv-activity-val" data-count="' + p.deliveriesCompleted + '">0</div><div class="drv-activity-label">Deliveries</div><div class="drv-activity-bar"><div class="drv-activity-fill" style="width:82%"></div></div></div>' +
            '<div class="drv-activity-stat"><div class="drv-activity-val">' + p.drivingHours + 'h</div><div class="drv-activity-label">Driving</div><div class="drv-activity-bar"><div class="drv-activity-fill violet" style="width:64%"></div></div></div>' +
            '<div class="drv-activity-stat"><div class="drv-activity-val">' + p.distanceCovered + ' km</div><div class="drv-activity-label">Distance</div><div class="drv-activity-bar"><div class="drv-activity-fill emerald" style="width:58%"></div></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="drv-panel">' +
          '<div class="drv-panel-head"><div><div class="drv-panel-title">Activity Since Joining</div><div class="drv-panel-sub">Compact overview</div></div></div>' +
          '<div class="drv-activity-compact">' +
            '<div class="drv-activity-cell"><span class="drv-activity-cell-val">' + p.monthLabels.length + ' mo</span><span class="drv-activity-cell-label">Active Months</span></div>' +
            '<div class="drv-activity-cell"><span class="drv-activity-cell-val">' + Math.round(p.avgStopMin) + ' min</span><span class="drv-activity-cell-label">Avg Stop</span></div>' +
            '<div class="drv-activity-cell"><span class="drv-activity-cell-val">' + p.onTimeRate + '%</span><span class="drv-activity-cell-label">On-Time</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Notifications</div></div></div>' +
        '<div class="drv-card-body">' +
          '<div class="drv-settings-row"><div><div class="drv-settings-label">Route Updates</div><div class="drv-settings-desc">Get notified about route changes</div></div><button class="drv-toggle active" role="switch" aria-checked="true" aria-label="Toggle route updates"></button></div>' +
          '<div class="drv-settings-row"><div><div class="drv-settings-label">Delivery Alerts</div><div class="drv-settings-desc">Notifications for delivery status</div></div><button class="drv-toggle active" role="switch" aria-checked="true" aria-label="Toggle delivery alerts"></button></div>' +
          '<div class="drv-settings-row"><div><div class="drv-settings-label">Schedule Reminders</div><div class="drv-settings-desc">Upcoming shift and break reminders</div></div><button class="drv-toggle" role="switch" aria-checked="false" aria-label="Toggle schedule reminders"></button></div>' +
        '</div>' +
      '</div>' +

      '<div class="drv-panel">' +
        '<div class="drv-panel-head"><div><div class="drv-panel-title">Account</div></div></div>' +
        '<div class="drv-card-body">' +
          '<div class="drv-settings-row"><div><div class="drv-settings-label">Change Password</div><div class="drv-settings-desc">Update your account password</div></div><button class="drv-btn drv-btn-outline drv-btn-sm">Change</button></div>' +
          '<div class="drv-settings-row"><div><div class="drv-settings-label" style="color:var(--color-rose);">Sign Out</div><div class="drv-settings-desc">Log out of your account</div></div><button class="drv-btn drv-btn-danger drv-btn-sm" id="drv-profile-logout">Sign Out</button></div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll('.drv-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var isActive = this.classList.toggle('active');
        this.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    });

    var profLogout = document.getElementById('drv-profile-logout');
    if (profLogout) {
      profLogout.addEventListener('click', function () {
        try { localStorage.removeItem('stackly_session'); } catch (e) {}
        window.location.href = '../pages/login.html';
      });
    }
    runCounters(container);
  }

  /* ═══════════════════════════════════════
     STATE MANAGEMENT
     ═══════════════════════════════════════ */

  function updateRouteStatus(newStatus) {
    state.route.status = newStatus;
  }

  function completeStop(stopNum) {
    var idx = stopNum - 1;
    if (idx >= 0 && idx < state.stops.length) {
      state.stops[idx].status = 'completed';
      if (idx < state.deliveries.length) state.deliveries[idx].status = 'delivered';
      if (idx + 1 < state.stops.length) state.stops[idx + 1].status = 'current';
    }
  }

  // resize-safe: Chart.js handles its own responsive resizing via maintainAspectRatio:false
})();