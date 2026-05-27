'use strict';

/* ============================================================
   NAV — scroll behavior + mobile toggle
============================================================ */
const nav         = document.getElementById('nav');
const hamburger   = document.getElementById('hamburger');
const navMobile   = document.getElementById('navMobile');

function setNavSolid(solid) {
  nav.style.background = solid
    ? 'rgba(7, 16, 29, 0.99)'
    : 'rgba(7, 16, 29, 0.94)';
}

window.addEventListener('scroll', () => setNavSolid(window.scrollY > 24), { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('nav-open');
  hamburger.setAttribute('aria-expanded', isOpen);
  navMobile.setAttribute('aria-hidden', !isOpen);
});

// Close mobile nav on any link click
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMobile.setAttribute('aria-hidden', 'true');
  });
});

/* ============================================================
   SMOOTH SCROLL — all anchor links
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id     = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   SCROLL REVEAL — fade elements into view
============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger cards within a grid
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.querySelectorAll('.reveal')]
        : [];
      const idx = siblings.indexOf(entry.target);
      const delay = siblings.length > 1 ? idx * 70 : 0;

      setTimeout(() => entry.target.classList.add('in-view'), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   VIDEO PLACEHOLDER — click handlers
   (swap for real embed when video URL is available)
============================================================ */
function openVideoModal() {
  // Placeholder: replace with your actual video embed logic
  // e.g., inject an <iframe> with YouTube/Vimeo src or open a modal
  alert('Founder video coming soon. Drop the video URL in js/main.js to wire it up.');
}

document.querySelectorAll('.play-btn, .video-placeholder, .founder-video-card').forEach(el => {
  el.addEventListener('click', openVideoModal);
});

/* ============================================================
   JOIN FORM — client-side handling
   Replace the success handler body with your actual API call
============================================================ */
const joinForm  = document.getElementById('joinForm');
const joinCard  = joinForm ? joinForm.closest('.join-card') : null;

if (joinForm && joinCard) {
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = joinForm.querySelector('#submitBtn');
    btn.textContent = 'Submitting…';
    btn.disabled    = true;

    const data = {
      firstName:    joinForm.firstName.value.trim(),
      lastName:     joinForm.lastName.value.trim(),
      email:        joinForm.email.value.trim(),
      investorType: joinForm.investorType.value,
      city:         joinForm.city.value.trim(),
      submittedAt:  new Date().toISOString(),
    };

    // ── Replace this block with your real API / form service ──
    await new Promise(resolve => setTimeout(resolve, 600)); // simulate latency
    console.log('Form submission:', data);
    // ──────────────────────────────────────────────────────────

    // Show success state
    joinCard.innerHTML = `
      <div class="form-success">
        <div style="font-size:40px;margin-bottom:16px;">✓</div>
        <h3>You're on the list, ${data.firstName}.</h3>
        <p>
          We'll be in touch directly — no automated sequences, no noise.
          This is the beginning of something built with the community,
          and you're in early.
        </p>
        <p style="margin-top:12px;font-size:13px;color:rgba(255,255,255,0.3);">
          — Ryan &amp; The BTHI Team
        </p>
      </div>`;
  });
}

/* ============================================================
   ACTIVE NAV LINK — highlight current section
============================================================ */
const sections  = document.querySelectorAll('section[id], div[id="footer"]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const matches = link.getAttribute('href') === `#${id}`;
        link.style.color = matches ? 'var(--gold-bright)' : '';
      });
    });
  },
  { threshold: 0.3 }
);

sections.forEach(sec => sectionObserver.observe(sec));
