import { TEAS } from './teas.js';
import { initLogTab } from './log.js';

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach((p) => {
      p.hidden = p.id !== `tab-${target}`;
    });
    if (target === 'log') initLogTab();
  });
});

// ── Tea recommendation ────────────────────────────────────────────────────────
const moodInput    = document.getElementById('moodInput');
const charCount    = document.getElementById('charCount');
const brewBtn      = document.getElementById('brewBtn');
const inputSection = document.getElementById('inputSection');
const resultSection = document.getElementById('resultSection');
const resultSubtitle = document.getElementById('resultSubtitle');
const teaCards     = document.getElementById('teaCards');
const backBtn      = document.getElementById('backBtn');

moodInput.addEventListener('input', () => {
  charCount.textContent = moodInput.value.length;
});

moodInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) brewTea();
});

brewBtn.addEventListener('click', brewTea);
backBtn.addEventListener('click', reset);

function reset() {
  resultSection.hidden = true;
  inputSection.hidden = false;
  teaCards.innerHTML = '';
  moodInput.focus();
}

function brewTea() {
  const mood = moodInput.value.trim();
  if (!mood) { moodInput.focus(); return; }

  const results = recommend(mood);

  inputSection.hidden = true;
  resultSection.hidden = false;
  resultSubtitle.textContent = `「${mood.slice(0, 30)}${mood.length > 30 ? '…' : ''}」`;

  teaCards.innerHTML = '';
  results.forEach((tea, i) => {
    const el = buildCard(tea);
    el.style.animationDelay = `${i * 0.1}s`;
    teaCards.appendChild(el);
  });
}

// ── Matching logic ─────────────────────────────────────────────────────────────
function recommend(mood) {
  const scored = TEAS.map((tea) => ({
    tea,
    score: score(mood, tea),
  })).sort((a, b) => b.score - a.score);

  // top 3，但分數至少要 > 0；若全部都沒中，仍回前 3 個（以預設排序）
  const top = scored.filter((s) => s.score > 0).slice(0, 3);
  return (top.length >= 2 ? top : scored.slice(0, 3)).map((s) => s.tea);
}

function score(mood, tea) {
  let total = 0;
  for (const keyword of tea.keywords) {
    if (mood.includes(keyword)) total += 2;
  }
  // 部分字符比對（單字）
  for (const keyword of tea.keywords) {
    for (const char of keyword) {
      if (char.length === 1 && mood.includes(char)) total += 0.5;
    }
  }
  return total;
}

// ── Card rendering ─────────────────────────────────────────────────────────────
function buildCard(tea) {
  const article = document.createElement('article');
  article.className = 'tea-card';
  article.innerHTML = `
    <div class="tea-card-header">
      <div class="tea-name-block">
        <div class="tea-name-zh">${esc(tea.name_zh)}</div>
        <div class="tea-name-en">${esc(tea.name_en)}</div>
      </div>
      <span class="tea-tagline">${esc(tea.tagline)}</span>
    </div>
    <div class="tea-origin">
      <span class="origin-dot"></span>${esc(tea.origin)}
    </div>

    <div class="tea-divider"></div>

    <div class="tea-section-label">為什麼適合此刻</div>
    <p class="tea-why">${esc(tea.why)}</p>

    <div class="tea-divider"></div>

    <div class="tea-section-label">關於這款茶</div>
    <p class="tea-story">${esc(tea.story)}</p>

    <div class="tea-brew">
      <span class="brew-icon">🫖</span>
      <span>${esc(tea.brew_note)}</span>
    </div>
  `;
  return article;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
