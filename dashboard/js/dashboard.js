/* =====================================================
   Fleet Manager Dashboard — SPA Core
   ===================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chartInstances = {};
  var currentView = null;

  /* ═══════════════════════════════════════
     AUTH CHECK (demo — always allow)
     ═══════════════════════════════════════ */

  var session = null;
  try {
    session = JSON.parse(localStorage.getItem('stackly_session'));
  } catch (e) { session = null; }

  var appEl = document.getElementById('dash-app');

  if (appEl) appEl.style.display = 'flex';

  /* ═══════════════════════════════════════
     USER DATA
     ═══════════════════════════════════════ */

  var userName = (session && session.name) || 'Fleet Manager';
  var userEmail = (session && session.email) || 'user@company.com';
  var userRole = 'Fleet Manager';

  function getInitials(name) {
    var parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  var initials = getInitials(userName);

  // Set user data in UI
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
     SPA NAVIGATION
     ═══════════════════════════════════════ */

  var navLinks = document.querySelectorAll('.dash-nav-link');
  var contentEl = document.getElementById('dash-content');
  var topbarTitle = document.getElementById('topbar-title');

  function setActiveNav(view) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.view === view);
    });
  }

  function navigateTo(view) {
    if (currentView === view) return;
    currentView = view;

    // Destroy old charts
    Object.keys(chartInstances).forEach(function (key) {
      if (chartInstances[key]) { chartInstances[key].destroy(); chartInstances[key] = null; }
    });

    var link = document.querySelector('.dash-nav-link[data-view="' + view + '"]');
    var title = link ? link.dataset.title : 'Dashboard';
    if (topbarTitle) topbarTitle.textContent = title;
    setActiveNav(view);

    closeSidebar();

    // Render view
    contentEl.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'dash-view';
    contentEl.appendChild(wrapper);

    switch (view) {
      case 'overview': renderOverview(wrapper); break;
      case 'fleet': renderFleet(wrapper); break;
      case 'routes': renderRoutes(wrapper); break;
      case 'drivers': renderDrivers(wrapper); break;
      case 'analytics': renderAnalytics(wrapper); break;
      case 'settings': renderSettings(wrapper); break;
      default: renderOverview(wrapper); break;
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo(this.dataset.view);
    });
  });

  // Profile dropdown nav
  var dropdownItems = profileDropdown ? profileDropdown.querySelectorAll('[data-view]') : [];
  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo(this.dataset.view);
    });
  });

  // Hash routing
  function getHashView() {
    var hash = window.location.hash.replace('#', '');
    if (['overview', 'fleet', 'routes', 'drivers', 'analytics', 'settings'].indexOf(hash) !== -1) return hash;
    return 'overview';
  }
  window.addEventListener('hashchange', function () { navigateTo(getHashView()); });

  /* ═══════════════════════════════════════
     CHART.JS DEFAULTS
     ═══════════════════════════════════════ */

  if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.08)';
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(17, 24, 39, 0.95)';
    Chart.defaults.plugins.tooltip.titleColor = '#F8FAFC';
    Chart.defaults.plugins.tooltip.bodyColor = '#94A3B8';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(148, 163, 184, 0.15)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
    Chart.defaults.animation.duration = prefersReducedMotion ? 0 : 750;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
  }

  function createGradient(ctx, c1, c2) {
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
  }

  /* ═══════════════════════════════════════
     DEMO DATA
     ═══════════════════════════════════════ */

  var demoData = {
    kpis: {
      activeVehicles: 124,
      activeRoutes: 36,
      onTimeRate: 98.4,
      totalDistance: 18420,
      fuelSaved: 32,
      deliveriesToday: 847
    },
    vehicles: [
      { id: 'FL-101', name: 'Mercedes Sprinter', driver: 'James Wilson', status: 'active', fuel: 82, capacity: 78, route: 'RT-204' },
      { id: 'FL-102', name: 'Ford Transit', driver: 'Sarah Chen', status: 'transit', fuel: 65, capacity: 91, route: 'RT-208' },
      { id: 'FL-103', name: 'Isuzu NPR', driver: 'Mike Thompson', status: 'active', fuel: 45, capacity: 64, route: 'RT-211' },
      { id: 'FL-104', name: 'RAM ProMaster', driver: 'Emily Davis', status: 'idle', fuel: 90, capacity: 0, route: '-' },
      { id: 'FL-105', name: 'Chevrolet Express', driver: 'David Brown', status: 'maintenance', fuel: 30, capacity: 0, route: '-' },
      { id: 'FL-106', name: 'Nissan NV', driver: 'Lisa Anderson', status: 'active', fuel: 71, capacity: 55, route: 'RT-215' },
      { id: 'FL-107', name: 'Mercedes Sprinter', driver: 'Robert Garcia', status: 'transit', fuel: 58, capacity: 83, route: 'RT-219' },
      { id: 'FL-108', name: 'Ford E-Transit', driver: 'Anna Martinez', status: 'active', fuel: 88, capacity: 72, route: 'RT-222' },
      { id: 'FL-109', name: ' Freightliner', driver: 'Tom Harris', status: 'active', fuel: 76, capacity: 89, route: 'RT-225' },
      { id: 'FL-110', name: 'Iveco Daily', driver: 'Karen White', status: 'transit', fuel: 53, capacity: 67, route: 'RT-228' }
    ],
    routes: [
      { id: 'RT-204', name: 'Downtown Circuit', stops: 12, distance: 42, eta: '2h 15m', efficiency: 94, savings: 18, status: 'active' },
      { id: 'RT-208', name: 'North Express', stops: 8, distance: 67, eta: '3h 40m', efficiency: 88, savings: 22, status: 'active' },
      { id: 'RT-211', name: 'Industrial Loop', stops: 15, distance: 38, eta: '2h 50m', efficiency: 91, savings: 15, status: 'active' },
      { id: 'RT-215', name: 'Suburban Route', stops: 10, distance: 55, eta: '3h 10m', efficiency: 86, savings: 20, status: 'active' },
      { id: 'RT-219', name: 'Airport Corridor', stops: 6, distance: 82, eta: '4h 20m', efficiency: 82, savings: 28, status: 'active' },
      { id: 'RT-222', name: 'Harbor District', stops: 9, distance: 31, eta: '1h 55m', efficiency: 96, savings: 12, status: 'optimized' },
      { id: 'RT-225', name: 'Cross-City', stops: 18, distance: 74, eta: '4h 45m', efficiency: 79, savings: 25, status: 'active' },
      { id: 'RT-228', name: 'Eastside Shuttle', stops: 7, distance: 28, eta: '1h 30m', efficiency: 93, savings: 14, status: 'optimized' }
    ],
    drivers: [
      { name: 'James Wilson', vehicle: 'FL-101', route: 'RT-204', deliveries: 34, score: 97, avatar: '#06B6D4' },
      { name: 'Sarah Chen', vehicle: 'FL-102', route: 'RT-208', deliveries: 28, score: 94, avatar: '#8B5CF6' },
      { name: 'Mike Thompson', vehicle: 'FL-103', route: 'RT-211', deliveries: 31, score: 91, avatar: '#10B981' },
      { name: 'Emily Davis', vehicle: 'FL-104', route: '-', deliveries: 0, score: 88, avatar: '#F59E0B' },
      { name: 'David Brown', vehicle: 'FL-105', route: '-', deliveries: 0, score: 85, avatar: '#F43F5E' },
      { name: 'Lisa Anderson', vehicle: 'FL-106', route: 'RT-215', deliveries: 26, score: 93, avatar: '#06B6D4' },
      { name: 'Robert Garcia', vehicle: 'FL-107', route: 'RT-219', deliveries: 22, score: 89, avatar: '#8B5CF6' },
      { name: 'Anna Martinez', vehicle: 'FL-108', route: 'RT-222', deliveries: 29, score: 96, avatar: '#10B981' },
      { name: 'Tom Harris', vehicle: 'FL-109', route: 'RT-225', deliveries: 32, score: 90, avatar: '#F59E0B' },
      { name: 'Karen White', vehicle: 'FL-110', route: 'RT-228', deliveries: 19, score: 92, avatar: '#F43F5E' }
    ],
    weeklyDeliveries: [620, 685, 710, 695, 780, 847, 812],
    weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthlyDeliveries: [18200, 19400, 21100, 20800, 22500, 23800, 25200, 24600, 26100, 27400, 28900, 30200],
    fuelConsumption: [4200, 3980, 4100, 3850, 3720, 3650, 3580, 3520, 3480, 3420, 3380, 3320],
    routeEfficiency: [82, 84, 85, 87, 88, 89, 91, 90, 92, 93, 94, 94.5],
    costSavings: [12400, 13200, 14800, 15600, 16200, 17400, 18100, 18800, 19500, 20200, 21100, 22000]
  };

  /* ═══════════════════════════════════════
     HELPER: Animated Counter
     ═══════════════════════════════════════ */

  function animateCounter(el, target, suffix, duration) {
    var prefix = el.dataset.prefix || '';
    if (prefersReducedMotion) {
      el.textContent = prefix + (typeof target === 'number' ? target.toLocaleString() : target) + (suffix || '');
      return;
    }
    suffix = suffix || '';
    duration = duration || 1200;
    var startTime = null;
    var isFloat = target % 1 !== 0;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      if (isFloat) current = (eased * target).toFixed(1);
      el.textContent = prefix + (isFloat ? current : current.toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ═══════════════════════════════════════
     VIEW: OVERVIEW
     ═══════════════════════════════════════ */

  function renderOverview(container) {
    var firstName = userName.split(' ')[0];
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Welcome back, ${firstName}</h2>
        <p>Here's what's happening across your logistics network today.</p>
      </div>

      <!-- KPI Cards -->
      <div class="dash-kpi-grid">
        <div class="dash-kpi dash-kpi--cyan">
          <div class="dash-kpi-header">
            <span class="dash-kpi-label">Active Vehicles</span>
            <div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
          </div>
          <div class="dash-kpi-value" data-count="124">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +8.2% from last week</div>
          <div class="dash-kpi-sparkline"><canvas id="spark-vehicles"></canvas></div>
        </div>
        <div class="dash-kpi dash-kpi--violet">
          <div class="dash-kpi-header">
            <span class="dash-kpi-label">Active Routes</span>
            <div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg></div>
          </div>
          <div class="dash-kpi-value" data-count="36">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +12.5% from last week</div>
          <div class="dash-kpi-sparkline"><canvas id="spark-routes"></canvas></div>
        </div>
        <div class="dash-kpi dash-kpi--emerald">
          <div class="dash-kpi-header">
            <span class="dash-kpi-label">On-Time Rate</span>
            <div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          </div>
          <div class="dash-kpi-value" data-count="98.4" data-suffix="%">0%</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +2.1% from last week</div>
          <div class="dash-kpi-sparkline"><canvas id="spark-ontime"></canvas></div>
        </div>
        <div class="dash-kpi dash-kpi--amber">
          <div class="dash-kpi-header">
            <span class="dash-kpi-label">Distance Today</span>
            <div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          </div>
          <div class="dash-kpi-value" data-count="18420" data-suffix=" km">0 km</div>
          <div class="dash-kpi-trend down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg> -3.4% from yesterday</div>
          <div class="dash-kpi-sparkline"><canvas id="spark-distance"></canvas></div>
        </div>
      </div>

      <!-- Map + Activity -->
      <div class="dash-grid-2-1" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Live Fleet Map</div>
              <div class="dash-card-subtitle">Real-time vehicle positions</div>
            </div>
            <span class="dash-status dash-status--active">Live</span>
          </div>
          <div class="dash-card-body" style="padding:0;">
            <div class="dash-map">
              <div class="dash-map-grid"></div>
              <svg class="dash-map-route" viewBox="0 0 800 340" style="position:absolute;inset:0;width:100%;height:100%;">
                <path d="M50,280 C150,240 200,100 350,120 S500,80 600,60 S700,160 750,100" />
                <path d="M80,300 C180,260 280,180 400,200 S520,140 620,180" />
                <path d="M30,200 C120,180 200,260 320,220 S480,160 580,240" />
              </svg>
              <div class="dash-map-vehicle" style="top:35%;left:42%;"></div>
              <div class="dash-map-vehicle" style="top:55%;left:28%;animation-delay:0.5s;"></div>
              <div class="dash-map-vehicle" style="top:25%;left:65%;animation-delay:1s;"></div>
              <div class="dash-map-vehicle" style="top:60%;left:72%;animation-delay:1.5s;"></div>
              <div class="dash-map-vehicle" style="top:40%;left:85%;animation-delay:0.7s;"></div>
              <div class="dash-map-point dash-map-point--depot" style="top:50%;left:15%;"></div>
              <div class="dash-map-point dash-map-point--delivery" style="top:30%;left:50%;"></div>
              <div class="dash-map-point dash-map-point--delivery" style="top:65%;left:45%;"></div>
              <div class="dash-map-point dash-map-point--delivery" style="top:20%;left:78%;"></div>
              <div class="dash-map-point dash-map-point--delivery" style="top:70%;left:60%;"></div>
              <div class="dash-map-legend">
                <div class="dash-map-legend-item"><div class="dash-map-legend-dot" style="background:var(--color-accent);"></div> Vehicles</div>
                <div class="dash-map-legend-item"><div class="dash-map-legend-dot" style="background:var(--color-violet);"></div> Depot</div>
                <div class="dash-map-legend-item"><div class="dash-map-legend-dot" style="background:var(--color-emerald);"></div> Deliveries</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">Recent Activity</div>
          </div>
          <div class="dash-card-body--flush">
            <ul class="dash-activity-list">
              <li class="dash-activity-item">
                <div class="dash-activity-icon dash-activity-icon--route"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg></div>
                <div class="dash-activity-text"><p>Route <strong>#RT-204</strong> optimized — 18% fuel savings</p><div class="dash-activity-time">2 min ago</div></div>
              </li>
              <li class="dash-activity-item">
                <div class="dash-activity-icon dash-activity-icon--delivery"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div class="dash-activity-text"><p>Vehicle <strong>FL-18</strong> completed delivery in Downtown</p><div class="dash-activity-time">8 min ago</div></div>
              </li>
              <li class="dash-activity-item">
                <div class="dash-activity-icon dash-activity-icon--driver"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div class="dash-activity-text"><p>Driver <strong>Sarah Chen</strong> assigned to Route #RT-208</p><div class="dash-activity-time">15 min ago</div></div>
              </li>
              <li class="dash-activity-item">
                <div class="dash-activity-icon dash-activity-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <div class="dash-activity-text"><p>Vehicle <strong>FL-105</strong> flagged for maintenance</p><div class="dash-activity-time">32 min ago</div></div>
              </li>
              <li class="dash-activity-item">
                <div class="dash-activity-icon dash-activity-icon--route"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
                <div class="dash-activity-text"><p>New delivery route <strong>#RT-228</strong> created for Eastside</p><div class="dash-activity-time">45 min ago</div></div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Performance Charts Row -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Weekly Deliveries</div>
              <div class="dash-card-subtitle">Completed deliveries this week</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-weekly-deliveries"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Fleet Status Distribution</div>
              <div class="dash-card-subtitle">Current vehicle statuses</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-fleet-status"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="dash-grid-3">
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">Route Efficiency</div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:160px;"><canvas id="chart-route-efficiency"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">Fuel Optimization</div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:160px;"><canvas id="chart-fuel-opt"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">Cost Savings (Monthly)</div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:160px;"><canvas id="chart-cost-savings"></canvas></div>
          </div>
        </div>
      </div>
    `;

    // Animate KPIs
    setTimeout(function () {
      container.querySelectorAll('.dash-kpi-value').forEach(function (el) {
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
      });
    }, 100);

    // Sparklines
    createSparkline('spark-vehicles', [80, 85, 90, 95, 100, 110, 124], '#06B6D4');
    createSparkline('spark-routes', [22, 25, 28, 30, 32, 34, 36], '#8B5CF6');
    createSparkline('spark-ontime', [94, 95, 96, 96.5, 97, 98, 98.4], '#10B981');
    createSparkline('spark-distance', [20000, 19500, 19200, 18800, 18600, 18500, 18420], '#F59E0B');

    // Weekly Deliveries Bar Chart
    createChart('chart-weekly-deliveries', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: demoData.weeklyLabels,
          datasets: [{
            label: 'Deliveries',
            data: demoData.weeklyDeliveries,
            backgroundColor: createGradient(ctx, 'rgba(6, 182, 212, 0.7)', 'rgba(6, 182, 212, 0.2)'),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v >= 1000 ? (v / 1000) + 'k' : v; } } }
          }
        }
      });
    });

    // Fleet Status Doughnut
    createChart('chart-fleet-status', function (ctx) {
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'In Transit', 'Idle', 'Maintenance'],
          datasets: [{
            data: [52, 28, 12, 8],
            backgroundColor: ['#10B981', '#06B6D4', '#F59E0B', '#F43F5E'],
            borderWidth: 0,
            spacing: 3,
            borderRadius: 4
          }]
        },
        options: {
          cutout: '72%',
          plugins: {
            legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } }
          }
        }
      });
    });

    // Route Efficiency Line
    createChart('chart-route-efficiency', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
          datasets: [{
            label: 'Efficiency %',
            data: [82, 84, 85, 87, 88, 89, 91, 94],
            borderColor: '#06B6D4',
            backgroundColor: createGradient(ctx, 'rgba(6,182,212,0.15)', 'rgba(6,182,212,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#06B6D4',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 75, max: 100, grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });

    // Fuel Optimization Area
    createChart('chart-fuel-opt', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
          datasets: [{
            label: 'Fuel (L)',
            data: [4200, 3980, 4100, 3850, 3720, 3650, 3580, 3520],
            borderColor: '#10B981',
            backgroundColor: createGradient(ctx, 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#10B981',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return (v / 1000).toFixed(1) + 'k'; } } }
          }
        }
      });
    });

    // Cost Savings Bar
    createChart('chart-cost-savings', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
          datasets: [{
            label: 'Savings ($)',
            data: [2800, 3100, 3400, 3600, 3800, 4000, 4200, 4400],
            backgroundColor: createGradient(ctx, 'rgba(139,92,246,0.7)', 'rgba(139,92,246,0.2)'),
            borderRadius: 5,
            borderSkipped: false,
            barPercentage: 0.55
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return '$' + (v / 1000).toFixed(1) + 'k'; } } }
          }
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     VIEW: FLEET
     ═══════════════════════════════════════ */

  function renderFleet(container) {
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Fleet Management</h2>
        <p>Monitor and manage your entire vehicle fleet in real time.</p>
      </div>

      <!-- Fleet KPIs -->
      <div class="dash-kpi-grid">
        <div class="dash-kpi dash-kpi--cyan">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Total Vehicles</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div></div>
          <div class="dash-kpi-value" data-count="124">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +8 this month</div>
        </div>
        <div class="dash-kpi dash-kpi--emerald">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Active</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div></div>
          <div class="dash-kpi-value" data-count="82">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> 66% utilization</div>
        </div>
        <div class="dash-kpi dash-kpi--amber">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Avg Fuel Level</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 22V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v17"/><path d="M16 12h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 4"/><rect x="6" y="10" width="8" height="12"/></svg></div></div>
          <div class="dash-kpi-value" data-count="68" data-suffix="%">0%</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +5% from last week</div>
        </div>
        <div class="dash-kpi dash-kpi--rose">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Maintenance Due</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div></div>
          <div class="dash-kpi-value" data-count="8">0</div>
          <div class="dash-kpi-trend down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg> Requires attention</div>
        </div>
      </div>

      <!-- Fleet Charts -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Vehicle Utilization</div>
              <div class="dash-card-subtitle">Capacity usage across fleet</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-utilization"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Fuel Level Distribution</div>
              <div class="dash-card-subtitle">Current fuel status by vehicle</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-fuel-dist"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Vehicle Table -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Fleet Directory</div>
          <div class="dash-toolbar" style="margin:0;">
            <input type="search" class="dash-search-input" placeholder="Search vehicles..." style="width:180px;" id="fleet-search">
            <button class="dash-filter-btn active" data-filter="all">All</button>
            <button class="dash-filter-btn" data-filter="active">Active</button>
            <button class="dash-filter-btn" data-filter="transit">In Transit</button>
            <button class="dash-filter-btn" data-filter="idle">Idle</button>
            <button class="dash-filter-btn" data-filter="maintenance">Maintenance</button>
          </div>
        </div>
        <div class="dash-card-body--flush">
          <div class="dash-table-wrap">
            <table class="dash-table" id="fleet-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Fuel</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="fleet-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(function () {
      container.querySelectorAll('.dash-kpi-value').forEach(function (el) {
        animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '');
      });
    }, 100);

    // Utilization Bar Chart
    createChart('chart-utilization', function (ctx) {
      var vehicles = demoData.vehicles.slice(0, 8);
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: vehicles.map(function (v) { return v.id; }),
          datasets: [{
            label: 'Capacity %',
            data: vehicles.map(function (v) { return v.capacity; }),
            backgroundColor: vehicles.map(function (v) {
              if (v.capacity > 80) return 'rgba(16, 185, 129, 0.6)';
              if (v.capacity > 50) return 'rgba(6, 182, 212, 0.6)';
              return 'rgba(245, 158, 11, 0.6)';
            }),
            borderRadius: 5,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; } } },
            y: { grid: { display: false } }
          }
        }
      });
    });

    // Fuel Distribution Polar Area
    createChart('chart-fuel-dist', function (ctx) {
      return new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: ['80-100%', '60-80%', '40-60%', '20-40%', '<20%'],
          datasets: [{
            data: [35, 42, 28, 14, 5],
            backgroundColor: ['rgba(16,185,129,0.5)', 'rgba(6,182,212,0.5)', 'rgba(139,92,246,0.5)', 'rgba(245,158,11,0.5)', 'rgba(244,63,94,0.5)'],
            borderWidth: 0
          }]
        },
        options: {
          plugins: { legend: { position: 'right', labels: { padding: 10, font: { size: 11 } } } },
          scales: { r: { display: false } }
        }
      });
    });

    // Fleet table
    renderFleetTable(demoData.vehicles);

    // Filter buttons
    container.querySelectorAll('.dash-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.dash-filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        var filtered = filter === 'all' ? demoData.vehicles : demoData.vehicles.filter(function (v) { return v.status === filter; });
        renderFleetTable(filtered);
      });
    });

    // Search
    var searchInput = document.getElementById('fleet-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var q = this.value.toLowerCase();
        var filtered = demoData.vehicles.filter(function (v) {
          return v.id.toLowerCase().indexOf(q) !== -1 || v.name.toLowerCase().indexOf(q) !== -1 || v.driver.toLowerCase().indexOf(q) !== -1;
        });
        renderFleetTable(filtered);
      });
    }
  }

  function renderFleetTable(vehicles) {
    var tbody = document.getElementById('fleet-tbody');
    if (!tbody) return;
    tbody.innerHTML = vehicles.map(function (v) {
      var statusClass = 'dash-status--' + v.status;
      var statusLabel = v.status === 'transit' ? 'In Transit' : v.status.charAt(0).toUpperCase() + v.status.slice(1);
      return '<tr>' +
        '<td class="dash-table-cell-primary">' + v.id + '</td>' +
        '<td>' + v.name + '</td>' +
        '<td>' + v.driver + '</td>' +
        '<td>' + v.route + '</td>' +
        '<td><div style="display:flex;align-items:center;gap:0.5rem;"><div class="dash-progress" style="width:60px;"><div class="dash-progress-bar ' + (v.fuel > 50 ? 'dash-progress-bar--emerald' : 'dash-progress-bar--amber') + '" style="width:' + v.fuel + '%;"></div></div><span>' + v.fuel + '%</span></div></td>' +
        '<td><div style="display:flex;align-items:center;gap:0.5rem;"><div class="dash-progress" style="width:60px;"><div class="dash-progress-bar dash-progress-bar--cyan" style="width:' + v.capacity + '%;"></div></div><span>' + v.capacity + '%</span></div></td>' +
        '<td><span class="dash-status ' + statusClass + '">' + statusLabel + '</span></td>' +
        '</tr>';
    }).join('');
  }

  /* ═══════════════════════════════════════
     VIEW: ROUTES
     ═══════════════════════════════════════ */

  function renderRoutes(container) {
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Route Optimization</h2>
        <p>AI-powered route planning and real-time optimization insights.</p>
      </div>

      <div class="dash-kpi-grid">
        <div class="dash-kpi dash-kpi--cyan">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Active Routes</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg></div></div>
          <div class="dash-kpi-value" data-count="36">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +4 new today</div>
        </div>
        <div class="dash-kpi dash-kpi--emerald">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Avg Efficiency</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div></div>
          <div class="dash-kpi-value" data-count="89.8" data-suffix="%">0%</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +3.2% improvement</div>
        </div>
        <div class="dash-kpi dash-kpi--violet">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Total Savings</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
          <div class="dash-kpi-value" data-count="22" data-suffix="%">0%</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> Fuel cost reduction</div>
        </div>
        <div class="dash-kpi dash-kpi--amber">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Total Stops</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div></div>
          <div class="dash-kpi-value" data-count="85">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> Across all routes</div>
        </div>
      </div>

      <!-- Route Charts -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Route Efficiency Trend</div>
              <div class="dash-card-subtitle">Weekly optimization performance</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-route-trend"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Distance vs ETA</div>
              <div class="dash-card-subtitle">Route comparison by distance</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-distance-eta"></canvas></div>
          </div>
        </div>
      </div>

      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Savings by Route</div>
              <div class="dash-card-subtitle">Fuel savings percentage per route</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-route-savings"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Route Stops Distribution</div>
              <div class="dash-card-subtitle">Number of stops per route</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-route-stops"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Route List -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Active Routes</div>
        </div>
        <div class="dash-card-body--flush">
          <div class="dash-table-wrap">
            <table class="dash-table">
              <thead>
                <tr><th>Route ID</th><th>Name</th><th>Stops</th><th>Distance</th><th>ETA</th><th>Efficiency</th><th>Savings</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${demoData.routes.map(function (r) {
                  return '<tr>' +
                    '<td class="dash-table-cell-primary">' + r.id + '</td>' +
                    '<td>' + r.name + '</td>' +
                    '<td>' + r.stops + '</td>' +
                    '<td>' + r.distance + ' km</td>' +
                    '<td>' + r.eta + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:0.5rem;"><div class="dash-progress" style="width:60px;"><div class="dash-progress-bar ' + (r.efficiency > 90 ? 'dash-progress-bar--emerald' : 'dash-progress-bar--cyan') + '" style="width:' + r.efficiency + '%;"></div></div><span>' + r.efficiency + '%</span></div></td>' +
                    '<td class="dash-table-cell-primary" style="color:var(--color-emerald);">' + r.savings + '%</td>' +
                    '<td><span class="dash-status dash-status--' + r.status + '">' + r.status.charAt(0).toUpperCase() + r.status.slice(1) + '</span></td>' +
                    '</tr>';
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(function () {
      container.querySelectorAll('.dash-kpi-value').forEach(function (el) {
        animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '');
      });
    }, 100);

    // Route Efficiency Trend
    createChart('chart-route-trend', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
          datasets: [{
            label: 'Efficiency %',
            data: demoData.routeEfficiency,
            borderColor: '#06B6D4',
            backgroundColor: createGradient(ctx, 'rgba(6,182,212,0.12)', 'rgba(6,182,212,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#06B6D4',
            borderWidth: 2
          }, {
            label: 'Target',
            data: Array(12).fill(90),
            borderColor: 'rgba(245,158,11,0.5)',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 75, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; } } }
          }
        }
      });
    });

    // Distance vs ETA Scatter
    createChart('chart-distance-eta', function (ctx) {
      return new Chart(ctx, {
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Routes',
            data: demoData.routes.map(function (r) { return { x: r.distance, y: parseInt(r.eta), r: r.stops * 1.5 }; }),
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
            borderColor: '#8B5CF6',
            borderWidth: 1
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { title: { display: true, text: 'Distance (km)', color: '#64748B' }, grid: { color: 'rgba(148,163,184,0.06)' } },
            y: { title: { display: true, text: 'ETA (min)', color: '#64748B' }, grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });

    // Route Savings Horizontal Bar
    createChart('chart-route-savings', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: demoData.routes.map(function (r) { return r.id; }),
          datasets: [{
            label: 'Savings %',
            data: demoData.routes.map(function (r) { return r.savings; }),
            backgroundColor: demoData.routes.map(function (r) {
              return r.savings > 20 ? 'rgba(16,185,129,0.6)' : 'rgba(6,182,212,0.6)';
            }),
            borderRadius: 5,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; } } },
            y: { grid: { display: false } }
          }
        }
      });
    });

    // Route Stops Radar
    createChart('chart-route-stops', function (ctx) {
      return new Chart(ctx, {
        type: 'radar',
        data: {
          labels: demoData.routes.map(function (r) { return r.id; }),
          datasets: [{
            label: 'Stops',
            data: demoData.routes.map(function (r) { return r.stops; }),
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            borderColor: '#06B6D4',
            borderWidth: 2,
            pointBackgroundColor: '#06B6D4',
            pointRadius: 3
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            r: {
              beginAtZero: true,
              grid: { color: 'rgba(148,163,184,0.08)' },
              angleLines: { color: 'rgba(148,163,184,0.08)' },
              pointLabels: { color: '#94A3B8', font: { size: 10 } },
              ticks: { display: false }
            }
          }
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     VIEW: DRIVERS
     ═══════════════════════════════════════ */

  function renderDrivers(container) {
    var driverColors = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E'];
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Driver Management</h2>
        <p>Track driver performance, assignments, and delivery metrics.</p>
      </div>

      <div class="dash-kpi-grid">
        <div class="dash-kpi dash-kpi--cyan">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Total Drivers</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div>
          <div class="dash-kpi-value" data-count="48">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +3 this month</div>
        </div>
        <div class="dash-kpi dash-kpi--emerald">
          <div class="dash-kpi-header"><span class="dash-kpi-label">On Duty</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div></div>
          <div class="dash-kpi-value" data-count="38">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> 79% active rate</div>
        </div>
        <div class="dash-kpi dash-kpi--violet">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Avg Score</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div></div>
          <div class="dash-kpi-value" data-count="91.5" data-suffix="/100">0/100</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +2.3 from last month</div>
        </div>
        <div class="dash-kpi dash-kpi--amber">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Deliveries Today</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-1"/></svg></div></div>
          <div class="dash-kpi-value" data-count="221">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +15% vs yesterday</div>
        </div>
      </div>

      <!-- Driver Charts -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Performance Scores</div>
              <div class="dash-card-subtitle">Driver performance comparison</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-driver-scores"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Deliveries per Driver</div>
              <div class="dash-card-subtitle">Completed deliveries this week</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-driver-deliveries"></canvas></div>
          </div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:1.5rem;">
        <div class="dash-card-header">
          <div>
            <div class="dash-card-title">Performance Trends</div>
            <div class="dash-card-subtitle">Driver score evolution over 8 weeks</div>
          </div>
        </div>
        <div class="dash-card-body">
          <div class="dash-chart-wrap" style="height:240px;"><canvas id="chart-driver-trends"></canvas></div>
        </div>
      </div>

      <!-- Driver Cards Grid -->
      <h3 style="font-family:var(--font-heading);color:var(--color-text-primary);margin-bottom:1rem;font-size:1rem;">Driver Directory</h3>
      <div class="dash-grid-3" id="driver-cards">
        ${demoData.drivers.map(function (d, i) {
          var initials = d.name.split(' ').map(function (n) { return n[0]; }).join('');
          var color = driverColors[i % driverColors.length];
          return '<div class="dash-driver-card">' +
            '<div class="dash-driver-card-header">' +
              '<div class="dash-driver-card-avatar" style="background:' + color + ';">' + initials + '</div>' +
              '<div><div class="dash-driver-card-name">' + d.name + '</div><div class="dash-driver-card-route">' + (d.route !== '-' ? 'Route ' + d.route : 'No active route') + '</div></div>' +
              '<div style="margin-left:auto;">' + (d.route !== '-' ? '<span class="dash-status dash-status--active">On Duty</span>' : '<span class="dash-status dash-status--idle">Off Duty</span>') + '</div>' +
            '</div>' +
            '<div class="dash-driver-card-stats">' +
              '<div class="dash-driver-stat"><div class="dash-driver-stat-value">' + d.deliveries + '</div><div class="dash-driver-stat-label">Deliveries</div></div>' +
              '<div class="dash-driver-stat"><div class="dash-driver-stat-value">' + d.score + '</div><div class="dash-driver-stat-label">Score</div></div>' +
            '</div>' +
            '<div style="margin-top:0.75rem;"><div class="dash-progress"><div class="dash-progress-bar ' + (d.score >= 95 ? 'dash-progress-bar--emerald' : d.score >= 90 ? 'dash-progress-bar--cyan' : 'dash-progress-bar--amber') + '" style="width:' + d.score + '%;"></div></div></div>' +
          '</div>';
        }).join('')}
      </div>
    `;

    setTimeout(function () {
      container.querySelectorAll('.dash-kpi-value').forEach(function (el) {
        animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '');
      });
    }, 100);

    // Driver Scores Polar Area
    createChart('chart-driver-scores', function (ctx) {
      return new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: demoData.drivers.map(function (d) { return d.name.split(' ')[0]; }),
          datasets: [{
            data: demoData.drivers.map(function (d) { return d.score; }),
            backgroundColor: demoData.drivers.map(function (d, i) { return driverColors[i % driverColors.length] + '88'; }),
            borderWidth: 0
          }]
        },
        options: {
          plugins: { legend: { position: 'right', labels: { padding: 8, font: { size: 10 } } } },
          scales: { r: { display: false } }
        }
      });
    });

    // Driver Deliveries Bar
    createChart('chart-driver-deliveries', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: demoData.drivers.map(function (d) { return d.name.split(' ')[0]; }),
          datasets: [{
            label: 'Deliveries',
            data: demoData.drivers.map(function (d) { return d.deliveries; }),
            backgroundColor: demoData.drivers.map(function (d, i) { return driverColors[i % driverColors.length] + '99'; }),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });

    // Driver Trends Line
    createChart('chart-driver-trends', function (ctx) {
      var topDrivers = demoData.drivers.slice(0, 4);
      var colors = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
          datasets: topDrivers.map(function (d, i) {
            var base = d.score - 8;
            return {
              label: d.name.split(' ')[0],
              data: [base, base + 1, base + 2, base + 3, base + 4, base + 5, base + 6, d.score],
              borderColor: colors[i],
              backgroundColor: 'transparent',
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: colors[i],
              borderWidth: 2
            };
          })
        },
        options: {
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 75, max: 100, grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     VIEW: ANALYTICS
     ═══════════════════════════════════════ */

  function renderAnalytics(container) {
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Analytics & Insights</h2>
        <p>Deep-dive performance analytics and operational intelligence.</p>
      </div>

      <!-- Date Range Filter -->
      <div class="dash-filter-tabs" style="margin-bottom:1.5rem;">
        <button class="dash-filter-tab" data-range="7d">7 Days</button>
        <button class="dash-filter-tab active" data-range="30d">30 Days</button>
        <button class="dash-filter-tab" data-range="90d">90 Days</button>
        <button class="dash-filter-tab" data-range="1y">1 Year</button>
      </div>

      <div class="dash-kpi-grid">
        <div class="dash-kpi dash-kpi--cyan">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Total Deliveries</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-1"/></svg></div></div>
          <div class="dash-kpi-value" data-count="30200">0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +12.3% YoY</div>
        </div>
        <div class="dash-kpi dash-kpi--emerald">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Route Efficiency</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div></div>
          <div class="dash-kpi-value" data-count="94.5" data-suffix="%">0%</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +12.5% since Jan</div>
        </div>
        <div class="dash-kpi dash-kpi--violet">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Fuel Saved</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 22V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v17"/></svg></div></div>
          <div class="dash-kpi-value" data-count="3320" data-suffix=" L">0 L</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> 21% reduction</div>
        </div>
        <div class="dash-kpi dash-kpi--amber">
          <div class="dash-kpi-header"><span class="dash-kpi-label">Cost Savings</span><div class="dash-kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
          <div class="dash-kpi-value" data-count="22000" data-prefix="$">$0</div>
          <div class="dash-kpi-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> +$4,800 vs last month</div>
        </div>
      </div>

      <!-- Analytics Charts Row 1 -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Monthly Delivery Trends</div>
              <div class="dash-card-subtitle">Year-over-year delivery volume</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-monthly-deliveries"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Fuel Consumption Trend</div>
              <div class="dash-card-subtitle">Monthly fuel usage (liters)</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-fuel-consumption"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Analytics Charts Row 2 -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Route Efficiency Over Time</div>
              <div class="dash-card-subtitle">Monthly optimization performance</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-efficiency-trend"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Cost Savings Accumulation</div>
              <div class="dash-card-subtitle">Cumulative savings over the year</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-cost-trend"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Analytics Charts Row 3 -->
      <div class="dash-grid-3" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Delivery by Region</div>
              <div class="dash-card-subtitle">Geographic distribution</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-region-dist"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Peak Hours Analysis</div>
              <div class="dash-card-subtitle">Delivery volume by hour</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-peak-hours"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">SLA Compliance</div>
              <div class="dash-card-subtitle">On-time delivery rate</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:220px;"><canvas id="chart-sla"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Analytics Charts Row 4 -->
      <div class="dash-grid-2" style="margin-bottom:1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Vehicle Type Performance</div>
              <div class="dash-card-subtitle">Efficiency by vehicle category</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-vehicle-perf"></canvas></div>
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Delivery Status Breakdown</div>
              <div class="dash-card-subtitle">Current delivery statuses</div>
            </div>
          </div>
          <div class="dash-card-body">
            <div class="dash-chart-wrap" style="height:260px;"><canvas id="chart-delivery-status"></canvas></div>
          </div>
        </div>
      </div>
    `;

    setTimeout(function () {
      container.querySelectorAll('.dash-kpi-value').forEach(function (el) {
        animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '', 1500);
      });
    }, 100);

    // Date range tabs
    container.querySelectorAll('.dash-filter-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        container.querySelectorAll('.dash-filter-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
      });
    });

    // Monthly Deliveries Area
    createChart('chart-monthly-deliveries', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: demoData.monthlyLabels,
          datasets: [{
            label: 'Deliveries',
            data: demoData.monthlyDeliveries,
            borderColor: '#06B6D4',
            backgroundColor: createGradient(ctx, 'rgba(6,182,212,0.15)', 'rgba(6,182,212,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#06B6D4',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return (v / 1000).toFixed(0) + 'k'; } } }
          }
        }
      });
    });

    // Fuel Consumption Line
    createChart('chart-fuel-consumption', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: demoData.monthlyLabels,
          datasets: [{
            label: 'Fuel (L)',
            data: demoData.fuelConsumption,
            borderColor: '#10B981',
            backgroundColor: createGradient(ctx, 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10B981',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return (v / 1000).toFixed(1) + 'k'; } } }
          }
        }
      });
    });

    // Efficiency Trend
    createChart('chart-efficiency-trend', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: demoData.monthlyLabels,
          datasets: [{
            label: 'Efficiency %',
            data: demoData.routeEfficiency,
            borderColor: '#8B5CF6',
            backgroundColor: createGradient(ctx, 'rgba(139,92,246,0.12)', 'rgba(139,92,246,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#8B5CF6',
            borderWidth: 2
          }, {
            label: 'Target',
            data: Array(12).fill(90),
            borderColor: 'rgba(245,158,11,0.5)',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 75, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; } } }
          }
        }
      });
    });

    // Cost Savings Area
    createChart('chart-cost-trend', function (ctx) {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: demoData.monthlyLabels,
          datasets: [{
            label: 'Savings ($)',
            data: demoData.costSavings,
            borderColor: '#F59E0B',
            backgroundColor: createGradient(ctx, 'rgba(245,158,11,0.15)', 'rgba(245,158,11,0)'),
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#F59E0B',
            borderWidth: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return '$' + (v / 1000).toFixed(0) + 'k'; } } }
          }
        }
      });
    });

    // Region Distribution Doughnut
    createChart('chart-region-dist', function (ctx) {
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Downtown', 'Northside', 'Industrial', 'Suburban', 'Harbor', 'Airport'],
          datasets: [{
            data: [28, 22, 18, 16, 10, 6],
            backgroundColor: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#64748B'],
            borderWidth: 0,
            spacing: 2,
            borderRadius: 3
          }]
        },
        options: {
          cutout: '65%',
          plugins: { legend: { position: 'bottom', labels: { padding: 8, font: { size: 10 } } } }
        }
      });
    });

    // Peak Hours Bar
    createChart('chart-peak-hours', function (ctx) {
      var hours = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'];
      var volumes = [45, 120, 95, 70, 85, 140, 110, 55];
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: hours,
          datasets: [{
            label: 'Deliveries',
            data: volumes,
            backgroundColor: volumes.map(function (v) {
              return v > 100 ? 'rgba(6,182,212,0.7)' : 'rgba(6,182,212,0.3)';
            }),
            borderRadius: 5,
            borderSkipped: false,
            barPercentage: 0.65
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });

    // SLA Gauge (Doughnut)
    createChart('chart-sla', function (ctx) {
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['On Time', 'Late'],
          datasets: [{
            data: [98.4, 1.6],
            backgroundColor: ['#10B981', 'rgba(244,63,94,0.3)'],
            borderWidth: 0,
            circumference: 270,
            rotation: 225
          }]
        },
        options: {
          cutout: '78%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
          }
        },
        plugins: [{
          id: 'gaugeCenter',
          afterDraw: function (chart) {
            var ctx2 = chart.ctx;
            var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2 + 10;
            ctx2.save();
            ctx2.textAlign = 'center';
            ctx2.textBaseline = 'middle';
            ctx2.font = "700 28px 'Space Grotesk', sans-serif";
            ctx2.fillStyle = '#F8FAFC';
            ctx2.fillText('98.4%', centerX, centerY - 8);
            ctx2.font = "500 11px 'Inter', sans-serif";
            ctx2.fillStyle = '#94A3B8';
            ctx2.fillText('SLA Compliance', centerX, centerY + 16);
            ctx2.restore();
          }
        }]
      });
    });

    // Vehicle Type Performance Grouped Bar
    createChart('chart-vehicle-perf', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Sprinter', 'Transit', 'ProMaster', 'Express', 'NV'],
          datasets: [{
            label: 'Efficiency %',
            data: [92, 88, 85, 90, 87],
            backgroundColor: 'rgba(6,182,212,0.6)',
            borderRadius: 5,
            borderSkipped: false
          }, {
            label: 'On-Time %',
            data: [96, 94, 91, 95, 93],
            backgroundColor: 'rgba(139,92,246,0.6)',
            borderRadius: 5,
            borderSkipped: false
          }]
        },
        options: {
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 70, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: function (v) { return v + '%'; } } }
          }
        }
      });
    });

    // Delivery Status Stacked Bar
    createChart('chart-delivery-status', function (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Completed',
            data: [580, 640, 660, 650, 730, 790, 760],
            backgroundColor: 'rgba(16,185,129,0.6)',
            borderRadius: 3,
            borderSkipped: false
          }, {
            label: 'In Progress',
            data: [30, 35, 40, 35, 40, 45, 42],
            backgroundColor: 'rgba(6,182,212,0.6)',
            borderRadius: 3,
            borderSkipped: false
          }, {
            label: 'Failed',
            data: [10, 10, 10, 10, 10, 12, 10],
            backgroundColor: 'rgba(244,63,94,0.5)',
            borderRadius: 3,
            borderSkipped: false
          }]
        },
        options: {
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, grid: { color: 'rgba(148,163,184,0.06)' } }
          }
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     VIEW: SETTINGS
     ═══════════════════════════════════════ */

  function renderSettings(container) {
    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Settings</h2>
        <p>Manage your account preferences and dashboard configuration.</p>
      </div>

      <div class="dash-card" style="margin-bottom:1.5rem;">
        <div class="dash-card-header">
          <div class="dash-card-title">Profile Information</div>
        </div>
        <div class="dash-card-body">
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
            <div class="dash-avatar" style="width:56px;height:56px;font-size:1.25rem;border-radius:14px;">${initials}</div>
            <div>
              <div style="font-size:1.125rem;font-weight:600;color:var(--color-text-primary);">${userName}</div>
              <div style="font-size:0.875rem;color:var(--color-text-secondary);">${userEmail}</div>
              <div style="margin-top:0.25rem;"><span class="dash-status dash-status--active">${userRole}</span></div>
            </div>
          </div>

          <div class="dash-settings-section">
            <h3>Personal Details</h3>
            <div class="dash-settings-row">
              <div><div class="dash-settings-label">Full Name</div><div class="dash-settings-desc">${userName}</div></div>
              <button class="dash-filter-btn">Edit</button>
            </div>
            <div class="dash-settings-row">
              <div><div class="dash-settings-label">Email Address</div><div class="dash-settings-desc">${userEmail}</div></div>
              <button class="dash-filter-btn">Edit</button>
            </div>
            <div class="dash-settings-row">
              <div><div class="dash-settings-label">Role</div><div class="dash-settings-desc">${userRole}</div></div>
              <span style="font-size:0.8125rem;color:var(--color-text-muted);">Cannot be changed</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:1.5rem;">
        <div class="dash-card-header">
          <div class="dash-card-title">Notification Preferences</div>
        </div>
        <div class="dash-card-body">
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Route Alerts</div><div class="dash-settings-desc">Get notified about route deviations and delays</div></div>
            <button class="dash-toggle active" aria-label="Toggle route alerts" role="switch" aria-checked="true"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Vehicle Maintenance</div><div class="dash-settings-desc">Receive alerts for scheduled maintenance</div></div>
            <button class="dash-toggle active" aria-label="Toggle maintenance alerts" role="switch" aria-checked="true"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Delivery Notifications</div><div class="dash-settings-desc">Updates on completed and failed deliveries</div></div>
            <button class="dash-toggle active" aria-label="Toggle delivery notifications" role="switch" aria-checked="true"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Weekly Reports</div><div class="dash-settings-desc">Receive weekly performance summary via email</div></div>
            <button class="dash-toggle" aria-label="Toggle weekly reports" role="switch" aria-checked="false"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Driver Performance</div><div class="dash-settings-desc">Alerts on driver score changes</div></div>
            <button class="dash-toggle" aria-label="Toggle driver performance alerts" role="switch" aria-checked="false"></button>
          </div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:1.5rem;">
        <div class="dash-card-header">
          <div class="dash-card-title">Display Preferences</div>
        </div>
        <div class="dash-card-body">
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Compact View</div><div class="dash-settings-desc">Reduce spacing and padding for more data density</div></div>
            <button class="dash-toggle" aria-label="Toggle compact view" role="switch" aria-checked="false"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Show Map on Overview</div><div class="dash-settings-desc">Display the live fleet map in the overview dashboard</div></div>
            <button class="dash-toggle active" aria-label="Toggle map visibility" role="switch" aria-checked="true"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Animation Effects</div><div class="dash-settings-desc">Enable smooth transitions and animations</div></div>
            <button class="dash-toggle active" aria-label="Toggle animations" role="switch" aria-checked="true"></button>
          </div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:1.5rem;">
        <div class="dash-card-header">
          <div class="dash-card-title">Security</div>
        </div>
        <div class="dash-card-body">
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Change Password</div><div class="dash-settings-desc">Update your account password</div></div>
            <button class="dash-filter-btn">Change</button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Two-Factor Authentication</div><div class="dash-settings-desc">Add an extra layer of security to your account</div></div>
            <button class="dash-toggle" aria-label="Toggle 2FA" role="switch" aria-checked="false"></button>
          </div>
          <div class="dash-settings-row">
            <div><div class="dash-settings-label">Active Sessions</div><div class="dash-settings-desc">Manage devices where you're logged in</div></div>
            <button class="dash-filter-btn">Manage</button>
          </div>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Account</div>
        </div>
        <div class="dash-card-body">
          <div class="dash-settings-row">
            <div><div class="dash-settings-label" style="color:var(--color-rose);">Delete Account</div><div class="dash-settings-desc">Permanently delete your account and all associated data</div></div>
            <button class="dash-filter-btn" style="border-color:var(--color-rose);color:var(--color-rose);">Delete</button>
          </div>
        </div>
      </div>
    `;

    // Toggle buttons
    container.querySelectorAll('.dash-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var isActive = this.classList.toggle('active');
        this.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    });
  }

  /* ═══════════════════════════════════════
     CHART HELPERS
     ═══════════════════════════════════════ */

  function createChart(canvasId, factory) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    var ctx = canvas.getContext('2d');
    chartInstances[canvasId] = factory(ctx);
  }

  function createSparkline(canvasId, data, color) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    var ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(function (_, i) { return i; }),
        datasets: [{
          data: data,
          borderColor: color,
          backgroundColor: createGradient(ctx, color + '22', color + '00'),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: { duration: prefersReducedMotion ? 0 : 800 }
      }
    });
  }

  // Initial render — must run after demoData and all helpers are defined
  navigateTo(getHashView());

})();
