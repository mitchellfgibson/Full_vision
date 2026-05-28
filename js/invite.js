'use strict';

/* ============================================================
   BTHI · FOUNDING MANIFEST
   Invite-code entry experience
============================================================ */

/* --- Demo allowlist of invite codes ---
   Replace with Supabase later:
     const { data, error } = await supabase
       .from('invitations')
       .select('seat_number, email, used_at')
       .eq('code', code)
       .single();
   --------------------------------------- */
const VALID_CODES = {
  'BTHI1': { seat: 47, name: 'YOU' },
  'FOUND': { seat: 47, name: 'YOU' },
  'SEAT7': { seat: 47, name: 'YOU' },
  'RYAN1': { seat: 47, name: 'YOU' },
  'DEMO5': { seat: 47, name: 'YOU' },
};

/* === MANIFEST DATA ===========================================
   Mostly redacted to feel exclusive. A few visible names sprinkled in
   for warmth. Row 47 = the pending seat (the visitor's row).
============================================================== */
const ROLES = ['founder', 'angel', 'operator', 'allocator', 'member', 'advisor'];
const SEEDED_NAMES = {
  3:  'R. Neely',
  7:  'M. Chen',
  12: 'A. Rodriguez',
  18: 'T. Williams',
  24: 'J. Park',
  31: 'L. Okafor',
  38: 'D. Becker',
  44: 'S. Kapoor',
};

function buildManifest() {
  const tbody = document.getElementById('manifestBody');
  const rows = [];
  const totalRows = 70; // visible window onto the 1000

  for (let i = 1; i <= totalRows; i++) {
    const seat = String(i).padStart(3, '0');
    const isPending = i === 47;
    const isFilled  = i < 47;
    const isLocked  = i > 47;

    let nameCell, roleCell, statusCell, rowClass;

    if (isPending) {
      nameCell = `<span class="m-code-row" id="manifestCodeRow">
                    <span class="m-cbx" data-mirror="0">_</span>
                    <span class="m-cbx" data-mirror="1">_</span>
                    <span class="m-cbx" data-mirror="2">_</span>
                    <span class="m-cbx" data-mirror="3">_</span>
                    <span class="m-cbx" data-mirror="4">_</span>
                  </span>`;
      roleCell = `<span class="m-role m-role-pending">your seat</span>`;
      statusCell = `<span class="m-status m-status-pending">PENDING</span>`;
      rowClass = 'm-row m-row-pending';
    } else if (isFilled) {
      const realName = SEEDED_NAMES[i];
      nameCell = realName
        ? `<span class="m-name m-name-real">${realName}</span>`
        : `<span class="m-name m-name-redacted">${redactedBar()}</span>`;
      const role = ROLES[i % ROLES.length];
      roleCell = `<span class="m-role">${role}</span>`;
      statusCell = `<span class="m-status m-status-claimed">✓ CLAIMED</span>`;
      rowClass = 'm-row m-row-filled';
    } else {
      nameCell = `<span class="m-name m-name-locked">${lockedBar()}</span>`;
      roleCell = `<span class="m-role m-role-locked">—</span>`;
      statusCell = `<span class="m-status m-status-locked">SEALED</span>`;
      rowClass = 'm-row m-row-locked';
    }

    rows.push(`
      <tr class="${rowClass}" data-seat="${i}">
        <td class="col-num">#${seat}</td>
        <td class="col-name">${nameCell}</td>
        <td class="col-role">${roleCell}</td>
        <td class="col-status">${statusCell}</td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.join('');

  // Center the pending row on load
  requestAnimationFrame(() => {
    const pending = tbody.querySelector('.m-row-pending');
    const scroll  = document.getElementById('manifestScroll');
    if (pending && scroll) {
      const offset = pending.offsetTop - (scroll.clientHeight / 2) + (pending.clientHeight / 2);
      scroll.scrollTo({ top: offset, behavior: 'auto' });
    }
  });
}

function redactedBar() {
  const widths = [10, 11, 12, 13, 9, 14];
  const w = widths[Math.floor(Math.random() * widths.length)];
  return '█'.repeat(w);
}
function lockedBar() {
  return '░'.repeat(11);
}

/* ============================================================
   CODE INPUT — 5-box typing experience
============================================================ */
const codeInputs = document.querySelectorAll('[data-code-box]');
const submitBtn  = document.getElementById('codeSubmit');
const feedback   = document.getElementById('codeFeedback');
const form       = document.getElementById('codeForm');
const mirrors    = () => document.querySelectorAll('.m-cbx');

function getCode() {
  return Array.from(codeInputs).map(i => i.value.toUpperCase()).join('');
}

function syncMirror() {
  const ms = mirrors();
  codeInputs.forEach((inp, i) => {
    const v = inp.value.toUpperCase();
    if (ms[i]) ms[i].textContent = v || '_';
    if (ms[i]) ms[i].classList.toggle('filled', !!v);
  });
}

function updateSubmitState() {
  const filled = getCode().length === 5;
  submitBtn.disabled = !filled;
  submitBtn.classList.toggle('is-ready', filled);
}

codeInputs.forEach((input, i) => {
  input.addEventListener('input', e => {
    // Force uppercase alphanumeric
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    e.target.value = v.slice(0, 1);

    if (e.target.value && i < codeInputs.length - 1) {
      codeInputs[i + 1].focus();
    }

    feedback.textContent = '';
    feedback.className = 'code-feedback';
    syncMirror();
    updateSubmitState();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      codeInputs[i - 1].focus();
      codeInputs[i - 1].value = '';
      syncMirror();
      updateSubmitState();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
    if (e.key === 'ArrowLeft' && i > 0)   codeInputs[i - 1].focus();
    if (e.key === 'ArrowRight' && i < 4)  codeInputs[i + 1].focus();
  });

  input.addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text')
      .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    text.split('').forEach((c, idx) => {
      if (codeInputs[idx]) codeInputs[idx].value = c;
    });
    syncMirror();
    updateSubmitState();
    const last = Math.min(text.length, codeInputs.length - 1);
    codeInputs[last] && codeInputs[last].focus();
  });
});

/* ============================================================
   FORM SUBMIT — validate code
============================================================ */
form.addEventListener('submit', async e => {
  e.preventDefault();
  const code = getCode();
  if (code.length !== 5) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying…';
  feedback.textContent = '';
  feedback.className = 'code-feedback';

  // ── Replace with Supabase call ─────────────────────────────
  //   const { data, error } = await supabase
  //     .from('invitations').select('*').eq('code', code).single();
  //   const valid = !!data && !data.used_at;
  // ───────────────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 650));
  const valid = !!VALID_CODES[code];

  if (!valid) {
    feedback.textContent = 'That code isn\'t recognized. Check your letter and try again.';
    feedback.className = 'code-feedback is-error';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Claim Seat →';
    document.querySelector('.entry-card').classList.add('shake');
    setTimeout(() => document.querySelector('.entry-card').classList.remove('shake'), 500);
    return;
  }

  // SUCCESS — lock the row in
  submitBtn.textContent = '✓ Seat Claimed';
  submitBtn.classList.add('is-success');

  const row = document.querySelector('.m-row-pending');
  if (row) {
    row.classList.remove('m-row-pending');
    row.classList.add('m-row-claimed-now');
    const nameCell = row.querySelector('.col-name');
    nameCell.innerHTML = `<span class="m-name m-name-self">YOUR SEAT · ${code}</span>`;
    row.querySelector('.col-role').innerHTML = `<span class="m-role m-role-self">founding member</span>`;
    row.querySelector('.col-status').innerHTML = `<span class="m-status m-status-self">✓ CLAIMED</span>`;
  }

  // Bump seat counter
  const claimedEl   = document.getElementById('seatsClaimed');
  const remainingEl = document.getElementById('seatsRemaining');
  if (claimedEl)   claimedEl.textContent = '47';
  if (remainingEl) remainingEl.textContent = '953';

  // Brief celebration, then route into account creation
  setTimeout(() => {
    window.location.href = `index.html?code=${encodeURIComponent(code)}&open=signup`;
  }, 1400);
});

/* ============================================================
   INITIALIZE
============================================================ */
buildManifest();

// Pre-fill from query string ?code=XXXXX
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  const clean = urlCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  clean.split('').forEach((c, idx) => {
    if (codeInputs[idx]) codeInputs[idx].value = c;
  });
  syncMirror();
  updateSubmitState();
  if (clean.length === 5) {
    setTimeout(() => form.requestSubmit(), 400);
  } else {
    codeInputs[clean.length] && codeInputs[clean.length].focus();
  }
} else {
  codeInputs[0].focus();
}
