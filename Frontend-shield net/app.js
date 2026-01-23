/* ===================================
   ShieldNet Defense UI - JavaScript
   Interactive animations and logic
   =================================== */

/* ===================================
   MOUSE TRACKING & PARALLAX
   =================================== */

// Global mouse position
let mouseX = 0;
let mouseY = 0;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Track mouse movement
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Update window dimensions on resize
window.addEventListener('resize', () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
});

/* ===================================
   ANIMATED GRID BACKGROUND
   =================================== */

function initGridBackground() {
  const gridBackground = document.querySelector('.grid-background');
  if (!gridBackground) return;

  const gridLayer = document.querySelector('.grid-layer');
  if (!gridLayer) return;

  // Mouse-reactive grid cells
  const gridCells = document.querySelectorAll('.grid-cell');

  // Get robodog element for collision detection
  const robodogContainer = document.querySelector('.robodog-container');

  // Debounced mouse move handler for performance
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      // Check if cursor is over robodog
      let isOverRobodog = false;
      if (robodogContainer) {
        const robodogRect = robodogContainer.getBoundingClientRect();
        isOverRobodog = (
          e.clientX >= robodogRect.left &&
          e.clientX <= robodogRect.right &&
          e.clientY >= robodogRect.top &&
          e.clientY <= robodogRect.bottom
        );
      }

      gridCells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const cellX = rect.left + rect.width / 2;
        const cellY = rect.top + rect.height / 2;

        // Calculate distance from mouse
        const distance = Math.sqrt(
          Math.pow(e.clientX - cellX, 2) +
          Math.pow(e.clientY - cellY, 2)
        );

        // Only activate cells if cursor is NOT over robodog AND within radius
        if (!isOverRobodog && distance < 150) {
          cell.classList.add('active');
          // Remove after delay
          setTimeout(() => {
            cell.classList.remove('active');
          }, 500);
        }
      });

      rafId = null;
    });
  });

  // Parallax scroll effect
  let scrollDelta = 0;

  window.addEventListener('wheel', (e) => {
    scrollDelta += e.deltaY * 0.5;

    // Apply parallax transform
    gridLayer.style.transform = `translate(${scrollDelta * 0.05}px, ${scrollDelta * 0.1}px)`;

    // Limit the scroll effect
    if (Math.abs(scrollDelta) > 500) {
      scrollDelta *= 0.95;
    }
  });
}

/* ===================================
   ROBODOG TWO-EYE TRACKING
   =================================== */

function initRobodogEyes() {
  const robodogContainer = document.querySelector('.robodog-container');
  if (!robodogContainer) return;

  const eyes = document.querySelectorAll('.robo-eye');
  if (eyes.length === 0) return;

  const passwordInput = document.querySelector('#password');
  let eyesClosed = false;

  // Track mouse for all eyes
  function updateEyePositions() {
    if (eyesClosed) return; // Don't move if eyes are closed

    requestAnimationFrame(() => {
      eyes.forEach(eye => {
        const eyePupil = eye.querySelector('.eye-pupil');
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        // Calculate angle to mouse
        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);

        // Limit pupil movement
        const maxDistance = 12;
        const distance = Math.min(
          Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 25,
          maxDistance
        );

        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        // Apply smooth transform
        eyePupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
      });

      updateEyePositions();
    });
  }

  updateEyePositions();

  // Close eyes when password field is focused
  if (passwordInput) {
    passwordInput.addEventListener('focus', () => {
      eyesClosed = true;
      eyes.forEach(eye => {
        const eyeInner = eye.querySelector('.eye-inner');
        eyeInner.classList.remove('open', 'blinking');
        eyeInner.classList.add('closed');
      });
    });

    passwordInput.addEventListener('blur', () => {
      eyesClosed = false;
      eyes.forEach(eye => {
        const eyeInner = eye.querySelector('.eye-inner');
        eyeInner.classList.remove('closed');
        eyeInner.classList.add('open');
      });
    });
  }

  // Random blink animation
  function startBlinking() {
    setInterval(() => {
      if (eyesClosed) return; // Don't blink if eyes are closed

      const blinkDelay = 3000 + Math.random() * 4000;

      setTimeout(() => {
        eyes.forEach(eye => {
          const eyeInner = eye.querySelector('.eye-inner');
          eyeInner.classList.add('blinking');
          setTimeout(() => {
            eyeInner.classList.remove('blinking');
          }, 300);
        });
      }, blinkDelay);
    }, 5000);
  }

  startBlinking();
}

/* ===================================
   THEME SWITCHER
   =================================== */

/* ===================================
   THEME SWITCHER
   =================================== */

function initThemeSwitcher() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeMenu = document.getElementById('themeMenu');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (!themeBtn || !themeMenu) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('shieldnet-theme') || 'default';
  applyTheme(savedTheme);

  // Toggle menu visibility
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('show');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
      themeMenu.classList.remove('show');
    }
  });

  // Handle theme selection
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      applyTheme(theme);
      localStorage.setItem('shieldnet-theme', theme);
      themeMenu.classList.remove('show');
    });
  });

  function applyTheme(themeName) {
    // Remove all theme classes first
    document.body.classList.remove(
      'theme-light',
      'theme-matrix',
      'theme-neon',
      'theme-crimson'
    );

    // Add new theme class if not default
    if (themeName !== 'default') {
      document.body.classList.add(`theme-${themeName}`);
    }

    // Update active state in menu
    themeOptions.forEach(opt => {
      if (opt.getAttribute('data-theme') === themeName) {
        opt.classList.add('active');
        // Update button icon color or content based on theme could go here
      } else {
        opt.classList.remove('active');
      }
    });
  }
}

/* ===================================
   DASHBOARD REAL-TIME SIMULATIONS
   =================================== */

function initDashboardSimulations() {
  // Only run if on dashboard
  if (!document.querySelector('.dashboard-container')) return;

  // Simulate anomaly score updates
  const scoreValue = document.querySelector('.score-value');
  const scoreFill = document.querySelector('.score-fill');

  if (scoreValue && scoreFill) {
    setInterval(() => {
      const randomScore = (85 + Math.random() * 14).toFixed(1);
      scoreValue.textContent = randomScore + '%';
      scoreFill.style.width = randomScore + '%';
    }, 3000);
  }

  // Simulate live logs
  const logsContainer = document.querySelector('.logs-container');

  if (logsContainer) {
    const logMessages = [
      { type: 'success', msg: 'Connection authenticated successfully' },
      { type: 'info', msg: 'Monitoring network traffic...' },
      { type: 'success', msg: 'Threat scan completed - No anomalies detected' },
      { type: 'warning', msg: 'Unusual login attempt from IP 192.168.1.45' },
      { type: 'success', msg: 'AI shield active - Protection enabled' },
      { type: 'info', msg: 'Data encryption verified' },
      { type: 'success', msg: 'Secure channel established' },
      { type: 'info', msg: 'System health check: OK' },
      { type: 'warning', msg: 'High bandwidth usage detected' },
      { type: 'success', msg: 'Firewall rules updated' }
    ];

    function addLogEntry() {
      const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

      const logEntry = document.createElement('div');
      logEntry.className = `log-entry ${randomLog.type}`;
      logEntry.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span class="log-message">${randomLog.msg}</span>
      `;

      logsContainer.insertBefore(logEntry, logsContainer.firstChild);

      // Keep only last 20 logs
      while (logsContainer.children.length > 20) {
        logsContainer.removeChild(logsContainer.lastChild);
      }
    }

    // Add log every 2-5 seconds
    setInterval(addLogEntry, 2000 + Math.random() * 3000);

    // Add initial logs
    for (let i = 0; i < 8; i++) {
      setTimeout(addLogEntry, i * 300);
    }
  }

  // Simulate alert status changes
  const statusIndicator = document.querySelector('.status-indicator');

  if (statusIndicator) {
    setInterval(() => {
      // Randomly trigger alert state (10% chance)
      if (Math.random() < 0.1) {
        statusIndicator.classList.add('alert');
        statusIndicator.innerHTML = '<span class="status-dot"></span> ALERT MODE';

        // Return to secure after 3 seconds
        setTimeout(() => {
          statusIndicator.classList.remove('alert');
          statusIndicator.innerHTML = '<span class="status-dot"></span> SECURE';
        }, 3000);
      }
    }, 8000);
  }
}

/* ===================================
   NAVIGATION ACTIVE STATE
   =================================== */

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Remove active from all
      navLinks.forEach(l => l.classList.remove('active'));
      // Add active to clicked
      link.classList.add('active');
    });
  });

  // Set first link as active by default
  if (navLinks.length > 0) {
    navLinks[0].classList.add('active');
  }
}

/* ===================================
   LOGIN FORM HANDLING
   =================================== */

function initLoginForm() {
  const loginForm = document.querySelector('.login-form');
  const loginBtn = document.querySelector('.btn-login');

  if (!loginForm || !loginBtn) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Add loading state
    loginBtn.textContent = 'Authenticating...';
    loginBtn.disabled = true;

    // Simulate authentication
    setTimeout(() => {
      // In a real app, you would navigate to dashboard
      window.location.href = 'dashboard.html';
    }, 1500);
  });
}

/* ===================================
   TRANSMISSION ANIMATION
   =================================== */

function createTransmissionPulse(x, y) {
  const pulse = document.createElement('div');
  pulse.className = 'transmit-pulse';
  pulse.style.left = x + 'px';
  pulse.style.top = y + 'px';
  pulse.style.position = 'fixed';
  pulse.style.pointerEvents = 'none';
  pulse.style.zIndex = '9999';

  document.body.appendChild(pulse);

  // Remove after animation
  setTimeout(() => {
    pulse.remove();
  }, 1000);
}

// Add transmission pulse on certain events
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      const rect = card.getBoundingClientRect();
      createTransmissionPulse(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    });
  });
});

/* ===================================
   INITIALIZE ALL FEATURES
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGridBackground();
  initRobodogEyes();
  initThemeSwitcher();
  initDashboardSimulations();
  initNavigation();
  initLoginForm();

  console.log('%c🛡️ ShieldNet Defense System Initialized', 'color: #00d9ff; font-size: 16px; font-weight: bold;');
  console.log('%cAll systems operational. Protection enabled.', 'color: #00ff88; font-size: 12px;');
});

/* ===================================
   PERFORMANCE MONITORING
   =================================== */

// Monitor FPS (optional - for development)
if (window.location.search.includes('debug=true')) {
  let lastTime = performance.now();
  let frames = 0;

  function measureFPS() {
    frames++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${frames}`);
      frames = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFPS);
  }

  requestAnimationFrame(measureFPS);
}
