/* ====== scripts.js — final ====== */

/* LOCAL HERO IMAGE PATH (for local preview) */
const LOCAL_HERO_PATH = 'images/uploads/profile.png';

/* ---- Load portfolio.json and fill UI ---- */
async function loadPortfolio(){
  try {
    const res = await fetch('/static/portfolio.json', {cache: "no-store"});
    if(!res.ok) throw new Error('Portfolio data not found');

    const data = await res.json();

    // Basic fields (safe checks)
    if (data.siteTitle) {
      const st = document.getElementById('siteTitle');
      if (st) st.textContent = data.siteTitle;
    }
    if (data.heroTitle) {
      const ht = document.getElementById('heroTitle');
      if (ht) ht.textContent = data.heroTitle;
    }
    if (data.heroSubtitle) {
      const hs = document.getElementById('heroSubtitle');
      if (hs) hs.textContent = data.heroSubtitle;
    }
    if (data.about) {
      const at = document.getElementById('aboutText');
      if (at) at.textContent = data.about;
    }

    // Contact
    if (data.email) {
      const contactEmail = document.getElementById('contactEmail');
      if (contactEmail) {
        contactEmail.href = `mailto:${data.email}`;
        contactEmail.textContent = data.email;
      }
      const emailLink = document.getElementById('emailLink');
      if (emailLink) emailLink.href = `mailto:${data.email}`;
    }
    if (data.linkedin) {
      const ln = document.getElementById('linkedinLink');
      if (ln) ln.href = data.linkedin;
    }
    if (data.resume) {
      const r = document.getElementById('resumeLink');
      if (r) r.href = data.resume;
    }

    // Hero image — prefer CMS path if provided, else use local preview path
    const heroImg = document.getElementById('heroImage');
    if (heroImg) {
      heroImg.src = (data.heroImage && data.heroImage.trim().length) ? data.heroImage : LOCAL_HERO_PATH;
      // add alt if available
      heroImg.alt = data.siteTitle ? `${data.siteTitle} — profile` : 'Profile';
    }

    // Skills
    renderSkillBadges(data.skills || []);

    // Projects
    renderProjects(data.projects || []);

  } catch (err) {
    console.warn('Error loading portfolio:', err);
  }
}

/* ---- Render skill badges (animated) ---- */
function renderSkillBadges(skills) {
  const container = document.getElementById('skillsBadges');
  if (!container) return;
  container.innerHTML = '';

  skills.forEach((skill, index) => {
    const btn = document.createElement('button');
    btn.className = 'skill-badge';
    btn.type = 'button';
    btn.textContent = skill;
    btn.style.setProperty('--i', index);
    btn.setAttribute('aria-label', skill);
    container.appendChild(btn);
  });

  // IntersectionObserver for reveal
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-badge').forEach(b => b.classList.add('visible'));
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    obs.observe(container);
  } else {
    container.querySelectorAll('.skill-badge').forEach(b => b.classList.add('visible'));
  }
}

/* ---- Render projects (grid) ---- */
function renderProjects(projects = []) {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  grid.innerHTML = '';

  projects.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'project-card fade-up';
    const imgSrc = p.image && p.image.trim() ? p.image : LOCAL_HERO_PATH;
    card.innerHTML = `
      <div class="project-media"><img src="${imgSrc}" alt="${escapeHtml(p.title || 'Project')}" loading="lazy"></div>
      <div class="project-body"><h3>${escapeHtml(p.title || 'Untitled')}</h3><p>${escapeHtml(p.description || '')}</p></div>
    `;
    grid.appendChild(card);
    setTimeout(()=> card.classList.add('show'), i * 80);
  });
}

/* small helper to avoid injecting raw HTML from JSON */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[m];
  });
}

/* ---- Full-screen overlay menu (Clean + centered) ---- */
(function setupOverlayMenu(){
    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay-menu';
    overlay.id = 'overlayMenu';
    overlay.innerHTML = `
      <div class="overlay-inner">
        <button class="overlay-close" id="overlayClose" aria-label="Close menu">×</button>
        <nav class="overlay-nav" id="overlayNav">
          <a href="#projects">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    `;
    document.body.appendChild(overlay);
  
    const menuBtn = document.getElementById('menuBtn');
    const overlayMenu = document.getElementById('overlayMenu');
    const overlayClose = document.getElementById('overlayClose');
  
    function toggleOverlay(open) {
      if (open) {
        overlayMenu.classList.add('open');
        document.body.classList.add('overlay-open');
        menuBtn.setAttribute('aria-expanded', 'true');
      } else {
        overlayMenu.classList.remove('open');
        document.body.classList.remove('overlay-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  
    menuBtn.addEventListener('click', () => toggleOverlay(true));
    overlayClose.addEventListener('click', () => toggleOverlay(false));
  
    // Click outside inner area closes menu
    overlayMenu.addEventListener('click', (e) => {
      if (e.target === overlayMenu) toggleOverlay(false);
    });
  
    // Close when any nav link is clicked
    overlayMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleOverlay(false));
    });
  
    // ESC key closes menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleOverlay(false);
    });
  })();
  

/* ---- Parallax & shape movement (subtle) ---- */
(function heroParallax(){
  const heroCard = document.getElementById('heroCard');
  const shapes = document.querySelectorAll('.hero-shapes .shape');
  const heroSection = document.getElementById('heroSection');

  function onScroll(){
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const offset = Math.max(-rect.top, 0);

    if (heroCard) heroCard.style.transform = `translateY(${Math.min(offset * 0.08, 20)}px)`;

    shapes.forEach((s, i) => {
      const amt = Math.min(offset * (0.03 * (i + 1)), 30);
      s.style.transform = `translateY(${amt}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  loadPortfolio();
});
