const CATEGORY_META = {
  mountain: { label: '山脈', icon: '⛰️', color: '#8b5e3c' },
  river: { label: '河流', icon: '〰️', color: '#2b7bbb' },
  lake: { label: '湖泊', icon: '💧', color: '#39a0ca' },
  landform: { label: '特殊地形', icon: '🪨', color: '#d78235' },
  park: { label: '國家公園', icon: '🌲', color: '#2b7a4b' }
};

const missions = [
  '搜尋「洛磯山脈」與「密西西比河」，觀察北美洲大陸分水嶺的位置。',
  '搜尋「大峽谷」，觀察科羅拉多河切割高原的位置。',
  '比較大峽谷與優勝美地：兩者主要由哪種外營力塑造？',
  '選取國家公園類別，再搜尋班夫或優勝美地，觀察冰河地形。',
  '搜尋馬更些河，思考高緯度河流的結冰期有何特色。'
];

const mapFrame = document.getElementById('map');
const selectedCategories = new Set(Object.keys(CATEGORY_META));
let places = [];
let quizzes = [];
let currentQuiz = null;
let missionIndex = 0;

function showGoogleMap({ lat = 48, lng = -105, zoom = 3 } = {}) {
  const params = new URLSearchParams({
    hl: 'zh-TW',
    ll: `${lat},${lng}`,
    z: String(zoom),
    output: 'embed'
  });
  mapFrame.src = `https://www.google.com/maps?${params}`;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`無法載入 ${path}`);
  return response.json();
}

function buildInfo(place) {
  const meta = CATEGORY_META[place.category];
  document.getElementById('infoPanel').innerHTML = `
    <p class="eyebrow">${meta.icon} ${meta.label}</p>
    <h2 class="place-title">${place.nameZh}</h2>
    <p class="place-en">${place.nameEn}</p>
    <div class="tag-row"><span class="tag">${place.country}</span><span class="tag">${place.region}</span></div>
    <div class="info-section"><h2>地形簡介</h2><p>${place.summary}</p></div>
    <div class="info-section"><h2>形成原因</h2><p>${place.formation}</p></div>
    <div class="info-section"><h2>觀察重點</h2><ul>${place.features.map(f => `<li>${f}</li>`).join('')}</ul></div>
    <div class="lesson-box"><h2>思考問題</h2><p>${place.question}</p></div>
    <div class="info-section action-links">
      <a href="${place.maps}" target="_blank" rel="noopener">在 Google 地圖開啟</a>
      <a href="${place.video}" target="_blank" rel="noopener">公開影片搜尋</a>
    </div>
    <div class="info-section"><h2>出處與延伸閱讀</h2>
      <div class="source-card"><strong>官方／主要來源</strong><br><a href="${place.official}" target="_blank" rel="noopener">開啟來源網站</a></div>
      <div class="source-card">${place.sourceNote}</div>
    </div>`;
}

function selectPlace(place) {
  showGoogleMap({ lat: place.lat, lng: place.lng, zoom: 6 });
  buildInfo(place);
}

function renderFilters() {
  const container = document.getElementById('categoryFilters');
  Object.entries(CATEGORY_META).forEach(([key, meta]) => {
    const button = document.createElement('button');
    button.className = 'filter-btn active';
    button.type = 'button';
    button.innerHTML = `${meta.icon} ${meta.label}`;
    button.addEventListener('click', () => {
      if (selectedCategories.has(key)) selectedCategories.delete(key);
      else selectedCategories.add(key);
      button.classList.toggle('active', selectedCategories.has(key));
      performSearch();
    });
    container.appendChild(button);
  });
}

function renderLegend() {
  document.getElementById('legend').innerHTML = Object.values(CATEGORY_META).map(meta =>
    `<div class="legend-item"><span class="legend-dot" style="background:${meta.color}"></span>${meta.icon} ${meta.label}</div>`
  ).join('');
}

function performSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = places.filter(p => selectedCategories.has(p.category));
  const results = q
    ? filtered.filter(p => `${p.nameZh} ${p.nameEn} ${p.region}`.toLowerCase().includes(q)).slice(0, 8)
    : [];
  const box = document.getElementById('searchResults');
  box.innerHTML = results.length ? '' : (q ? '<p class="hint">找不到符合的景點，請調整關鍵字或主題篩選。</p>' : '');
  results.forEach(place => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `${CATEGORY_META[place.category].icon} ${place.nameZh}｜${place.nameEn}`;
    btn.addEventListener('click', () => selectPlace(place));
    box.appendChild(btn);
  });
}

function showQuiz() {
  currentQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  document.getElementById('quizQuestion').textContent = currentQuiz.question;
  document.getElementById('quizFeedback').textContent = '';
  const box = document.getElementById('quizOptions');
  box.innerHTML = '';
  currentQuiz.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = option;
    btn.addEventListener('click', () => {
      [...box.children].forEach((button, optionIndex) => {
        button.disabled = true;
        if (optionIndex === currentQuiz.answer) button.classList.add('correct');
      });
      if (index !== currentQuiz.answer) btn.classList.add('wrong');
      document.getElementById('quizFeedback').textContent = `${index === currentQuiz.answer ? '答對了！' : '再觀察一次地圖。'} ${currentQuiz.explanation}`;
    });
    box.appendChild(btn);
  });
}

async function init() {
  try {
    [places, quizzes] = await Promise.all([loadJson('data/places.json'), loadJson('data/quizzes.json')]);
    renderFilters();
    renderLegend();
    showGoogleMap();
  } catch (error) {
    document.getElementById('infoPanel').innerHTML = `<div class="empty-state"><h2>資料載入失敗</h2><p>${error.message}</p><p>請使用 GitHub Pages 開啟網站。</p></div>`;
    console.error(error);
  }
}

document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keydown', event => {
  if (event.key === 'Enter') performSearch();
});
document.getElementById('nextMissionBtn').addEventListener('click', () => {
  missionIndex = (missionIndex + 1) % missions.length;
  document.getElementById('missionText').textContent = missions[missionIndex];
});
document.getElementById('tourBtn').addEventListener('click', () => {
  const route = ['rockies', 'mississippi', 'great-lakes', 'grand-canyon', 'yellowstone', 'banff-np'];
  let index = 0;
  const visit = () => {
    const place = places.find(item => item.id === route[index]);
    selectPlace(place);
    index = (index + 1) % route.length;
  };
  visit();
  const timer = setInterval(visit, 4200);
  setTimeout(() => clearInterval(timer), 25000);
});
const dialog = document.getElementById('quizDialog');
document.getElementById('quizBtn').addEventListener('click', () => { showQuiz(); dialog.showModal(); });
document.getElementById('nextQuizBtn').addEventListener('click', showQuiz);

init();
