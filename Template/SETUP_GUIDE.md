# Coffee Lab 後端架設教學 (Google Apps Script)

Coffee Lab 是一個靜態網頁應用程式 (PWA)，它依賴 **Google Sheets** 作為免費的雲端資料庫。
請依照以下步驟設定您的專屬後端。

## 步驟 1: 建立 Google Sheet

1.  前往 [Google Sheets](https://docs.google.com/spreadsheets/) 並建立一個新的試算表。
2.  命名為 `Coffee Lab DB` (或其他您喜歡的名字)。
3.  **不需要手動建立欄位**，腳本會在第一次寫入時自動建立。但為了保險起見，您也可以手動建立四個分頁 (Sheet)，名稱分別為：
    *   `Logs` (沖煮紀錄)
    *   `Beans` (豆倉)
    *   `Methods` (沖煮手法)
    *   `Grinders` (磨豆機)

## 步驟 2: 設定 Google Apps Script

1.  在試算表中，點選上方選單的 **「擴充功能」 (Extensions)** -> **「Apps Script」**。
2.  這會開啟一個新的程式碼編輯器視窗。
3.  將原本編輯器內的 `myFunction` 清空。
4.  打開本專案資料夾中的 `Template/code.gs` 檔案，複製所有內容，並貼上到編輯器中。
5.  點選上方磁碟片圖示 **「儲存專案」**。

## 步驟 3: 部署為網頁應用程式

這是最關鍵的一步，請仔細設定：

1.  點選編輯器右上角的藍色按鈕 **「部署」 (Deploy)** -> **「新增部署」 (New deployment)**。
2.  在左側選擇 **「網頁應用程式」 (Web app)** (如果是第一次，點選齒輪圖示選取)。
3.  填寫設定：
    *   **說明 (Description)**: `Coffee Lab API v1` (隨意填寫)
    *   **執行身分 (Execute as)**: **「我」 (Me)**  <-- 務必選這個
    *   **誰可以存取 (Who has access)**: **「任何人」 (Anyone)** <-- 務必選這個，否則前端無法寫入
4.  點選 **「部署」 (Deploy)**。
5.  Google 可能會跳出權限審查視窗，請點選 **「核對權限」** -> 選擇您的 Google 帳號 -> 點選 **「進階」 (Advanced)** -> 點選 **「前往 ... (不安全)」 (Go to ... (unsafe))** -> 最後點選 **「允許」 (Allow)**。
    *(這是因為這是您自己寫的腳本，Google 尚未驗證，這是正常現象)*

## 步驟 4: 取得 API URL

1.  部署成功後，畫面會顯示一串 **網頁應用程式網址 (Web app URL)** (以 `https://script.google.com/macros/s/...` 開頭)。
2.  點選 **「複製」**。

## 步驟 5: 連接前端

1.  打開您的 Coffee Lab 網頁。
2.  如果這是第一次開啟，系統應該會跳出提示請您設定 Google Sheets。
3.  前往 **「設定」 (Settings)** 頁面。
4.  將剛剛複製的 URL 貼上到 **「網頁應用程式 URL」** 欄位中。
5.  點選 **「儲存配置」**。

🎉 **完成！** 現在您的 Coffee Lab 已經擁有完整的雲端同步功能了。
