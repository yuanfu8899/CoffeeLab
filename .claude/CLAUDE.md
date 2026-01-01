# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此程式庫中工作時提供指引。

## 專案概述

**Coffee Lab (咖啡實驗室)** 是使用 Angular 17+ 建構的單頁應用程式 (SPA)，作為全方位的咖啡沖煮小幫手。本應用程式管理：
- 咖啡豆庫存與資料
- 自訂沖煮手法與分步計時器
- 詳細的沖煮紀錄與感官評測
- 不同磨豆機的刻度設定檔

所有資料預設儲存在瀏覽器本地端，可選擇透過 Google Apps Script 同步至 Google Sheets 雲端。

## 技術堆疊

- **框架：** Angular 20.3+ (獨立元件、Signals)
- **語言：** TypeScript 5.9+ (嚴格模式)
- **樣式：** Tailwind CSS 4.0
- **狀態管理：** Angular Signals + RxJS
- **路由：** Angular Router with HashLocationStrategy (相容 GitHub Pages)
- **測試：** Jasmine + Karma
- **程式碼品質：** Prettier (100 字元寬度、HTML 單引號)
- **部署：** GitHub Pages (透過 angular-cli-ghpages)

## 開發指令

### 本地開發
```bash
npm start              # 啟動開發伺服器於 http://localhost:4288
ng serve              # 替代的開發伺服器指令
npm run watch         # 監看模式開發
```

### 測試
```bash
npm test              # 使用 Karma 執行所有單元測試
# 執行單一測試檔案：
ng test --include='**/specific-component.spec.ts'
# 在 headless 模式執行測試 (CI)：
ng test --watch=false --browsers=Chrome
```

### 建置與部署
```bash
npm run build              # 建置正式版本 (輸出至 dist/coffee-lab/browser)
# 部署至 GitHub Pages (需要推送權限)：
ng build --base-href /CoffeeLab/
npx ngh --dir dist/coffee-lab/browser
```

## 程式碼架構

### 目錄結構
```
src/
├── app/
│   ├── models/               # TypeScript 介面 (coffee.types.ts)
│   ├── services/             # 核心服務：狀態與資料管理
│   │   ├── repository.ts     # LocalStorage 持久化 (豆倉、手法、磨豆機)
│   │   ├── google-sheets.ts  # 透過 Apps Script 與 Google Sheets 雲端同步
│   │   └── brew-logic.ts     # 沖煮計算 (依烘焙度計算粉水比、水溫)
│   └── components/           # 功能元件，每個主要功能一個
│       ├── converter/        # 磨豆機刻度轉換器 (泰摩、小飛馬等)
│       ├── timer/            # 沖煮計時器與分步指引
│       ├── beans/            # 咖啡豆庫存管理
│       ├── methods/          # 沖煮手法 (食譜) 編輯器
│       ├── history/          # 沖煮紀錄檢視器與分析
│       ├── settings/         # API URL 設定、雲端同步控制
│       └── layout/           # 導航與共用版面
├── styles.css               # 全域樣式 (Tailwind imports)
└── main.ts                  # 應用程式啟動點
```

### 核心資料流

1. **Repository Service** (`services/repository.ts`)：
   - 管理 `beans`、`methods` 和 `grinders` 的本地 signals
   - 透過 Angular effects 自動儲存至 localStorage
   - 提供這三個實體的 CRUD 操作
   - 包含預設磨豆機設定檔 (泰摩 S3、小飛馬 600N)

2. **Google Sheets Service** (`services/google-sheets.ts`)：
   - 管理 Google Apps Script API URL (儲存於 signal 與 localStorage)
   - `submitData()` 傳送資料至後端進行雲端持久化
   - `getAllData()` 從雲端同步資料回來
   - 回傳 observables，若未設定 URL 則可優雅地失敗

3. **Brew Logic Service** (`services/brew-logic.ts`)：
   - 根據咖啡豆烘焙度計算水重與溫度
   - 供計時器與沖煮元件使用

### 核心資料模型

所有模型定義於 `src/app/models/coffee.types.ts`：
- `BrewMethod` - 沖煮手法範本與步驟
- `BrewStep` - 單一動作 (注水/等待) 與持續時間
- `CoffeeBean` - 庫存項目，包含烘焙度與風味描述
- `GrinderProfile` - 磨豆機設定 (最小/最大/刻度間距值)
- `BrewRecord` - 完整沖煮記錄，包含參數與感官評測
- `SensoryProfile` - 品飲筆記 (香氣、酸度、甜度、醇厚度、餘韻、平衡度、整體)

### 元件組織

每個主要功能都有自己的資料夾，包含：
- `.ts` - 元件邏輯，使用 signals 與 computed 值
- `.html` - 範本，使用 Angular 原生控制流 (`@if`、`@for`、`@switch`)
- `.spec.ts` - 單元測試
- `.css` - 元件範疇樣式

**導航路由** (定義於 `app.routes.ts`)：
- `/converter` - 磨豆機刻度轉換器
- `/timer` - 沖煮計時器與步驟追蹤
- `/beans` - 咖啡豆庫存管理
- `/methods` - 自訂沖煮手法編輯器
- `/history` - 沖煮紀錄與感官評測
- `/settings` - API 設定與資料管理

## Angular & TypeScript 編碼規範

### TypeScript
- 避免使用 `any` 型別；不確定時使用 `unknown`
- 型別明顯時優先使用型別推論

### Signals 與狀態管理
- 使用 `signal()` 處理可變狀態，`computed()` 處理衍生狀態
- 在服務中使用 `effect()` 實現自動儲存行為 (參考 repository.ts)
- 絕不使用 `mutate()`；請使用 `update()` 或 `set()`

### 元件
- 所有元件都是獨立元件 (請勿設定 `standalone: true` - 這是預設值)
- 使用 `input()` 與 `output()` 函式，而非 `@Input()` 與 `@Output()` 裝飾器
- 在 `@Component` 裝飾器中設定 `changeDetection: ChangeDetectionStrategy.OnPush`
- 小型元件優先使用內聯範本
- 請勿使用 `@HostBinding` 與 `@HostListener` 裝飾器；改用裝飾器中的 `host` 物件
- 靜態圖片使用 `NgOptimizedImage` (不適用於內聯 base64 圖片)

### 服務
- 使用 `inject()` 而非建構函式注入
- 單例服務使用 `providedIn: 'root'`

### 範本
- 使用原生控制流：`@if`、`@for`、`@switch` (絕不使用 `*ngIf`、`*ngFor`、`*ngSwitch`)
- 使用 class 綁定 (不用 `ngClass`) 與 style 綁定 (不用 `ngStyle`)
- 使用 async pipe 處理 observables

### 表單
- 優先使用反應式表單 (Reactive forms) 而非範本驅動表單
- 使用 @angular/forms 的 FormControl、FormGroup

## 測試

- 測試使用 Jasmine 測試框架與 Karma 執行器
- 每個元件與服務都有 `.spec.ts` 檔案
- 執行 `npm test` 來執行測試套件
- 測試應遵循 arrange-act-assert 模式

## 建置設定

- **TypeScript 嚴格模式：** 啟用額外檢查 (noImplicitOverride、noImplicitReturns 等)
- **Tailwind CSS：** 使用 PostCSS 外掛 (@tailwindcss/postcss v4.1.18)
- **正式版預算：** 初始 500KB，最大 1MB (CI 中強制執行警告/錯誤)
- **Prettier 設定：** 100 字元寬度、單引號、Angular HTML 解析器

## 重要注意事項

### 資料隱私
所有資料儲存於瀏覽器本地端 (`localStorage`)。使用者可以選擇在設定中配置 API URL，將資料同步至自己的 Google Sheet。不同使用者之間不會共用資料。

### GitHub Pages 部署
本應用程式使用 `HashLocationStrategy` 進行路由，因此 URL 格式為 `#` 開頭 (例如 `/#/timer`)。這對 GitHub Pages 相容性至關重要。

### UI 提示
應用程式使用 SweetAlert2 處理 toasts 與對話框，在初始化與錯誤狀態時觸發。

### Zoneless 變更偵測
應用程式使用 `provideZonelessChangeDetection()` 以在現代瀏覽器中獲得更好的效能。
