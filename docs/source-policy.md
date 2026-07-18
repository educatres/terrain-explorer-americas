# 資料來源與授權政策

## 1. 原則

1. 優先採用政府、國家公園、科學機構與公開領域資料。
2. 所有外部內容保留來源連結，不將 YouTube 影片或受限制圖片下載後重新散布。
3. 地圖 attribution 必須保持清楚可見，不可被介面遮蔽。
4. 每筆教材資料應記錄來源、授權類型與最後查核日期。

## 2. 地圖來源

### Leaflet

- 官網：https://leafletjs.com/
- 授權：BSD-2-Clause
- 用途：互動地圖、圖層控制、GeoJSON 顯示與事件處理。

### OpenStreetMap

- 官網：https://www.openstreetmap.org/
- 版權與授權：https://www.openstreetmap.org/copyright
- 圖磚政策：https://operations.osmfoundation.org/policies/tiles/
- 注意：必須在地圖上顯示 `© OpenStreetMap contributors`，且不得大量預抓或離線鏡像官方圖磚。

### OpenTopoMap

- 官網：https://opentopomap.org/
- 授權標示：OpenStreetMap contributors、SRTM、OpenTopoMap CC BY-SA。
- 注意：公共伺服器適合合理流量的展示；大型正式服務應評估自建或商用圖磚。

### Esri World Imagery

- 服務：https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer
- 注意：需保留 Esri 及影像供應者 attribution，並遵守 Esri 現行使用條款。

### Natural Earth

- 官網：https://www.naturalearthdata.com/
- 授權：Public Domain
- 用途：河川、湖泊、海岸線、國界與地形資料的公開來源。

## 3. 國家公園與地質來源

- U.S. National Park Service：https://www.nps.gov/
- NPS Developer Resources：https://www.nps.gov/subjects/developer/
- Parks Canada：https://parks.canada.ca/
- USGS：https://www.usgs.gov/
- NOAA Education：https://www.noaa.gov/education
- Natural Resources Canada：https://natural-resources.canada.ca/
- Mexico INEGI：https://www.inegi.org.mx/

官方網站中的個別圖片可能仍屬第三方所有，不可僅因網站屬政府機關就假設所有圖片皆為公有領域。

## 4. YouTube 與實景

- 僅使用 YouTube 公開頁面、官方嵌入或搜尋連結。
- 不下載影片、不去除頻道標示、不規避廣告或播放限制。
- 每筆資料記錄影片標題、頻道、網址及查核日期後，才適合改成固定影片連結。
- Google Maps 目前以外部搜尋連結開啟，不需要 API Key；若改用 Maps Embed API，需另行設定 Google Cloud 專案並遵守條款。

## 5. 專案內概略 GeoJSON

目前 `geojson/` 內的線與面是以 Natural Earth、官方地理資料及常見地理位置為參考，人工簡化成適合課堂辨識的示意圖。其用途是呈現相對位置和方向，不代表正式邊界或精確水系。
