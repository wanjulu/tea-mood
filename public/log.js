import { TEAS } from './teas.js';

// ── Elements ──────────────────────────────────────────────────────────────────
const logTea      = document.getElementById('logTea');
const logMood     = document.getElementById('logMood');
const logNotes    = document.getElementById('logNotes');
const starRating  = document.getElementById('starRating');
const saveBtn     = document.getElementById('saveBtn');
const saveMsg     = document.getElementById('saveMsg');
const weatherText = document.getElementById('weatherText');
const weatherBadge = document.getElementById('weatherBadge');
const recordsList = document.getElementById('recordsList');
const recordsCount = document.getElementById('recordsCount');
const teaListEl   = document.getElementById('teaList');

// ── Tea datalist ──────────────────────────────────────────────────────────────
TEAS.forEach(({ name_zh }) => {
  const opt = document.createElement('option');
  opt.value = name_zh;
  teaListEl.appendChild(opt);
});

// ── Star rating ───────────────────────────────────────────────────────────────
let selectedRating = 0;

starRating.addEventListener('click', (e) => {
  const star = e.target.closest('.star');
  if (!star) return;
  selectedRating = Number(star.dataset.value);
  updateStars(selectedRating);
});

starRating.addEventListener('mouseover', (e) => {
  const star = e.target.closest('.star');
  if (star) updateStars(Number(star.dataset.value));
});

starRating.addEventListener('mouseleave', () => {
  updateStars(selectedRating);
});

function updateStars(value) {
  starRating.querySelectorAll('.star').forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.value) <= value);
  });
}

// ── Weather ───────────────────────────────────────────────────────────────────
let currentWeather = null;

const WEATHER_ICONS = {
  '晴天': '☀️', '晴時多雲': '⛅', '多雲': '🌤', '陰天': '☁️',
  '霧': '🌫', '毛毛雨': '🌦', '小雨': '🌧', '中雨': '🌧',
  '大雨': '⛈', '陣雨': '🌦', '大陣雨': '⛈', '雷雨': '⛈',
  '小雪': '🌨', '中雪': '❄️', '大雪': '❄️',
};

async function loadWeather() {
  try {
    const res = await fetch('/api/weather');
    currentWeather = await res.json();
    const icon = WEATHER_ICONS[currentWeather.weather] ?? '🌡';
    weatherText.textContent = `${icon} ${currentWeather.weather}　${currentWeather.temperature}°C`;
    weatherBadge.classList.add('loaded');
  } catch {
    weatherText.textContent = '天氣取得失敗';
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  const tea_name = logTea.value.trim();
  const mood = logMood.value.trim();

  if (!tea_name) { shake(logTea); return; }
  if (!mood)     { shake(logMood); return; }
  if (!selectedRating) { shake(starRating); return; }

  saveBtn.disabled = true;

  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tea_name, mood, rating: selectedRating, notes: logNotes.value }),
    });

    if (!res.ok) throw new Error();
    const log = await res.json();

    showMsg('已記錄 ✓', 'success');
    resetForm();
    prependRecord(log);
    updateCount(1);
  } catch {
    showMsg('儲存失敗，請再試', 'error');
  } finally {
    saveBtn.disabled = false;
  }
});

function resetForm() {
  logTea.value = '';
  logMood.value = '';
  logNotes.value = '';
  selectedRating = 0;
  updateStars(0);
}

function showMsg(text, type) {
  saveMsg.textContent = text;
  saveMsg.className = `save-msg ${type}`;
  setTimeout(() => { saveMsg.textContent = ''; saveMsg.className = 'save-msg'; }, 2500);
}

function shake(el) {
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ── Records ───────────────────────────────────────────────────────────────────
async function loadRecords() {
  try {
    const res = await fetch('/api/logs');
    const logs = await res.json();
    renderRecords(logs);
  } catch {
    recordsList.innerHTML = '<div class="records-empty">載入失敗</div>';
  }
}

function renderRecords(logs) {
  if (!logs.length) {
    recordsList.innerHTML = '<div class="records-empty">還沒有記錄，去泡第一杯吧</div>';
    recordsCount.textContent = '';
    return;
  }
  recordsCount.textContent = `${logs.length} 筆`;
  recordsList.innerHTML = '';
  logs.forEach((log) => recordsList.appendChild(buildRecord(log)));
}

function prependRecord(log) {
  const empty = recordsList.querySelector('.records-empty');
  if (empty) empty.remove();
  recordsList.insertAdjacentElement('afterbegin', buildRecord(log));
}

function updateCount(delta) {
  const n = parseInt(recordsCount.textContent) || 0;
  const next = n + delta;
  recordsCount.textContent = next ? `${next} 筆` : '';
}

function buildRecord(log) {
  const div = document.createElement('div');
  div.className = 'record-card';
  div.dataset.id = log.id;

  const date = new Date(log.created_at + (log.created_at.endsWith('Z') ? '' : 'Z'));
  const dateStr = date.toLocaleDateString('zh-Hant', { month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('zh-Hant', { hour: '2-digit', minute: '2-digit' });

  const stars = '★'.repeat(log.rating) + '☆'.repeat(5 - log.rating);
  const weatherIcon = WEATHER_ICONS[log.weather] ?? '';
  const weatherStr = log.weather
    ? `${weatherIcon} ${log.weather}　${log.temperature != null ? log.temperature + '°C' : ''}`
    : '';

  div.innerHTML = `
    <div class="record-top">
      <div class="record-meta">
        <span class="record-tea">${esc(log.tea_name)}</span>
        <span class="record-stars">${stars}</span>
      </div>
      <div class="record-date">${dateStr} ${timeStr}</div>
    </div>
    <div class="record-mood">${esc(log.mood)}</div>
    ${weatherStr ? `<div class="record-weather">${weatherStr}</div>` : ''}
    ${log.notes ? `<div class="record-notes">${esc(log.notes)}</div>` : ''}
    <button class="record-delete" title="刪除">✕</button>
  `;

  div.querySelector('.record-delete').addEventListener('click', () => deleteRecord(log.id, div));
  return div;
}

async function deleteRecord(id, el) {
  await fetch(`/api/logs/${id}`, { method: 'DELETE' });
  el.style.opacity = '0';
  el.style.transform = 'translateX(12px)';
  el.style.transition = 'opacity 0.2s, transform 0.2s';
  setTimeout(() => {
    el.remove();
    updateCount(-1);
    if (!recordsList.children.length) {
      recordsList.innerHTML = '<div class="records-empty">還沒有記錄，去泡第一杯吧</div>';
    }
  }, 200);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init when log tab becomes active ─────────────────────────────────────────
let initialized = false;

export function initLogTab() {
  if (initialized) return;
  initialized = true;
  loadWeather();
  loadRecords();
}
