# 地形探險隊-美洲

一個可部署在 GitHub Pages 的美洲互動式地理教材。學生可在衛星底圖上探索北美洲、中美洲、加勒比海與南美洲，切換山脈、河流、湖泊、特殊地形、國家公園、特有動物及特色植物圖層；點擊圖標後可閱讀地理或生態介紹，並查看 CC 授權照片與公開來源。

## 目前功能

- Leaflet 互動地圖，可縮放、拖曳與點擊。
- 無道路與國界的 Esri World Imagery 衛星底圖。
- 可獨立切換山脈、河流、湖泊、特殊地形、國家公園、特有動物與特色植物圖層。
- GeoJSON 山脈、河流與湖區概略圖層。
- 27 個美洲代表地形與國家公園，以及 14 種代表性動植物。
- 景點搜尋、導覽模式、觀察任務與隨機測驗。
- 每個項目附 Wikimedia Commons CC 授權照片、作者與授權連結。
- 物種資訊包含學名、棲地、生態特徵與保育現況。
- 每個項目附官方／主要來源、Google Maps 探索及 YouTube 公開影片搜尋連結。
- 響應式版面，可用於桌面、平板與手機。

## 本機執行

因網站使用 `fetch()` 載入 JSON 與 GeoJSON，請以本機 HTTP 伺服器開啟：

```bash
python3 -m http.server 8000
```

再開啟 `http://localhost:8000`。

## 部署至 GitHub Pages

1. 在 GitHub 建立新 repository，例如 `terrain-explorer-americas`。
2. 將本專案所有檔案推送至 `main` 分支。
3. 進入 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選擇 `main`、資料夾選擇 `/ (root)`，按下 Save。
6. 稍後即可由 GitHub Pages 網址開啟。

## 資料與授權

- 地圖程式：Leaflet，BSD-2-Clause。
- Esri World Imagery：依地圖上顯示之 attribution 與 Esri 使用條款使用。
- Natural Earth：公開領域。專案內 GeoJSON 為依公開資料與官方地理資料整理後的教學概略化示意，並非測量級資料。
- 照片：來自 Wikimedia Commons，頁面逐張顯示作者、Creative Commons 授權及原始檔連結。
- 國家公園與物種資料：優先連結各國公園主管機關、IUCN、NPS、USFWS、Kew 等來源。
- YouTube：本專案只提供搜尋或外連，不下載或重新散布影片。

完整規格與來源政策請參閱：

- [教材與系統規格書](docs/specification.md)
- [資料來源與授權政策](docs/source-policy.md)
- [教師使用指南](docs/teacher-guide.md)

## 擴充資料

地形與公園編輯 `data/places.json`；動植物編輯 `data/species.json`。新增項目後可執行 `scripts/fetch_commons_photos.py <id>` 搜尋 CC 授權照片。

- `nameZh`、`nameEn`
- `category`
- `lat`、`lng`
- `summary`、`formation`、`features`
- 物種使用 `scientificName`、`habitat`、`conservation`
- `maps`、`video`、`official`
- `sourceNote`

## 注意事項

本專案的山脈、河流及湖區 GeoJSON 與物種圖標位置是為課堂辨識而簡化的概略資料。不可用於導航、工程、土地界線、物種調查、災害判定或科學研究。
