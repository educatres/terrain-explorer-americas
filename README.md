# 北美地形探險隊

一個可部署在 GitHub Pages 的北美洲互動式地形教材。學生可切換一般地圖、地形圖與衛星影像，並開關山脈、主要河流、湖區、特殊地形及國家公園等圖層；點擊景點後可閱讀形成原因、觀察重點、思考問題與外部公開來源。

## 目前功能

- Leaflet 互動地圖，可縮放、拖曳與點擊。
- 三種公開底圖：OpenStreetMap、OpenTopoMap、Esri World Imagery。
- 可獨立切換山脈、河流、湖泊、特殊地形與國家公園圖層。
- GeoJSON 山脈、河流與湖區概略圖層。
- 17 個第一版示範景點與國家公園。
- 景點搜尋、導覽模式、觀察任務與隨機測驗。
- 每個景點附官方／主要來源、Google Maps 實景搜尋及 YouTube 公開影片搜尋連結。
- 響應式版面，可用於桌面、平板與手機。

## 本機執行

因網站使用 `fetch()` 載入 JSON 與 GeoJSON，請以本機 HTTP 伺服器開啟：

```bash
python3 -m http.server 8000
```

再開啟 `http://localhost:8000`。

## 部署至 GitHub Pages

1. 在 GitHub 建立新 repository，例如 `north-america-terrain-explorer`。
2. 將本專案所有檔案推送至 `main` 分支。
3. 進入 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選擇 `main`、資料夾選擇 `/ (root)`，按下 Save。
6. 稍後即可由 GitHub Pages 網址開啟。

## 資料與授權

- 地圖程式：Leaflet，BSD-2-Clause。
- OpenStreetMap 底圖與資料：依 ODbL 與圖磚使用政策顯示 attribution。
- OpenTopoMap：底層資料來自 OpenStreetMap 與 SRTM，地圖樣式依 CC BY-SA。
- Esri World Imagery：依地圖上顯示之 attribution 與 Esri 使用條款使用。
- Natural Earth：公開領域。專案內 GeoJSON 為依公開資料與官方地理資料整理後的教學概略化示意，並非測量級資料。
- 國家公園資料：優先連結 NPS、Parks Canada 等官方頁面。
- YouTube：本專案只提供搜尋或外連，不下載或重新散布影片。

完整規格與來源政策請參閱：

- [教材與系統規格書](docs/specification.md)
- [資料來源與授權政策](docs/source-policy.md)
- [教師使用指南](docs/teacher-guide.md)

## 擴充景點

編輯 `data/places.json`，依既有欄位新增資料即可。主要欄位包括：

- `nameZh`、`nameEn`
- `category`
- `lat`、`lng`
- `summary`、`formation`、`features`
- `maps`、`video`、`official`
- `sourceNote`

## 注意事項

本專案第一版的山脈、河流及湖區 GeoJSON 是為課堂辨識而簡化的概略圖形。不可用於導航、工程、土地界線、災害判定或科學研究。
