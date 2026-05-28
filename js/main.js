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
   ACCOUNT MODAL — open / close, tab switch, form stubs
   Auth backend (Supabase) hooks in inside handleSignIn / handleSignUp
============================================================ */
const accountModal = document.getElementById('accountModal');

if (accountModal) {
  const tabs       = accountModal.querySelectorAll('[data-account-tab]');
  const panels     = accountModal.querySelectorAll('[data-account-panel]');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  const openAccount = () => {
    accountModal.classList.add('is-open');
    accountModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('account-open');
    // close mobile nav if open
    nav.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMobile.setAttribute('aria-hidden', 'true');
    // focus first input shortly after open
    setTimeout(() => {
      const active = accountModal.querySelector('.account-form.is-active input');
      if (active) active.focus();
    }, 80);
  };

  const closeAccount = () => {
    accountModal.classList.remove('is-open');
    accountModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('account-open');
  };

  const switchTab = (target) => {
    tabs.forEach(t => {
      const match = t.dataset.accountTab === target;
      t.classList.toggle('is-active', match);
      t.setAttribute('aria-selected', match);
    });
    panels.forEach(p => {
      p.classList.toggle('is-active', p.dataset.accountPanel === target);
    });
    clearErrors();
  };

  // Triggers
  document.querySelectorAll('[data-account-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openAccount(); });
  });
  document.querySelectorAll('[data-account-close]').forEach(el => {
    el.addEventListener('click', closeAccount);
  });
  document.querySelectorAll('[data-account-tab]').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.accountTab));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && accountModal.classList.contains('is-open')) closeAccount();
  });

  // Error helpers
  const showError = (form, message) => {
    let err = form.querySelector('.account-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'account-error';
      form.querySelector('.account-submit').insertAdjacentElement('afterend', err);
    }
    err.textContent = message;
  };
  const clearErrors = () => {
    accountModal.querySelectorAll('.account-error').forEach(e => e.remove());
  };

  // ── SIGN IN handler ──────────────────────────────────────────
  // Wire Supabase here:
  //   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  async function handleSignIn(email, password) {
    await new Promise(r => setTimeout(r, 500)); // simulated latency
    console.log('Sign in attempt:', { email });
    return { ok: true };
  }

  // ── SIGN UP handler ──────────────────────────────────────────
  // Wire Supabase here:
  //   const { data, error } = await supabase.auth.signUp({ email, password });
  async function handleSignUp(email, password) {
    await new Promise(r => setTimeout(r, 500));
    console.log('Sign up attempt:', { email });
    return { ok: true };
  }

  // Sign In submit
  signInForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const email    = signInForm.email.value.trim();
    const password = signInForm.password.value;
    const btn      = signInForm.querySelector('.account-submit');

    if (!email || !password) {
      showError(signInForm, 'Please enter your email and password.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    const res = await handleSignIn(email, password);
    btn.disabled = false;
    btn.textContent = 'Sign In';

    if (!res.ok) {
      showError(signInForm, res.message || 'Invalid email or password.');
      return;
    }
    btn.textContent = '✓ Signed in';
    setTimeout(closeAccount, 700);
  });

  // Sign Up submit
  signUpForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const email   = signUpForm.email.value.trim();
    const pw      = signUpForm.password.value;
    const confirm = signUpForm.confirmPassword.value;
    const btn     = signUpForm.querySelector('.account-submit');

    if (pw.length < 8) {
      showError(signUpForm, 'Password must be at least 8 characters.');
      return;
    }
    if (pw !== confirm) {
      showError(signUpForm, 'Passwords don\'t match.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account…';
    const res = await handleSignUp(email, pw);
    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (!res.ok) {
      showError(signUpForm, res.message || 'Something went wrong. Try again.');
      return;
    }
    btn.textContent = '✓ Account created';
    setTimeout(() => {
      switchTab('signin');
      btn.textContent = 'Create Account';
    }, 900);
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
