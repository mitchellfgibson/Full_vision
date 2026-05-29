'use strict';

/* ============================================================
   BTHI · FOUNDING CAP TABLE
   Inline invite-code entry inside the pending row
============================================================ */

/* --- Demo allowlist of invite codes ---
   Replace with Supabase later:
     const { data, error } = await supabase
       .from('invitations').select('*').eq('code', code).single();
   --------------------------------------- */
const VALID_CODES = {
  'BTHI1': true,
  'FOUND': true,
  'SEAT7': true,
  'RYAN1': true,
  'DEMO5': true,
};

/* === A fun, illustrative 5-row cap table ===================== */
const CAP_TABLE = [
  { num: 1, holder: 'THE FOUNDER',       shares: '4,000', stake: '40.0%', status: 'allocated' },
  { num: 2, holder: 'THE OPTIMIST',      shares: '2,000', stake: '20.0%', status: 'allocated' },
  { num: 3, holder: 'THE OPERATOR',      shares: '1,500', stake: '15.0%', status: 'allocated' },
  { num: 4, holder: null /* you */,      shares: '1,500', stake: '15.0%', status: 'pending'   },
  { num: 5, holder: 'THE NEXT BELIEVER', shares: '1,000', stake: '10.0%', status: 'sealed'    },
];

function buildManifest() {
  const tbody = document.getElementById('manifestBody');
  const rows  = [];

  CAP_TABLE.forEach(row => {
    const num = String(row.num).padStart(3, '0');
    let holderCell, sharesCell, stakeCell, statusCell, rowClass;

    if (row.status === 'pending') {
      holderCell = `
        <div class="row-code-inputs" role="group" aria-label="5-character invitation code">
          <input type="text" inputmode="text" maxlength="1" autocomplete="off" data-code-box="0" aria-label="Code character 1">
          <input type="text" inputmode="text" maxlength="1" autocomplete="off" data-code-box="1" aria-label="Code character 2">
          <input type="text" inputmode="text" maxlength="1" autocomplete="off" data-code-box="2" aria-label="Code character 3">
          <input type="text" inputmode="text" maxlength="1" autocomplete="off" data-code-box="3" aria-label="Code character 4">
          <input type="text" inputmode="text" maxlength="1" autocomplete="off" data-code-box="4" aria-label="Code character 5">
        </div>`;
      sharesCell = `<span class="m-shares m-shares-pending">${row.shares}</span>`;
      stakeCell  = `<span class="m-stake m-stake-pending">${row.stake}</span>`;
      statusCell = `<span class="m-status m-status-pending">PENDING</span>`;
      rowClass   = 'm-row m-row-pending';
    } else if (row.status === 'allocated') {
      holderCell = `<span class="m-name m-name-holder">${row.holder}</span>`;
      sharesCell = `<span class="m-shares">${row.shares}</span>`;
      stakeCell  = `<span class="m-stake">${row.stake}</span>`;
      statusCell = `<span class="m-status m-status-claimed">✓ ALLOCATED</span>`;
      rowClass   = 'm-row m-row-filled';
    } else { // sealed
      holderCell = `<span class="m-name m-name-sealed">${row.holder}</span>`;
      sharesCell = `<span class="m-shares m-shares-locked">${row.shares}</span>`;
      stakeCell  = `<span class="m-stake m-stake-locked">${row.stake}</span>`;
      statusCell = `<span class="m-status m-status-locked">SEALED</span>`;
      rowClass   = 'm-row m-row-locked';
    }

    rows.push(`
      <tr class="${rowClass}" data-seat="${row.num}">
        <td class="col-num">#${num}</td>
        <td class="col-name">${holderCell}</td>
        <td class="col-shares">${sharesCell}</td>
        <td class="col-stake">${stakeCell}</td>
        <td class="col-status">${statusCell}</td>
      </tr>
    `);
  });

  tbody.innerHTML = rows.join('');
}

/* ============================================================
   Build the table, THEN wire up the inputs that now live in it
============================================================ */
buildManifest();

const codeInputs = document.querySelectorAll('[data-code-box]');
const submitBtn  = document.getElementById('codeSubmit');
const feedback   = document.getElementById('codeFeedback');
const form       = document.getElementById('codeForm');

function getCode() {
  return Array.from(codeInputs).map(i => i.value.toUpperCase()).join('');
}

function updateSubmitState() {
  const filled = getCode().length === 5;
  submitBtn.disabled = !filled;
  submitBtn.classList.toggle('is-ready', filled);
}

codeInputs.forEach((input, i) => {
  input.addEventListener('input', e => {
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    e.target.value = v.slice(0, 1);

    if (e.target.value && i < codeInputs.length - 1) {
      codeInputs[i + 1].focus();
    }

    feedback.textContent = '';
    feedback.className = 'code-feedback';
    updateSubmitState();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      codeInputs[i - 1].focus();
      codeInputs[i - 1].value = '';
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
  await new Promise(r => setTimeout(r, 650));
  const valid = !!VALID_CODES[code];

  if (!valid) {
    feedback.textContent = 'That code isn\'t recognized. Check your letter and try again.';
    feedback.className = 'code-feedback is-error';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Claim Row →';
    const panel = document.querySelector('.invite-panel');
    if (panel) {
      panel.classList.add('shake');
      setTimeout(() => panel.classList.remove('shake'), 500);
    }
    return;
  }

  // SUCCESS — lock the row in
  submitBtn.textContent = '✓ Row Claimed';
  submitBtn.classList.add('is-success');

  const youRow = CAP_TABLE.find(r => r.status === 'pending');
  const row    = document.querySelector('.m-row-pending');
  if (row && youRow) {
    row.classList.remove('m-row-pending');
    row.classList.add('m-row-claimed-now');
    row.querySelector('.col-name').innerHTML   = `<span class="m-name m-name-self">YOU · ${code}</span>`;
    row.querySelector('.col-shares').innerHTML = `<span class="m-shares m-shares-self">${youRow.shares}</span>`;
    row.querySelector('.col-stake').innerHTML  = `<span class="m-stake m-stake-self">${youRow.stake}</span>`;
    row.querySelector('.col-status').innerHTML = `<span class="m-status m-status-self">✓ ALLOCATED</span>`;
  }

  const claimedEl = document.getElementById('seatsClaimed');
  const openEl    = document.getElementById('seatsRemaining');
  if (claimedEl) claimedEl.textContent = '4';
  if (openEl)    openEl.textContent    = '1';

  setTimeout(() => {
    window.location.href = `index.html?code=${encodeURIComponent(code)}&open=signup`;
  }, 1400);
});

/* ============================================================
   PRE-FILL FROM URL ?code=XXXXX
============================================================ */
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  const clean = urlCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  clean.split('').forEach((c, idx) => {
    if (codeInputs[idx]) codeInputs[idx].value = c;
  });
  updateSubmitState();
  if (clean.length === 5) {
    setTimeout(() => form.requestSubmit(), 400);
  } else {
    codeInputs[clean.length] && codeInputs[clean.length].focus();
  }
} else {
  codeInputs[0] && codeInputs[0].focus();
}
