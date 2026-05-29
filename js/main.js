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
  const tabs        = accountModal.querySelectorAll('[data-account-tab]');
  const panels      = accountModal.querySelectorAll('[data-account-panel]');
  const signInForm  = document.getElementById('signInForm');
  const signUpForm  = document.getElementById('signUpForm');
  const codeBadge   = document.getElementById('accountCodeBadge');
  const codeValue   = document.getElementById('accountCodeValue');

  // Read invite code from URL (?code=XXXXX)
  const urlParams   = new URLSearchParams(window.location.search);
  let inviteCode    = (urlParams.get('code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);

  function applyInviteCode() {
    if (inviteCode && inviteCode.length === 5) {
      if (codeValue) codeValue.textContent = inviteCode;
      if (codeBadge) codeBadge.classList.add('is-valid');
    } else {
      if (codeValue) codeValue.textContent = 'NONE';
      if (codeBadge) codeBadge.classList.remove('is-valid');
    }
  }
  applyInviteCode();

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

  // ── SIGN IN — real Supabase auth ─────────────────────────────
  async function handleSignIn(email, password) {
    const sb = window.bthiSupabase;
    if (!sb) return { ok: false, message: 'Auth service unavailable. Refresh and try again.' };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, user: data.user };
  }

  // ── SIGN UP — invite-gated + real Supabase auth ──────────────
  async function handleSignUp(email, password, code, profile) {
    const sb = window.bthiSupabase;
    if (!sb) return { ok: false, message: 'Auth service unavailable. Refresh and try again.' };

    // 1. Re-verify the invitation code (defense-in-depth — also checked at /invite)
    const { data: inv, error: invErr } = await sb
      .from('invitations')
      .select('code, used_at')
      .eq('code', code)
      .maybeSingle();
    if (invErr) return { ok: false, message: 'Could not verify invitation. Try again.' };
    if (!inv)   return { ok: false, message: 'Invitation code not recognized.' };
    if (inv.used_at) return { ok: false, message: 'This invitation code has already been used.' };

    // 2. Create the auth user with profile metadata
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          invitation_code: code,
          first_name: profile.firstName,
          last_name:  profile.lastName,
          city:       profile.city,
        },
      },
    });
    if (error) return { ok: false, message: error.message };

    // 3. Mark the code claimed
    await sb.from('invitations')
      .update({
        used_at: new Date().toISOString(),
        email,
        user_id: data.user ? data.user.id : null,
      })
      .eq('code', code);

    return { ok: true, user: data.user };
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
    refreshAccountNav();
    setTimeout(closeAccount, 700);
  });

  // ── Avatar + profile state ──────────────────────────────────
  let currentUser = null;

  function initialsFor(user) {
    const m  = user.user_metadata || {};
    const fn = (m.first_name || '').trim();
    const ln = (m.last_name  || '').trim();
    if (fn || ln) return ((fn[0] || '') + (ln[0] || '')).toUpperCase();
    return (user.email || '?')[0].toUpperCase();
  }
  function fullName(user) {
    const m  = user.user_metadata || {};
    const fn = (m.first_name || '').trim();
    const ln = (m.last_name  || '').trim();
    return `${fn} ${ln}`.trim() || 'BTHI Member';
  }

  function populateProfile(user) {
    const m = user.user_metadata || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('profileName',  fullName(user));
    set('profileEmail', user.email || '—');
    set('profileCity',  m.city || '—');
    set('profileCode',  m.invitation_code || '—');
    const since = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    }) : '—';
    set('profileSince', since);
    const avatar = document.getElementById('profileAvatar');
    if (avatar) avatar.innerHTML = `<span>${initialsFor(user)}</span>`;
  }

  function applySessionUI(user) {
    currentUser = user || null;
    document.body.classList.toggle('is-signed-in', !!user);

    // Swap nav button: text "Account" → initials avatar
    document.querySelectorAll('.nav-account').forEach(btn => {
      if (user) {
        btn.classList.add('has-user');
        btn.innerHTML = `<span class="nav-avatar-initials">${initialsFor(user)}</span>`;
        btn.setAttribute('aria-label', `Account · ${fullName(user)}`);
      } else {
        btn.classList.remove('has-user');
        btn.textContent = 'Account';
        btn.setAttribute('aria-label', 'Account');
      }
    });
    document.querySelectorAll('.nav-mobile-account').forEach(btn => {
      if (btn.tagName === 'BUTTON') {
        btn.textContent = user ? `My Account (${initialsFor(user)})` : 'Account';
      }
    });

    if (user) populateProfile(user);
  }

  async function refreshAccountNav() {
    const sb = window.bthiSupabase;
    if (!sb) return;
    const { data: { user } } = await sb.auth.getUser();
    applySessionUI(user);
  }

  // Sign out handler
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      const sb = window.bthiSupabase;
      signOutBtn.textContent = 'Signing out…';
      if (sb) await sb.auth.signOut();
      applySessionUI(null);
      signOutBtn.textContent = 'Sign Out';
      switchTab('signin');
      closeAccount();
    });
  }

  // When opening the modal: if signed in, jump to profile view
  document.querySelectorAll('[data-account-open]').forEach(el => {
    el.addEventListener('click', () => {
      switchTab(currentUser ? 'profile' : 'signin');
    });
  });

  refreshAccountNav();

  // Sign Up submit
  signUpForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const firstName = signUpForm.firstName.value.trim();
    const lastName  = signUpForm.lastName.value.trim();
    const city      = signUpForm.city.value.trim();
    const email     = signUpForm.email.value.trim();
    const pw        = signUpForm.password.value;
    const confirm   = signUpForm.confirmPassword.value;
    const btn       = signUpForm.querySelector('.account-submit');

    if (!inviteCode || inviteCode.length !== 5) {
      showError(signUpForm, 'A valid invitation code is required. Enter your code at /invite.');
      return;
    }
    if (!firstName || !lastName || !city) {
      showError(signUpForm, 'Please fill in name and city.');
      return;
    }
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
    const res = await handleSignUp(email, pw, inviteCode, { firstName, lastName, city });
    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (!res.ok) {
      showError(signUpForm, res.message || 'Something went wrong. Try again.');
      return;
    }
    // Replace the form with a success state — they need to confirm their email
    const panel = document.querySelector('[data-account-panel="signup"]');
    if (panel) {
      panel.innerHTML = `
        <h3 class="account-title">Check your email.</h3>
        <p class="account-lead">
          We just sent a confirmation link to <strong>${email}</strong>.
          Click it to activate your BTHI account and sign in.
        </p>
        <button type="button" class="account-submit is-success" data-account-close>Got it</button>
      `;
      panel.querySelector('[data-account-close]').addEventListener('click', closeAccount);
    }
  });

  // Auto-open if URL says so (?open=signup or ?open=signin)
  const openParam = urlParams.get('open');
  if (openParam === 'signup' || openParam === 'signin') {
    setTimeout(() => {
      switchTab(openParam);
      openAccount();
    }, 200);
  }
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
