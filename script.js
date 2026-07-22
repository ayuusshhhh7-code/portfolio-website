/* ═══════════════════════════════════════
   SCRIPT.JS — Portfolio
   Three.js Waves + Editorial Interactions
   ═══════════════════════════════════════ */

'use strict';

// ─── Loader ───────────────────────────────────────
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loader-percent');
const loaderLine = document.getElementById('loader-line');

let loadPct = 0;
const loadInterval = setInterval(() => {
  loadPct += Math.floor(Math.random() * 12) + 3;
  if (loadPct >= 100) {
    loadPct = 100;
    clearInterval(loadInterval);
    loaderPct.textContent = '100%';
    if (loaderLine) loaderLine.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('gone');
      initApp();
    }, 600);
  }
  loaderPct.textContent = loadPct + '%';
  if (loaderLine) loaderLine.style.width = loadPct + '%';
}, 60);


// ─── Main Init ────────────────────────────────────
function initApp() {
  initThreeJS();
  initCursor();
  initNavbar();
  initTypewriter();
  initScrollReveal();
  initSkillBars();
  initCounters();
  initHamburger();
  initProfileParallax();
  document.getElementById('yr').textContent = new Date().getFullYear();
}


// ─── THREE.JS Waving Surface ──────────────────────
function initThreeJS() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  
  // Set up camera overlooking the wavy terrain
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.5, 7.5);
  camera.lookAt(0, 0, 0);

  // Soft ambient lighting fitting the warm light theme
  const ambientLight = new THREE.AmbientLight(0xf5f2eb, 0.8);
  scene.add(ambientLight);

  // Soft warm direction lights for fine shade details
  const dirLight1 = new THREE.DirectionalLight(0xfffaf5, 0.7);
  dirLight1.position.set(6, 10, 4);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xdcd7cd, 0.35);
  dirLight2.position.set(-6, 4, -3);
  scene.add(dirLight2);

  // Waving Plane Geometry (Subdivided plane for smooth waves)
  const width = 26;
  const height = 26;
  const widthSegments = 50;
  const heightSegments = 50;
  const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  
  // Rotate flat to act as ground ripples
  geometry.rotateX(-Math.PI / 2);
  
  // Create solid material with soft clay/sand texture
  const material = new THREE.MeshStandardMaterial({
    color: 0xeae6dd, // matches theme borders/surfaces
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true, // low-poly structural aesthetic
    side: THREE.DoubleSide
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -1.6; // slightly below viewport center
  scene.add(mesh);

  // Clone original vertex coordinates for reference offsets
  const originalPositions = geometry.attributes.position.clone();

  // Mouse Parallax Trackers
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Wave calculation
    const positionAttr = geometry.attributes.position;
    const count = positionAttr.count;

    for (let i = 0; i < count; i++) {
      const x = originalPositions.getX(i);
      const z = originalPositions.getZ(i);

      // Multi-sine wave overlay for organic wind-blown sand dune look
      const wave1 = Math.sin(x * 0.22 + time * 0.25) * 0.45;
      const wave2 = Math.cos(z * 0.18 + time * 0.2) * 0.4;
      const wave3 = Math.sin((x + z) * 0.12 + time * 0.3) * 0.25;
      const newY = originalPositions.getY(i) + wave1 + wave2 + wave3;

      positionAttr.setY(i, newY);
    }

    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Camera mouse follow parallax
    targetX += (mouseX * 0.6 - targetX) * 0.02;
    targetY += (mouseY * 0.3 - targetY) * 0.02;
    camera.position.x = targetX;
    camera.position.y = 3.5 + targetY;
    camera.lookAt(0, -0.6, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


// ─── Custom Cursor ────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Smooth follower calculation
    const dx = e.clientX - fx;
    const dy = e.clientY - fy;
    fx += dx * 0.12;
    fy += dy * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
  });

  const rf = () => {
    const dx = parseFloat(cursor.style.left || 0) - fx;
    const dy = parseFloat(cursor.style.top || 0) - fy;
    fx += dx * 0.12;
    fy += dy * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(rf);
  };
  rf();

  // Enlarge cursor on links and buttons
  document.querySelectorAll('a, button, [data-tilt], .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.5)';
      cursor.style.background = '#9c835c'; // gold accent
      follower.style.transform = 'translate(-50%,-50%) scale(1.3)';
      follower.style.borderColor = 'rgba(156,131,92,0.4)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = '#2c2a27'; // charcoal primary
      follower.style.transform = 'translate(-50%,-50%) scale(1)';
      follower.style.borderColor = 'rgba(44,42,39,0.15)';
    });
  });
}


// ─── Navbar Scroll Effect ─────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNav();
  });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-a');
  let current = '';

  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) {
      current = s.id;
    }
  });

  links.forEach(l => {
    l.classList.toggle('active', l.dataset.s === current);
  });
}


// ─── Hamburger Toggle ─────────────────────────────
function initHamburger() {
  const hbg = document.getElementById('hbg');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hbg || !mobileNav) return;

  hbg.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}


// ─── Typewriter Roles ─────────────────────────────
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const roles = ['Software Development', 'Data Analysis', 'Python Projects', 'Modern Web Apps', 'Problem Solving'];
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    if (deleting) {
      el.textContent = word.slice(0, --ci);
    } else {
      el.textContent = word.slice(0, ++ci);
    }

    let speed = deleting ? 50 : 80;
    if (!deleting && ci === word.length) {
      speed = 2200; // hold display
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      ri = (ri + 1) % roles.length;
      speed = 300; // transition delay
    }
    setTimeout(type, speed);
  }
  type();
}


// ─── Scroll Reveal ────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}


// ─── Skill Bars Progress ──────────────────────────
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.width = e.target.dataset.w + '%';
        }, 150);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  bars.forEach(b => io.observe(b));
}


// ─── Number Counters ──────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.count);
        let n = 0;
        const step = Math.max(1, target / 35);
        const timer = setInterval(() => {
          n += step;
          if (n >= target) {
            e.target.textContent = target;
            clearInterval(timer);
          } else {
            e.target.textContent = Math.floor(n);
          }
        }, 30);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
}


// ─── Profile Card Editorial Parallax ──────────────
function initProfileParallax() {
  const card = document.getElementById('profile-card-3d');
  if (!card) return;

  const container = card.parentElement;
  if (!container) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    // Normalise client coordinates relative to container center (-1 to 1)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    
    // Rotate card slightly for an elegant 3D tilt
    card.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });

  container.addEventListener('mouseleave', () => {
    // Reset back to original state
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    card.style.transition = 'transform 0.6s ease';
  });
}


// ─── Smooth Anchor Scroll ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
