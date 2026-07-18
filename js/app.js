const CATEGORY_META = {
  mountain: { label: '山脈', icon: '⛰️', color: '#8b5e3c' },
  river: { label: '河流', icon: '〰️', color: '#2b7bbb' },
  lake: { label: '湖泊', icon: '💧', color: '#39a0ca' },
  landform: { label: '特殊地形', icon: '🪨', color: '#d78235' },
  park: { label: '國家公園', icon: '🌲', color: '#2b7a4b' }
};

const missions = [
  '同時觀察洛磯山脈與密西西比河，找出北美洲大陸分水嶺。',
  '找出大峽谷，觀察科羅拉多河切割高原的位置。',
  '比較大峽谷與優勝美地：兩者主要由哪種外營力塑造？',
  '選取國家公園類別，找出具有冰河地形的公園。',
  '找出馬更些河，思考高緯度河流的結冰期有何特色。'
];

const map = L.map('map', { minZoom: 2, maxZoom: 12, zoomControl: true }).setView([48, -105], 3);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
}).addTo(map);

const groups = Object.fromEntries(Object.keys(CATEGORY_META).map(key => [key, L.layerGroup().addTo(map)]));
const selectedCategories = new Set(Object.keys(CATEGORY_META));
const markersById = new Map();
let places = [];
let quizzes = [];
let currentQuiz = null;
let missionIndex = 0;

function markerIcon(category) {
  const meta = CATEGORY_META[category];
  return L.divIcon({ className: '', html: `<div class="custom-marker" style="background:${meta.color}"><span>${meta.icon}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30] });
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`無法載入 ${path}`);
  return response.json();
}

function buildInfo(place) {
  const meta = CATEGORY_META[place.category];
  document.getElementById('infoPanel').innerHTML = `
    <p class="eyebrow">${meta.icon} ${meta.label}</p><h2 class="place-title">${place.nameZh}</h2><p class="place-en">${place.nameEn}</p>
    <div class="tag-row"><span class="tag">${place.country}</span><span class="tag">${place.region}</span></div>
    <div class="info-section"><h2>地形簡介</h2><p>${place.summary}</p></div>
    <div class="info-section"><h2>形成原因</h2><p>${place.formation}</p></div>
    <div class="info-section"><h2>觀察重點</h2><ul>${place.features.map(feature => `<li>${feature}</li>`).join('')}</ul></div>
    <div class="lesson-box"><h2>思考問題</h2><p>${place.question}</p></div>
    <div class="info-section action-links"><a href="${place.maps}" target="_blank" rel="noopener">在 Google 地圖開啟</a><a href="${place.video}" target="_blank" rel="noopener">公開影片搜尋</a></div>
    <div class="info-section"><h2>出處與延伸閱讀</h2><div class="source-card"><strong>官方／主要來源</strong><br><a href="${place.official}" target="_blank" rel="noopener">開啟來源網站</a></div><div class="source-card">${place.sourceNote}</div></div>`;
}

function selectPlace(place) {
  map.flyTo([place.lat, place.lng], 6, { duration: 1.1 });
  markersById.get(place.id)?.openTooltip();
  buildInfo(place);
}

function addPlaces() {
  places.forEach(place => {
    const marker = L.marker([place.lat, place.lng], { icon: markerIcon(place.category), title: place.nameZh });
    marker.bindTooltip(place.nameZh, { permanent: true, direction: 'top', offset: [0, -27], className: 'map-label' });
    marker.on('click', () => buildInfo(place));
    marker.addTo(groups[place.category]);
    markersById.set(place.id, marker);
  });
}

async function addGeoJsonLayer(path, style) {
  const data = await loadJson(path);
  return L.geoJSON(data, {
    style,
    onEachFeature(feature, layer) {
      const name = feature.properties.name;
      layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'map-label map-label-line' });
      layer.bindPopup(`<strong>${name}</strong><br><small>${feature.properties.source}</small>`);
    }
  }).addTo(map);
}

function renderFilters() {
  const container = document.getElementById('categoryFilters');
  Object.entries(CATEGORY_META).forEach(([key, meta]) => {
    const button = document.createElement('button');
    button.className = 'filter-btn active';
    button.type = 'button';
    button.innerHTML = `${meta.icon} ${meta.label}`;
    button.addEventListener('click', () => {
      const active = selectedCategories.has(key);
      if (active) { selectedCategories.delete(key); map.removeLayer(groups[key]); } else { selectedCategories.add(key); groups[key].addTo(map); }
      button.classList.toggle('active', !active);
      renderPlaceList();
      performSearch();
    });
    container.appendChild(button);
  });
}

function renderPlaceList() {
  const list = document.getElementById('placeList');
  list.innerHTML = '';
  places.filter(place => selectedCategories.has(place.category)).forEach(place => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>${CATEGORY_META[place.category].icon}</span><span>${place.nameZh}<small>${place.nameEn}</small></span>`;
    button.addEventListener('click', () => selectPlace(place));
    list.appendChild(button);
  });
}

function renderLegend() {
  document.getElementById('legend').innerHTML = Object.values(CATEGORY_META).map(meta => `<div class="legend-item"><span class="legend-dot" style="background:${meta.color}"></span>${meta.icon} ${meta.label}</div>`).join('');
}

function performSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const results = query ? places.filter(place => selectedCategories.has(place.category) && `${place.nameZh} ${place.nameEn} ${place.region}`.toLowerCase().includes(query)).slice(0, 8) : [];
  const box = document.getElementById('searchResults');
  box.innerHTML = results.length ? '' : (query ? '<p class="hint">找不到符合的景點，請調整關鍵字或主題篩選。</p>' : '');
  results.forEach(place => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${CATEGORY_META[place.category].icon} ${place.nameZh}｜${place.nameEn}`;
    button.addEventListener('click', () => selectPlace(place));
    box.appendChild(button);
  });
}

function showQuiz() {
  currentQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  document.getElementById('quizQuestion').textContent = currentQuiz.question;
  document.getElementById('quizFeedback').textContent = '';
  const box = document.getElementById('quizOptions');
  box.innerHTML = '';
  currentQuiz.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => {
      [...box.children].forEach((item, optionIndex) => { item.disabled = true; if (optionIndex === currentQuiz.answer) item.classList.add('correct'); });
      if (index !== currentQuiz.answer) button.classList.add('wrong');
      document.getElementById('quizFeedback').textContent = `${index === currentQuiz.answer ? '答對了！' : '再觀察一次地圖。'} ${currentQuiz.explanation}`;
    });
    box.appendChild(button);
  });
}

async function init() {
  try {
    [places, quizzes] = await Promise.all([loadJson('data/places.json'), loadJson('data/quizzes.json')]);
    addPlaces(); renderFilters(); renderPlaceList(); renderLegend();
    await Promise.all([
      addGeoJsonLayer('geojson/mountains.geojson', { color: '#b78653', weight: 4, opacity: 0.9 }),
      addGeoJsonLayer('geojson/rivers.geojson', { color: '#42b8ee', weight: 4, opacity: 0.9 }),
      addGeoJsonLayer('geojson/lakes.geojson', { color: '#75d1f2', weight: 2, fillColor: '#75d1f2', fillOpacity: 0.3 })
    ]);
  } catch (error) {
    document.getElementById('infoPanel').innerHTML = `<div class="empty-state"><h2>資料載入失敗</h2><p>${error.message}</p><p>請使用 GitHub Pages 開啟網站。</p></div>`;
    console.error(error);
  }
}

document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keydown', event => { if (event.key === 'Enter') performSearch(); });
document.getElementById('nextMissionBtn').addEventListener('click', () => { missionIndex = (missionIndex + 1) % missions.length; document.getElementById('missionText').textContent = missions[missionIndex]; });
document.getElementById('tourBtn').addEventListener('click', () => {
  const route = ['rockies', 'mississippi', 'great-lakes', 'grand-canyon', 'yellowstone', 'banff-np'];
  let index = 0;
  const visit = () => { const place = places.find(item => item.id === route[index]); selectPlace(place); index = (index + 1) % route.length; };
  visit();
  const timer = setInterval(visit, 4200);
  setTimeout(() => clearInterval(timer), 25000);
});
const dialog = document.getElementById('quizDialog');
document.getElementById('quizBtn').addEventListener('click', () => { showQuiz(); dialog.showModal(); });
document.getElementById('nextQuizBtn').addEventListener('click', showQuiz);

init();
