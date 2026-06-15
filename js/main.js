// ═══════════════════════════════════════
//   SILENCECUT PRO — Main JS
// ═══════════════════════════════════════

// ── THEME ──
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark');
  body.classList.toggle('dark', !isDark);
  body.classList.toggle('light', isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  document.querySelector('.theme-toggle').textContent = isDark ? '☀️' : '🌙';
}

function applyTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.classList.add(saved);
  document.body.classList.remove(saved === 'dark' ? 'light' : 'dark');
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
}

// ── MOBILE MENU ──
function toggleMobileMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ── TOAST ──
function showToast(msg, type = '', dur = 3500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ── DRAW WAVEFORMS (hero) ──
function drawWaveforms() {
  const before = document.getElementById('waveformBefore');
  const after = document.getElementById('waveformAfter');
  if (!before || !after) return;

  const silentZones = [[10,15],[30,37],[55,60],[72,78]];

  for (let i = 0; i < 80; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = 'border-radius:2px;width:4px;flex-shrink:0;';
    let isSilent = false;
    for (const [a, b] of silentZones) if (i >= a && i <= b) isSilent = true;
    if (isSilent) {
      bar.style.height = '6px';
      bar.style.background = '#dc2626';
      bar.style.opacity = '.4';
    } else {
      bar.style.height = Math.max(8, Math.floor(Math.random() * 48 + 8)) + 'px';
      bar.style.background = '#9490a8';
    }
    before.appendChild(bar);
  }

  for (let i = 0; i < 80; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = 'border-radius:2px;width:4px;flex-shrink:0;';
    const h = Math.max(8, Math.floor(Math.random() * 48 + 8));
    bar.style.height = h + 'px';
    bar.style.background = '#7c3aed';
    after.appendChild(bar);
  }
}

// ── FAQ TOGGLE ──
function toggleFaq(btn) {
  const ans = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  if (!isOpen) { btn.classList.add('open'); ans.classList.add('open'); }
}

// ── SIMPLE AUTH STATE (localStorage sim) ──
function getUser() {
  try { return JSON.parse(localStorage.getItem('sc_user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('sc_user', JSON.stringify(u)); }
function logout() {
  localStorage.removeItem('sc_user');
  window.location.href = 'index.html';
}

// ── RAZORPAY ──
function loadRazorpay(cb) {
  if (window.Razorpay) { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = cb;
  document.head.appendChild(s);
}

// Plan configs
const PLANS = {
  starter: { name: 'Starter', amount: 9900,  desc: 'Starter Plan — ₹99/month' },
  pro:     { name: 'Pro',     amount: 29900, desc: 'Pro Plan — ₹299/month' },
  agency:  { name: 'Agency',  amount: 99900, desc: 'Agency Plan — ₹999/month' },
};

function startCheckout(planKey) {
  const plan = PLANS[planKey];
  if (!plan) return;
  loadRazorpay(() => {
    const options = {
      key: window.RAZORPAY_KEY || 'YOUR_RAZORPAY_KEY_ID',
      amount: plan.amount,
      currency: 'INR',
      name: 'SilenceCut Pro',
      description: plan.desc,
      theme: { color: '#7c3aed' },
      prefill: { email: getUser()?.email || '' },
      handler: function (response) {
        showToast('🎉 Payment successful! Welcome to ' + plan.name, 'success');
        const user = getUser() || {};
        user.plan = planKey;
        setUser(user);
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      }
    };
    options.modal = {
      ondismiss: function() { showToast('Payment cancelled.'); }
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => showToast('Payment failed. Please try again.', 'error'));
    rzp.open();
  });
}

// ── FORMAT TIME ──
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// ── FORMAT SIZE ──
function fmtSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Init on load
document.addEventListener('DOMContentLoaded', applyTheme);
