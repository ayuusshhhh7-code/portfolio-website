'use strict';

// ─── Frosted Loader ──────────────────────────────────────────────
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loader-percent');
const loaderLine = document.getElementById('loader-line');

let loadPct = 0;
const loadInterval = setInterval(() => {
  loadPct += Math.floor(Math.random() * 14) + 6;
  if (loadPct >= 100) {
    loadPct = 100;
    clearInterval(loadInterval);
    if (loaderPct) loaderPct.textContent = '100%';
    if (loaderLine) loaderLine.style.width = '100%';
    setTimeout(() => {
      if (loader) loader.classList.add('gone');
      initApp();
    }, 450);
  } else {
    if (loaderPct) loaderPct.textContent = loadPct + '%';
    if (loaderLine) loaderLine.style.width = loadPct + '%';
  }
}, 45);


// Apply saved theme immediately to prevent flashing
(function() {
  const savedTheme = localStorage.getItem('site-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
})();

// ─── Main Application Initialization ─────────────────────────────
function initApp() {
  initThemeToggle();
  initThreeJS();
  initCursor();
  initDockNavigation();
  initWindowChrome();
  initSunsetCardTilt();
  initChartInteractivity();
  initScrollReveal();
  initSkillBars();
  initFooterYear();
}


// ─── Three.js Ambient Floating Bokeh Orbs & Embers ───────────────
function initThreeJS() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 25;

  // Ambient light & soft directional lights
  const ambient = new THREE.AmbientLight(0xaaccff, 0.5);
  scene.add(ambient);

  const pointLight1 = new THREE.PointLight(0x00e5ff, 1.8, 50);
  pointLight1.position.set(10, 8, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7c4dff, 1.2, 50);
  pointLight2.position.set(-10, -6, 8);
  scene.add(pointLight2);

  // Group of floating golden bokeh spheres
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);

  const orbGeometry = new THREE.SphereGeometry(1, 24, 24);
  const orbMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.22 }),
    new THREE.MeshBasicMaterial({ color: 0x007cf0, transparent: true, opacity: 0.18 }),
    new THREE.MeshBasicMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.16 }),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.20 })
  ];

  const orbs = [];
  const orbCount = 18;

  for (let i = 0; i < orbCount; i++) {
    const mat = orbMaterials[i % orbMaterials.length];
    const mesh = new THREE.Mesh(orbGeometry, mat);

    // Randomize initial positions & scale
    mesh.position.x = (Math.random() - 0.5) * 36;
    mesh.position.y = (Math.random() - 0.5) * 26;
    mesh.position.z = (Math.random() - 0.5) * 16 - 2;

    const scale = Math.random() * 2.5 + 0.8;
    mesh.scale.set(scale, scale, scale);

    // Speed vector
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.008,
      vy: (Math.random() - 0.5) * 0.008,
      vz: (Math.random() - 0.5) * 0.005,
      initY: mesh.position.y,
      floatSpeed: Math.random() * 0.8 + 0.4
    };

    orbGroup.add(mesh);
    orbs.push(mesh);
  }

  // Floating micro dust particles / embers
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const cyanColor  = new THREE.Color(0x00e5ff);
  const purpleColor = new THREE.Color(0x7c4dff);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 45;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

    const c = Math.random() > 0.4 ? cyanColor : purpleColor;
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse Parallax Trackers
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Gentle floating motion for orbs
    orbs.forEach((orb, idx) => {
      orb.position.x += orb.userData.vx;
      orb.position.y = orb.userData.initY + Math.sin(elapsedTime * orb.userData.floatSpeed + idx) * 1.5;
      orb.position.z += orb.userData.vz;

      // Wrap around bounds
      if (orb.position.x > 22) orb.position.x = -22;
      if (orb.position.x < -22) orb.position.x = 22;
    });

    // Particle rotation
    particleSystem.rotation.y = elapsedTime * 0.02;
    particleSystem.rotation.x = elapsedTime * 0.01;

    // Smooth camera mouse follow
    targetX += (mouseX * 2.5 - targetX) * 0.03;
    targetY += (mouseY * 1.8 - targetY) * 0.03;

    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


// ─── Custom Glow Cursor ──────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  const rf = () => {
    const cx = parseFloat(cursor.style.left || 0);
    const cy = parseFloat(cursor.style.top || 0);
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(rf);
  };
  rf();
}


// ─── Floating Dock Navigation ────────────────────────────────────
function initDockNavigation() {
  const dockItems = document.querySelectorAll('.dock-item[href]');
  const sections = document.querySelectorAll('section[id]');
  const resetBtn = document.getElementById('dock-btn-reset');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(s => {
      if (scrollPos >= s.offsetTop) {
        current = s.id;
      }
    });

    dockItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === '#' + current) {
        item.classList.add('active');
        if (current === 'home') {
          item.classList.add('dock-active-circle');
        } else {
          item.classList.remove('dock-active-circle');
        }
      } else {
        item.classList.remove('active');
        if (item.id === 'dock-home' && current !== 'home') {
          item.classList.remove('dock-active-circle');
        }
      }
    });
  });

  // Smooth scroll click handler
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}


// ─── Window Chrome Interactive Controls ──────────────────────────
function initWindowChrome() {
  const reloadBtn = document.getElementById('win-btn-reload');
  const shareBtn = document.getElementById('win-btn-share');
  const prevBtn = document.getElementById('win-btn-prev');
  const nextBtn = document.getElementById('win-btn-next');

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      reloadBtn.style.transform = 'rotate(360deg)';
      reloadBtn.style.transition = 'transform 0.6s ease';
      setTimeout(() => {
        reloadBtn.style.transform = 'none';
        reloadBtn.style.transition = '';
      }, 650);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const origTitle = shareBtn.getAttribute('title');
        shareBtn.setAttribute('title', 'Copied to Clipboard!');
        shareBtn.style.color = '#10b981';
        setTimeout(() => {
          shareBtn.setAttribute('title', origTitle);
          shareBtn.style.color = '';
        }, 2000);
      }).catch(() => {});
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
    });
  }
}


// ─── Theme Toggle (Dark / Light Mode) ────────────────────────────
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  if (!toggleBtns.length) return;

  function updateButtonTooltips(isLight) {
    toggleBtns.forEach(btn => {
      const modeText = isLight ? 'Dark' : 'Light';
      btn.setAttribute('title', `Switch to ${modeText} Mode`);
      if (btn.hasAttribute('data-tooltip')) {
        btn.setAttribute('data-tooltip', `Switch to ${modeText}`);
      }
    });
  }

  // Set initial tooltip text
  updateButtonTooltips(document.body.classList.contains('light-mode'));

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isNowLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('site-theme', isNowLight ? 'light' : 'dark');
      updateButtonTooltips(isNowLight);

      // Trigger button spin animation
      toggleBtns.forEach(b => {
        b.classList.add('rotating');
        setTimeout(() => b.classList.remove('rotating'), 500);
      });
    });
  });
}


// ─── Sunset Card 3D Tilt Interaction ─────────────────────────────
function initSunsetCardTilt() {
  const cardContainer = document.getElementById('sunset-card-container');
  const card = document.getElementById('sunset-card');
  if (!cardContainer || !card) return;

  cardContainer.addEventListener('mousemove', (e) => {
    const rect = cardContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 14}deg) translateY(-4px) scale(1.02)`;
  });

  cardContainer.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0) scale(1)';
  });
}


// ─── Wave Chart Interactive Toggle ───────────────────────────────
function initChartInteractivity() {
  const filterBtn = document.getElementById('btn-stat-filter');
  const tooltip = document.getElementById('chart-tooltip');
  if (!filterBtn || !tooltip) return;

  const states = [
    { label: 'All Competencies', tooltip: '85% Python Mastery' },
    { label: 'Skill Trajectory', tooltip: '15+ Technologies' },
    { label: 'Academic Merit', tooltip: '78.1% BCA · 95.2% 12th' }
  ];
  let stateIdx = 0;

  filterBtn.addEventListener('click', () => {
    stateIdx = (stateIdx + 1) % states.length;
    const span = filterBtn.querySelector('span');
    if (span) span.textContent = states[stateIdx].label;
    const tooltipSpan = tooltip.querySelector('span');
    if (tooltipSpan) tooltipSpan.textContent = states[stateIdx].tooltip;

    // Subtle scale pop
    tooltip.style.transform = 'translateY(-6px) scale(1.1)';
    setTimeout(() => {
      tooltip.style.transform = '';
    }, 250);
  });
}


// ─── Scroll Reveal Animations ────────────────────────────────────
function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}


// ─── Skill Bars Progress ─────────────────────────────────────────
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.width = entry.target.dataset.w + '%';
        }, 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  bars.forEach(b => observer.observe(b));
}


// ─── Footer Year ─────────────────────────────────────────────────
function initFooterYear() {
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
}
