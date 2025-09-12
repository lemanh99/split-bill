(function() {
  let currency = 'USD';
  let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  const form = document.getElementById('split-form');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const tipEl = document.getElementById('tip');
  const peopleEl = document.getElementById('people');
  const roundUpEl = document.getElementById('round-up');
  const tipBtns = Array.from(document.querySelectorAll('.tip-btn'));
  const decBtn = document.getElementById('dec-people');
  const incBtn = document.getElementById('inc-people');
  const addPersonBtn = document.getElementById('add-person');
  const participantsWrap = document.getElementById('participants');
  const autoSplitEl = document.getElementById('auto-split');
  const shareBtn = document.getElementById('share-breakdown');
  const currencyEl = document.getElementById('currency');
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', VND: '₫', AUD: '$' };
  const toggleTaxEl = document.getElementById('toggle-tax');
  const taxWrapEl = document.getElementById('tax-wrap');
  const toggleTipEl = document.getElementById('toggle-tip');
  const tipWrapEl = document.getElementById('tip-wrap');
  const tipAmountEl = document.getElementById('tip-amount');
  const taxAmountEl = document.getElementById('tax-amount');
  const taxPresetBtns = document.querySelectorAll('.tax-btn');

  const outSubtotal = document.getElementById('out-subtotal');
  const outTax = document.getElementById('out-tax');
  const outTip = document.getElementById('out-tip');
  const outTotal = document.getElementById('out-total');
  const outPerPerson = document.getElementById('out-per-person');
  const roundingNote = document.getElementById('rounding-note');
  const outPeople = document.getElementById('out-people');
  const allocationWarning = document.getElementById('allocation-warning');
  let participantsEverEdited = false;
  function getCurrencyDecimals() {
    const cur = (document.getElementById('currency')?.value) || 'USD';
    return (cur === 'VND' || cur === 'JPY') ? 0 : 2;
  }

  let participants = [];

  function createParticipant(index, name) {
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm';

    wrapper.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold select-none avatar">${(name || 'G')[0].toUpperCase()}</div>
        <input class="flex-1 rounded-lg border border-slate-300 py-2 px-3 text-sm focus-ring person-name font-medium" placeholder="Name ${index+1}" value="${name}">
        <button type="button" class="remove-person text-slate-400 hover:text-slate-700" title="Remove">✕</button>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="flex rounded-lg border border-slate-300 overflow-hidden">
          <button type="button" class="mode-btn basis-1/2 py-2 text-sm font-medium hover:bg-slate-50" data-mode="percent">Percent</button>
          <button type="button" class="mode-btn basis-1/2 py-2 text-sm font-medium hover:bg-slate-50" data-mode="amount">Amount</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="relative">
            <input class="percent-input w-full rounded-lg border border-slate-300 py-2 pl-3 pr-6 text-sm focus-ring" inputmode="decimal" placeholder="%" />
            <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">%</span>
          </div>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-2 flex items-center text-slate-500 currency-symbol">$</span>
            <input class="amount-input w-full rounded-lg border border-slate-300 py-2 pl-6 pr-2 text-sm focus-ring" inputmode="decimal" placeholder="0.00" />
          </div>
        </div>
      </div>
    `;

    participantsWrap.appendChild(wrapper);

    const nameEl = wrapper.querySelector('.person-name');
    const avatarEl = wrapper.querySelector('.avatar');
    const modeBtns = wrapper.querySelectorAll('.mode-btn');
    const percentEl = wrapper.querySelector('.percent-input');
    const amountEl = wrapper.querySelector('.amount-input');
    const removeBtn = wrapper.querySelector('.remove-person');

    const person = { nameEl, avatarEl, percentEl, amountEl, mode: 'percent', wrapper };
    participants.push(person);

    function setMode(mode) {
      person.mode = mode;
      modeBtns.forEach(btn => {
        const active = btn.dataset.mode === mode;
        btn.classList.toggle('bg-brand-600', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('border-brand-600', active);
      });
      percentEl.disabled = mode !== 'percent' || (autoSplitEl && autoSplitEl.checked);
      amountEl.disabled = mode !== 'amount' || (autoSplitEl && autoSplitEl.checked);
      compute();
    }
    person.setMode = setMode;

    modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    nameEl.addEventListener('input', () => {
      const val = (nameEl.value || 'G').trim();
      avatarEl.textContent = (val[0] || 'G').toUpperCase();
      compute();
    });
    percentEl.addEventListener('input', () => { participantsEverEdited = true; setMode('percent'); });
    amountEl.addEventListener('input', () => {
      participantsEverEdited = true;
      setMode('amount');
      // When typing a fixed amount, clear percent for this participant
      percentEl.value = '';
    });
    removeBtn.addEventListener('click', () => {
      wrapper.remove();
      participants = participants.filter(p => p !== person);
      peopleEl.value = String(Math.max(0, Math.floor(toNumber(peopleEl.value)) - 1));
      compute();
    });

    // Default mode percent
    setMode('percent');
  }

  function ensureParticipantsCount(count) {
    const current = participants.length;
    if (current < count) {
      for (let i = current; i < count; i++) {
        createParticipant(i, `Guest ${i+1}`);
      }
    } else if (current > count) {
      for (let i = current - 1; i >= count; i--) {
        participants[i].wrapper.remove();
        participants.pop();
      }
    }
  }

  function toNumber(value) {
    if (value == null) return 0;
    const cleaned = String(value).replace(/[^0-9.,-]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

  function highlightTip(percent) {
    tipBtns.forEach(btn => {
      const isActive = Number(btn.dataset.tip) === percent;
      btn.classList.toggle('bg-brand-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('border-brand-600', isActive);
    });
  }

  function compute() {
    const subtotal = Math.max(0, toNumber(subtotalEl.value));
    const taxPercentStr = taxEl ? String(taxEl.value || '').trim() : '';
    const tipPercentStr = tipEl ? String(tipEl.value || '').trim() : '';
    let taxPct = 0;
    if (toggleTaxEl && toggleTaxEl.checked && taxPercentStr !== '') {
      taxPct = clamp(toNumber(taxPercentStr), 0, 100);
    }
    let tipPct = 0;
    if (toggleTipEl && toggleTipEl.checked && tipPercentStr !== '') {
      tipPct = Math.max(0, toNumber(tipPercentStr || 5));
    }
    let people = Math.floor(Math.max(1, toNumber(peopleEl.value)));
    peopleEl.value = String(people);
    ensureParticipantsCount(people);

    let taxAmount = 0;
    if (toggleTaxEl && toggleTaxEl.checked) {
      if (taxPercentStr !== '') {
        taxAmount = subtotal * (taxPct / 100);
      } else if (taxAmountEl) {
        taxAmount = Math.max(0, toNumber(taxAmountEl.value));
      }
    }
    const basePlusTax = subtotal + taxAmount;
    let tipAmount = 0;
    if (toggleTipEl && toggleTipEl.checked) {
      if (tipPercentStr !== '') {
        tipAmount = basePlusTax * (tipPct / 100);
      } else if (tipAmountEl) {
        tipAmount = Math.max(0, toNumber(tipAmountEl.value));
      }
    }
    const total = basePlusTax + tipAmount;

    // Reflect calculated amounts back to amount inputs when percent is active
    const decimalsCalc = getCurrencyDecimals();
    if (toggleTaxEl && toggleTaxEl.checked && taxAmountEl) {
      if (taxPercentStr !== '') {
        taxAmountEl.value = taxAmount.toFixed(decimalsCalc);
      }
    }
    if (toggleTipEl && toggleTipEl.checked && tipAmountEl) {
      if (tipPercentStr !== '') {
        tipAmountEl.value = tipAmount.toFixed(decimalsCalc);
      }
    }

    // Default per-person
    let perPerson = total / Math.max(1, people);
    const cents = Math.round(perPerson * 100) / 100;
    const rounded = roundUpEl.checked ? Math.ceil(perPerson * 100) / 100 : cents;
    const usedPerPerson = rounded;
    const reconTotal = usedPerPerson * Math.max(1, people);
    const roundingAdjustment = reconTotal - total;

    // Outputs
    outSubtotal.textContent = formatter.format(subtotal);
    outTax.textContent = formatter.format(taxAmount);
    outTip.textContent = formatter.format(tipAmount);
    outTotal.textContent = formatter.format(total);
    outPerPerson.textContent = formatter.format(usedPerPerson);
    roundingNote.classList.toggle('hidden', Math.abs(roundingAdjustment) < 0.005);

    // Allocation
    const perList = [];
    let warningMsg = '';
    if (autoSplitEl && autoSplitEl.checked) {
      // Equal split among participants; adjust first for rounding diff
      const n = Math.max(1, participants.length);
      const base = total / n;
      const roundedEach = Math.round(base * 100) / 100;
      let allocated = roundedEach * n;
      let diff = total - allocated;
      participants.forEach((p, idx) => {
        let owed = roundedEach;
        if (idx === 0) owed += diff;
        perList.push({ name: (p.nameEl.value || '').trim() || 'Guest', owed: Math.max(0, owed) });
      });
    } else {
      // amount-mode gets fixed, remaining distributed by percent among others
      const fixedAmounts = participants.map(p => ({ p, amount: p.mode === 'amount' ? Math.max(0, toNumber(p.amountEl.value)) : 0 }));
      let sumFixed = fixedAmounts.reduce((s, it) => s + it.amount, 0);
      const overFixed = sumFixed > total + 1e-9;
      if (sumFixed > total) sumFixed = total; // cap to avoid negative remaining
      const remaining = Math.max(0, total - sumFixed);
      const percentEntries = participants.filter(p => p.mode === 'percent');
      let percentSum = percentEntries.reduce((s, p) => s + Math.max(0, toNumber(p.percentEl.value)), 0);
      const countPercent = percentEntries.length;
      // Auto-fill equal percentages on pristine state
      if (!participantsEverEdited && countPercent > 0) {
        const eq = 100 / Math.max(1, countPercent);
        percentEntries.forEach(p => { p.percentEl.value = String(Math.round(eq * 1000) / 1000); });
        percentSum = 100;
      }
      participants.forEach(p => {
        let owed = 0;
        if (p.mode === 'amount') {
          owed = Math.max(0, toNumber(p.amountEl.value));
        } else {
          if (countPercent === 0) {
            owed = remaining / Math.max(1, participants.length);
          } else if (percentSum <= 0) {
            owed = 0;
          } else {
            const pct = Math.max(0, toNumber(p.percentEl.value));
            owed = remaining * (pct / percentSum);
          }
        }
        if (owed < 0) owed = 0;
        perList.push({ name: (p.nameEl.value || '').trim() || 'Guest', owed });
      });
      // Compare allocation and provide useful warnings
      const allocated = perList.reduce((s, it) => s + it.owed, 0);
      const gap = total - allocated;
      if (overFixed) {
        warningMsg = 'Warning: Fixed amounts exceed total. Please reduce some amounts.';
      } else if (countPercent > 0 && Math.abs(percentSum - 100) > 0.5) {
        // Percents don't sum to 100% (of the remaining). We still scale proportionally, but warn.
        warningMsg = 'Warning: Percents do not sum to 100%. They were scaled proportionally.';
      } else if (Math.abs(gap) >= 0.01) {
        warningMsg = gap > 0 ? 'Warning: Unallocated amount remains. Please adjust shares.' : 'Warning: Allocations exceed total. Please adjust shares.';
      }
    }

    // Render people outputs
    outPeople.innerHTML = '';
    perList.forEach(item => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2';
      row.innerHTML = `<span class="text-slate-700">${item.name}</span><span class="font-medium">${formatter.format(Math.max(0, item.owed))}</span>`;
      outPeople.appendChild(row);
    });
    if (warningMsg) {
      allocationWarning.textContent = warningMsg;
      allocationWarning.classList.remove('hidden');
    } else {
      allocationWarning.classList.add('hidden');
      allocationWarning.textContent = '';
    }

    // Auto-fill participant inputs for visibility on any bill change
    const decimals = getCurrencyDecimals();
    const equalPercent = (participants.length > 0) ? (100 / participants.length) : 0;
    participants.forEach((p, idx) => {
      const owed = perList[idx] ? perList[idx].owed : 0;
      if (autoSplitEl && autoSplitEl.checked) {
        p.percentEl.value = equalPercent.toFixed(2);
        p.amountEl.value = owed.toFixed(decimals);
      } else {
        if (!participantsEverEdited) {
          p.percentEl.value = equalPercent.toFixed(2);
        }
        if (p.mode === 'percent') {
          // For percent-mode, always reflect computed amount
          p.amountEl.value = owed.toFixed(decimals);
        }
      }
    });

    return {
      subtotal, taxPct, tipPct, taxAmount, tipAmount, total, people, perPerson: usedPerPerson, roundingAdjustment, perList
    };
  }

  function generateBreakdownText() {
    const r = compute();
    const lines = [
      `Subtotal: ${formatter.format(r.subtotal)}`,
      `Tax (${r.taxPct}%): ${formatter.format(r.taxAmount)}`,
      `Tip (${r.tipPct}%): ${formatter.format(r.tipAmount)}`,
      `Total: ${formatter.format(r.total)}`,
      `People: ${r.people}`,
      `Per person: ${formatter.format(r.perPerson)}`,
    ];
    if (Math.abs(r.roundingAdjustment) >= 0.005) {
      const adj = r.roundingAdjustment;
      lines.push(`Rounding adjustment: ${formatter.format(adj)}`);
    }
    return lines.join('\n');
  }

  function showShareModal() {
    const breakdown = generateBreakdownText();
    const encodedData = encodeURIComponent(breakdown);
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    
    document.getElementById('share-url').value = shareUrl;
    generateQRCode(shareUrl);
    
    const shareModal = document.getElementById('share-modal');
    shareModal.classList.remove('hidden');
    shareModal.classList.add('flex');
  }

  function generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code');
    // Simple QR code generation using a free service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="w-32 h-32">`;
  }

  // Bindings
  form.addEventListener('input', () => {
    // Align preset highlight when custom tip changes
    const val = Math.round(toNumber(tipEl.value));
    highlightTip(val);
    compute();
  });
  form.addEventListener('reset', (e) => {
    setTimeout(() => {
      peopleEl.value = '2';
      roundUpEl.checked = false;
      tipBtns.forEach(b => b.classList.remove('bg-brand-600','text-white','border-brand-600'));
      compute();
    }, 0);
  });

  // Removed NYC quick-fill; use generic tax input
  tipBtns.forEach(btn => btn.addEventListener('click', () => {
    const pct = Number(btn.dataset.tip);
    tipEl.value = String(pct);
    highlightTip(pct);
    compute();
  }));
  decBtn.addEventListener('click', () => { const n = Math.max(1, Math.floor(toNumber(peopleEl.value)) - 1); peopleEl.value = String(n); compute(); });
  incBtn.addEventListener('click', () => { const n = Math.max(1, Math.floor(toNumber(peopleEl.value)) + 1); peopleEl.value = String(n); compute(); });
  addPersonBtn.addEventListener('click', () => { peopleEl.value = String(Math.floor(toNumber(peopleEl.value)) + 1); compute(); });
  if (autoSplitEl) {
    autoSplitEl.addEventListener('change', () => {
      participants.forEach(p => {
        if (typeof p.setMode === 'function') {
          p.setMode(p.mode);
        }
      });
      compute();
    });
  }
  shareBtn.addEventListener('click', (e) => { e.preventDefault(); showShareModal(); });

  function updateCurrency(newCurrency) {
    currency = newCurrency;
    const locale = newCurrency === 'VND' ? 'vi-VN' : (newCurrency === 'JPY' ? 'ja-JP' : 'en-US');
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: newCurrency });
    const symbol = currencySymbols[newCurrency] || '$';
    document.querySelectorAll('.currency-symbol').forEach(el => { el.textContent = symbol; });
    document.querySelectorAll('.amount-input').forEach(input => {
      input.placeholder = (newCurrency === 'VND' || newCurrency === 'JPY') ? '0' : '0.00';
    });
    compute();
  }

  if (currencyEl) {
    updateCurrency(currencyEl.value || 'USD');
    currencyEl.addEventListener('change', (e) => updateCurrency(e.target.value));
  }

  // Toggle tax/tip visibility and recompute
  if (toggleTaxEl && taxWrapEl) {
    toggleTaxEl.addEventListener('change', () => {
      taxWrapEl.classList.toggle('hidden', !toggleTaxEl.checked);
      compute();
    });
  }
  // Tax interactions
  if (taxEl) {
    taxEl.addEventListener('input', () => {
      // Clear preset highlights when typing custom
      taxPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      compute();
    });
  }
  if (taxAmountEl) {
    taxAmountEl.addEventListener('input', () => {
      // Invalidate percent UI when amount is typed
      if (taxEl) taxEl.value = '';
      taxPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      compute();
    });
  }
  taxPresetBtns.forEach(btn => btn.addEventListener('click', () => {
    const val = Number(btn.dataset.tax);
    if (!Number.isNaN(val) && taxEl) {
      taxEl.value = String(val);
      // Highlight the selected button
      taxPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      btn.classList.add('bg-brand-600', 'text-white', 'border-brand-600');
      compute();
    }
  }));
  if (toggleTipEl && tipWrapEl) {
    toggleTipEl.addEventListener('change', () => {
      tipWrapEl.classList.toggle('hidden', !toggleTipEl.checked);
      compute();
    });
  }
  // Tip interactions
  const tipPresetBtns = document.querySelectorAll('.tip-btn');
  tipPresetBtns.forEach(btn => btn.addEventListener('click', () => {
    const val = Number(btn.dataset.tip);
    if (!Number.isNaN(val) && tipEl) {
      tipEl.value = String(val);
      // Highlight the selected button
      tipPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      btn.classList.add('bg-brand-600', 'text-white', 'border-brand-600');
      compute();
    }
  }));
  if (tipEl) {
    tipEl.addEventListener('input', () => {
      // Clear preset highlights when typing custom
      tipPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      compute();
    });
  }
  if (tipAmountEl) {
    tipAmountEl.addEventListener('input', () => {
      // Invalidate percent UI when amount is typed
      if (tipEl) tipEl.value = '';
      tipPresetBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white', 'border-brand-600'));
      compute();
    });
  }

  // Auto-update amount fields when percent changes
  function updateAmountFields() {
    const decimals = getCurrencyDecimals();
    if (toggleTaxEl && toggleTaxEl.checked && taxAmountEl) {
      const taxPercentStr = taxEl ? String(taxEl.value || '').trim() : '';
      if (taxPercentStr !== '') {
        const taxPct = clamp(toNumber(taxPercentStr), 0, 100);
        const subtotal = Math.max(0, toNumber(subtotalEl.value));
        const taxAmount = subtotal * (taxPct / 100);
        taxAmountEl.value = taxAmount.toFixed(decimals);
      }
    }
    if (toggleTipEl && toggleTipEl.checked && tipAmountEl) {
      const tipPercentStr = tipEl ? String(tipEl.value || '').trim() : '';
      if (tipPercentStr !== '') {
        const tipPct = Math.max(0, toNumber(tipPercentStr || 5));
        const subtotal = Math.max(0, toNumber(subtotalEl.value));
        const taxPct = (toggleTaxEl && toggleTaxEl.checked) ? clamp(toNumber(taxEl.value), 0, 100) : 0;
        const basePlusTax = subtotal + (subtotal * (taxPct / 100));
        const tipAmount = basePlusTax * (tipPct / 100);
        tipAmountEl.value = tipAmount.toFixed(decimals);
      }
    }
  }

  // Default values for a quick start
  subtotalEl.value = '';
  taxEl && (taxEl.value = '');
  tipEl && (tipEl.value = '5');
  // Default: unchecked to keep UI clean; user can turn on as needed
  if (toggleTaxEl && taxWrapEl) { toggleTaxEl.checked = false; taxWrapEl.classList.add('hidden'); }
  if (toggleTipEl && tipWrapEl) { toggleTipEl.checked = false; tipWrapEl.classList.add('hidden'); }
  
  // Update amount fields on any change
  form.addEventListener('input', updateAmountFields);
  highlightTip(20);
  compute();
})();

// Share Modal functionality
const shareModal = document.getElementById('share-modal');
const closeShareModal = document.getElementById('close-share-modal');
const shareUrlEl = document.getElementById('share-url');
const copyUrlEl = document.getElementById('copy-url');

// Hide share modal
closeShareModal?.addEventListener('click', () => {
  shareModal.classList.add('hidden');
  shareModal.classList.remove('flex');
});

// Hide modal when clicking outside
shareModal?.addEventListener('click', (e) => {
  if (e.target === shareModal) {
    shareModal.classList.add('hidden');
    shareModal.classList.remove('flex');
  }
});

// Copy URL to clipboard
copyUrlEl?.addEventListener('click', () => {
  shareUrlEl.select();
  navigator.clipboard.writeText(shareUrlEl.value).then(() => {
    copyUrlEl.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `;
    setTimeout(() => {
      copyUrlEl.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      `;
    }, 2000);
  });
});

// Social media share buttons
document.getElementById('share-facebook')?.addEventListener('click', () => {
  const url = encodeURIComponent(shareUrlEl.value);
  const text = encodeURIComponent('Check out this bill breakdown!');
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
});

document.getElementById('share-twitter')?.addEventListener('click', () => {
  const url = encodeURIComponent(shareUrlEl.value);
  const text = encodeURIComponent('Check out this bill breakdown!');
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
});

document.getElementById('share-messenger')?.addEventListener('click', () => {
  const url = encodeURIComponent(shareUrlEl.value);
  window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID`, '_blank');
});

// Login Modal functionality
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.getElementById('close-modal');
const loginForm = document.getElementById('login-form');

// Show login modal
loginBtn?.addEventListener('click', () => {
  if (loginBtn.textContent === 'Logout') {
    // Handle logout
    loginBtn.textContent = 'Login';
    loginBtn.classList.remove('bg-slate-600', 'hover:bg-slate-700');
    loginBtn.classList.add('bg-brand-600', 'hover:bg-brand-700');
    console.log('Logged out');
    return;
  }
  
  // Show login modal
  loginModal.classList.remove('hidden');
  loginModal.classList.add('flex');
});

// Hide login modal
closeModal?.addEventListener('click', () => {
  loginModal.classList.add('hidden');
  loginModal.classList.remove('flex');
});

// Hide modal when clicking outside
loginModal?.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
  }
});

// Handle login form submission
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Simple validation (in real app, this would connect to backend)
  if (email && password) {
    // Simulate login success
    loginBtn.textContent = 'Logout';
    loginBtn.classList.remove('bg-brand-600', 'hover:bg-brand-700');
    loginBtn.classList.add('bg-slate-600', 'hover:bg-slate-700');
    
    // Hide modal
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
    
    // Clear form
    loginForm.reset();
    
    console.log('Login successful:', { email, password });
  }
});


