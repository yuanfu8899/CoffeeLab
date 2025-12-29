# Coffee Lab (咖啡實驗室)

這是一個專為咖啡愛好者打造的精準沖煮工具，協助您管理豆倉、記錄沖煮參數，並提供智能計時器與磨豆機刻度對照功能。專案使用 **Angular 17+ (Signals)** 與 **Tailwind CSS** 開發，並整合 **Google Sheets** 作為免費的雲端資料庫。

## 🚀 立即使用 (Live Demo)

無需安裝，直接打開瀏覽器即可使用！

👉 **[前往 Coffee Lab 網頁版](https://yuanfu8899.github.io/CoffeeLab/)**

> **💡 資料隱私說明**：
> 本應用程式為靜態網頁，**所有資料設定 (包含 API URL) 僅會儲存在您個人的瀏覽器中**。
> 不同使用者可以使用同一個網頁連結，並分別綁定各自的 Google Sheet，**您的資料完全私有，不會與他人混用**。

## ✨ 主要功能

*   **⚙️ 磨豆刻度對照**：支援泰摩、小飛馬、C40 等常見磨豆機的刻度轉換與建議。
*   **⏱️ 智能沖煮計時**：內建多種沖煮手法 (如 4:6 法、聰明濾杯)，提供分段注水提示與計時。
*   **🫘 豆倉管理**：記錄您的咖啡豆庫存、烘焙度、風味描述與購買日期。
*   **📝 沖煮手法編輯**：可自訂您的專屬沖煮流程 (注水/悶蒸/等待時間)。
*   **📜 品飲紀錄**：詳細記錄每次沖煮的參數 (水溫、粉水比、時間) 與風味感官評測 (雷達圖)。
*   **☁️ 雲端同步**：所有資料皆可同步至您的個人 Google Sheet，不怕資料遺失。

---

## ☁️ 雲端後端設定 (Google Sheets)

要啟用雲端同步功能 (紀錄、豆倉、食譜)，您需要部署一個 Google Apps Script。我們已經準備好懶人包了！

👉 **[點擊這裡查看詳細架設教學 (Setup Guide)](Template/SETUP_GUIDE.md)**

**簡易步驟：**
1.  建立一個新的 Google Sheet。
2.  複製 `Template/code.gs` 檔案內的程式碼。
3.  在 Sheet 中開啟 Apps Script 編輯器並貼上代碼。
4.  將其部署為「網頁應用程式 (Web App)」，權限設為「任何人 (Anyone)」。
5.  複製產生的 URL，貼回 Coffee Lab 的「設定」頁面即可。

---

## 🛠️ 開發與建置

本專案使用 [Angular CLI](https://github.com/angular/angular-cli) 第 20.3.13 版產生。

### 啟動開發伺服器

執行以下指令啟動本地伺服器：

```bash
ng serve
```

開啟瀏覽器並訪問 `http://localhost:4288/`。當您修改原始碼時，網頁會自動重新整理。

### 建立新元件 (Scaffolding)

若要產生新元件，請執行：

```bash
ng generate component component-name
```

### 編譯專案 (Build)

執行以下指令進行編譯：

```bash
ng build
```

編譯後的檔案會儲存在 `dist/` 目錄下。

### 部署至 GitHub Pages

本專案已設定好自動部署工具。若您有修改權限，可使用以下指令發布：

```bash
# 1. 編譯 (請將 /CoffeeLab/ 替換為您的 Repository 名稱)
ng build --base-href /CoffeeLab/

# 2. 上傳
npx ngh --dir dist/coffee-lab/browser
```

## 🤝 貢獻

歡迎提交 Pull Request 或回報 Issue！