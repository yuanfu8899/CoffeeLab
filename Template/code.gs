/**
 * Coffee Lab Backend API (Google Apps Script)
 * 
 * 說明：
 * 本腳本用於接收 Coffee Lab 前端的資料 (沖煮紀錄、豆子、手法、磨豆機)，
 * 並將其儲存於 Google Sheets 中。
 * 
 * 安裝步驟：
 * 1. 建立一個新的 Google Sheet。
 * 2. 建立四個分頁 (Sheet)，名稱分別為： 'Logs', 'Beans', 'Methods', 'Grinders'。
 * 3. 點選「擴充功能」 -> 「Apps Script」。
 * 4. 將本檔案內容複製貼上至編輯器中。
 * 5. 點選「部署」 -> 「新增部署」 -> 選擇類型「網頁應用程式」。
 * 6. 設定：
 *    - 執行身分：我 (Me)
 *    - 誰可以存取：任何人 (Anyone)  <-- 重要！
 * 7. 複製產生的網頁應用程式 URL，貼回 Coffee Lab 的設定頁面。
 */

// ==========================================
// 1. 處理寫入請求 (POST)
// ==========================================
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  
  try {
    // 解析前端傳來的 JSON
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    
    // 路由：根據 type 決定要寫入哪張表
    switch (payload.type) {
      case 'LOG':
        result = addLog(ss, payload.data);
        break;
      case 'BEAN':
        result = addBean(ss, payload.data);
        break;
      case 'GRINDER':
        result = addGrinder(ss, payload.data);
        break;
      case 'METHOD':
        result = addMethod(ss, payload.data);
        break;
      default:
        throw new Error("Unknown type: " + payload.type);
    }
    
    return createJSONOutput(result);

  } catch (error) {
    return createJSONOutput({ status: 'error', message: error.toString() });
  }
}

// ==========================================
// 2. 處理讀取請求 (GET) - 用於前端初始化資料
// ==========================================
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action; // 例如 ?action=getAll
  
  try {
    if (action === 'getAll') {
      // 一次讀取所有「設定類」資料 (豆子, 磨豆機, 食譜) 給前端快取
      var data = {
        beans: getSheetData(ss, 'Beans'),
        grinders: getSheetData(ss, 'Grinders'),
        methods: getSheetData(ss, 'Methods'),
        logs: getSheetData(ss, 'Logs') // 若資料量大，建議分開讀取
      };
      return createJSONOutput({ status: 'success', data: data });
    } else {
      return createJSONOutput({ status: 'error', message: "Invalid action" });
    }
  } catch (error) {
    return createJSONOutput({ status: 'error', message: error.toString() });
  }
}

// ==========================================
// 3. 內部邏輯函式 (寫入)
// ==========================================

// --- 新增沖煮紀錄 (Logs) ---
function addLog(ss, data) {
  var sheet = ss.getSheetByName('Logs');
  if (!sheet) setupSheet(ss, 'Logs'); // 自動建立 Sheet 若不存在
  sheet = ss.getSheetByName('Logs');
  
  var row = [
    data.id,
    new Date(),         // Date
    data.beanId,
    data.beanName,
    data.methodId,      // [Method 關聯]
    data.grinderId,
    data.settingUsed,
    data.beanWeight,
    data.waterWeight,
    data.temperature,
    data.totalTime,
    // Sensory
    data.sensory.aroma,
    data.sensory.acidity,
    data.sensory.sweetness,
    data.sensory.body,
    data.sensory.aftertaste,
    data.sensory.balance,
    data.sensory.overall,
    data.notes || ''
  ];
  
  sheet.appendRow(row);
  return { status: 'success', type: 'LOG', row: sheet.getLastRow() };
}

// --- 新增沖煮食譜 (Methods) ---
function addMethod(ss, data) {
  var sheet = ss.getSheetByName('Methods');
  if (!sheet) setupSheet(ss, 'Methods');
  sheet = ss.getSheetByName('Methods');

  // [關鍵] 將步驟陣列轉為 JSON 字串儲存
  var stepsString = JSON.stringify(data.steps || []);

  var row = [
    data.id,
    data.name,
    data.category,
    data.recommendedTemp || 92,
    data.recommendedRatio || 15,
    stepsString,        // F欄: 存入 JSON 字串
    data.description || ''
  ];
  
  sheet.appendRow(row);
  return { status: 'success', type: 'METHOD', row: sheet.getLastRow() };
}

// --- 新增豆子 (Beans) ---
function addBean(ss, data) {
  var sheet = ss.getSheetByName('Beans');
  if (!sheet) setupSheet(ss, 'Beans');
  sheet = ss.getSheetByName('Beans');

  var row = [
    data.id,
    data.name,
    data.roastLevel,
    data.shop,
    data.purchaseDate,
    data.weight,
    data.flavorNotes, // 前端傳來的是字串
    true
  ];
  sheet.appendRow(row);
  return { status: 'success', type: 'BEAN', row: sheet.getLastRow() };
}

// --- 新增磨豆機 (Grinders) ---
function addGrinder(ss, data) {
  var sheet = ss.getSheetByName('Grinders');
  if (!sheet) setupSheet(ss, 'Grinders');
  sheet = ss.getSheetByName('Grinders');

  var row = [
    data.id,
    data.name,
    data.defaultSetting,
    data.minSetting,
    data.maxSetting,
    data.step
  ];
  sheet.appendRow(row);
  return { status: 'success', type: 'GRINDER', row: sheet.getLastRow() };
}

// ==========================================
// 4. 工具函式
// ==========================================

// 自動建立 Sheet 並填寫標題列
function setupSheet(ss, name) {
  var sheet = ss.insertSheet(name);
  var headers = [];
  
  if (name === 'Logs') headers = ['ID', 'Date', 'BeanId', 'BeanName', 'MethodId', 'GrinderId', 'Setting', 'Bean(g)', 'Water(g)', 'Temp', 'Time', 'Aroma', 'Acidity', 'Sweetness', 'Body', 'Aftertaste', 'Balance', 'Overall', 'Notes'];
  if (name === 'Beans') headers = ['ID', 'Name', 'Roast', 'Shop', 'Date', 'Weight', 'Notes', 'Active'];
  if (name === 'Methods') headers = ['ID', 'Name', 'Category', 'Temp', 'Ratio', 'stepsJson', 'Description'];
  if (name === 'Grinders') headers = ['ID', 'Name', 'Default', 'Min', 'Max', 'Step'];
  
  sheet.appendRow(headers);
}

// 讀取整張表並轉為 JSON 物件陣列 (略過第一列標題)
function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0]; // 第一列是標題
  var data = [];
  
  // 從第二列開始讀取資料
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      var value = row[j];
      
      // 特殊處理: 如果是 methods 表的 stepsJson 欄位，嘗試轉回物件
      if (headerName === 'stepsJson' && typeof value === 'string' && value.startsWith('[')) {
        try {
          obj[headerName] = JSON.parse(value);
        } catch(e) {
          obj[headerName] = [];
        }
      } else {
        obj[headerName] = value;
      }
    }
    data.push(obj);
  }
  return data;
}

// 統一輸出 JSON 格式 (解決 CORS 問題的標準寫法)
function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
