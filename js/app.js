const CATEGORY_META = {
  mountain: { label: '山脈', icon: '⛰️', color: '#8b5e3c' },
  river: { label: '河流', icon: '〰️', color: '#2b7bbb' },
  lake: { label: '湖泊', icon: '💧', color: '#39a0ca' },
  landform: { label: '特殊地形', icon: '🪨', color: '#d78235' },
  park: { label: '國家公園', icon: '🌲', color: '#2b7a4b' }
};

const missions = [
  '同時開啟「山脈」與「河流」圖層，觀察河流源頭與山地的關係。',
  '切換到地形底圖，找出北美西部高山密集的區域。',
  '比較大峽谷與優勝美地：兩者主要由哪種外營力塑造？',
  '開啟國家公園圖層，找出同時具有冰河地形的公園。',
  '找出一條注入北冰洋的河流，思考它的結冰期有何特色。'
];

const map = L.map('map', { minZoom: 2, maxZoom: 12, zoomControl: true }).setView([48, -105], 3);

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
});

const baseLayers = {
  'OpenStreetMap 一般地圖': osmLayer,
  'OpenTopoMap 地形圖': topoLayer,
  'Esri 衛星影像': satelliteLayer
};

osmLayer.addTo(map);
let showedMapFallback = false;

function fallbackToOpenStreetMap() {
  if (map.hasLayer(osmLayer)) return;
  Object.values(baseLayers).forEach(layer => {
    if (layer !== osmLayer && map.hasLayer(layer)) map.removeLayer(layer);
  });
  osmLayer.addTo(map);
  if (!showedMapFallback) {
    showedMapFallback = true;
    document.getElementById('infoPanel').insertAdjacentHTML('afterbegin',
      '<div class="map-warning">目前選擇的底圖暫時無法載入，已自動切回 OpenStreetMap。</div>'
    );
  }
}

[topoLayer, satelliteLayer].forEach(layer => {
  layer.on('tileerror', fallbackToOpenStreetMap);
});

const groups = Object.fromEntries(Object.keys(CATEGORY_META).map(k => [k, L.layerGroup().addTo(map)]));
const overlayLayers = {};
const markersById = new Map();
let places = [];
let quizzes = [];
let currentQuiz = null;
let missionIndex = 0;

function markerIcon(category) {
  const meta = CATEGORY_META[category];
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker" style="background:${meta.color}"><span>${meta.icon}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
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
      <a href="${place.maps}" target="_blank" rel="noopener">查看實景地圖</a>
      <a href="${place.video}" target="_blank" rel="noopener">公開影片搜尋</a>
    </div>
    <div class="info-section"><h2>出處與延伸閱讀</h2>
      <div class="source-card"><strong>官方／主要來源</strong><br><a href="${place.official}" target="_blank" rel="noopener">開啟來源網站</a></div>
      <div class="source-card">${place.sourceNote}</div>
    </div>`;
}

function addPlaces() {
  places.forEach(place => {
    const marker = L.marker([place.lat, place.lng], { icon: markerIcon(place.category), title: place.nameZh });
    marker.bindTooltip(place.nameZh, { direction: 'top', offset: [0, -25] });
    marker.on('click', () => buildInfo(place));
    marker.addTo(groups[place.category]);
    markersById.set(place.id, marker);
  });
}

async function addGeoJsonLayer(label, path, style) {
  const data = await loadJson(path);
  const layer = L.geoJSON(data, {
    style,
    onEachFeature(feature, featureLayer) {
      featureLayer.bindPopup(`<strong>${feature.properties.name}</strong><br><small>${feature.properties.source}</small>`);
    }
  }).addTo(map);
  overlayLayers[label] = layer;
}

function renderFilters() {
  const container = document.getElementById('categoryFilters');
  Object.entries(CATEGORY_META).forEach(([key, meta]) => {
    const button = document.createElement('button');
    button.className = 'filter-btn active';
    button.dataset.category = key;
    button.innerHTML = `${meta.icon} ${meta.label}`;
    button.addEventListener('click', () => {
      const active = map.hasLayer(groups[key]);
      if (active) map.removeLayer(groups[key]); else groups[key].addTo(map);
      button.classList.toggle('active', !active);
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
  const results = q ? places.filter(p => `${p.nameZh} ${p.nameEn} ${p.region}`.toLowerCase().includes(q)).slice(0, 8) : [];
  const box = document.getElementById('searchResults');
  box.innerHTML = results.length ? '' : (q ? '<p class="hint">找不到符合的景點。</p>' : '');
  results.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = `${CATEGORY_META[p.category].icon} ${p.nameZh}｜${p.nameEn}`;
    btn.addEventListener('click', () => {
      map.setView([p.lat, p.lng], 6);
      markersById.get(p.id).fire('click');
    });
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
      [...box.children].forEach((b, i) => {
        b.disabled = true;
        if (i === currentQuiz.answer) b.classList.add('correct');
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
    addPlaces();
    renderFilters();
    renderLegend();
    await Promise.all([
      addGeoJsonLayer('山脈範圍（概略）', 'geojson/mountains.geojson', { color:'#8b5e3c', weight:5, opacity:.75 }),
      addGeoJsonLayer('主要河流（概略）', 'geojson/rivers.geojson', { color:'#247cc1', weight:4, opacity:.8 }),
      addGeoJsonLayer('主要湖區（概略）', 'geojson/lakes.geojson', { color:'#2d8eae', weight:2, fillColor:'#5fc0dc', fillOpacity:.32 })
    ]);
    const pointOverlays = Object.fromEntries(Object.entries(CATEGORY_META).map(([key, meta]) => [`${meta.icon} ${meta.label}景點`, groups[key]]));
    L.control.layers(baseLayers, { ...pointOverlays, ...overlayLayers }, { collapsed:false }).addTo(map);
  } catch (error) {
    document.getElementById('infoPanel').innerHTML = `<div class="empty-state"><h2>資料載入失敗</h2><p>${error.message}</p><p>請使用本機伺服器或 GitHub Pages 開啟，不要直接雙擊 index.html。</p></div>`;
    console.error(error);
  }
}

document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });
document.getElementById('nextMissionBtn').addEventListener('click', () => {
  missionIndex = (missionIndex + 1) % missions.length;
  document.getElementById('missionText').textContent = missions[missionIndex];
});
document.getElementById('tourBtn').addEventListener('click', () => {
  const route = ['rockies','mississippi','great-lakes','grand-canyon','yellowstone','banff-np'];
  let i = 0;
  const visit = () => {
    const p = places.find(item => item.id === route[i]);
    map.flyTo([p.lat,p.lng], 5, { duration:1.2 });
    buildInfo(p);
    i = (i + 1) % route.length;
  };
  visit();
  const timer = setInterval(visit, 4200);
  setTimeout(() => clearInterval(timer), 25000);
});
const dialog = document.getElementById('quizDialog');
document.getElementById('quizBtn').addEventListener('click', () => { showQuiz(); dialog.showModal(); });
document.getElementById('nextQuizBtn').addEventListener('click', showQuiz);

init();
