/**
 * SHREE BHEEMASHANKAR S S K N., MARAGUR - SUGAR ALLOTMENT SYSTEM
 * Google Apps Script Backend (Code.gs) v36.0 - STRICT EXACT UNIQUE ID ENGINE
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet (ID: 1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ)
 * 2. Click Extensions -> Apps Script
 * 3. Replace all existing code in Code.gs with this code.
 * 4. Click Deploy -> New deployment -> Select 'Web app' -> Execute as: 'Me', Who has access: 'Anyone'.
 */

const SPREADSHEET_ID = "1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ";
const ADMIN_UNBLOCK_PIN = "1207";

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Web App HTTP GET Endpoint (JSON / JSONP API)
 */
function doGet(e) {
  const params = e ? e.parameter : {};
  const action = params.action || '';
  const callback = params.callback || '';

  let result = { success: false, message: 'Invalid action' };

  try {
    if (action === 'getShareholderInfo') {
      const shId = params.id || params.shId || '';
      result = getShareholderInfo(shId);
    } else if (action === 'verifyLoginUser' || action === 'login') {
      const userId = params.userId || params.id || '';
      const password = params.password || params.pass || '';
      result = verifyLoginUser(userId, password);
    } else if (action === 'allotSugar') {
      result = allotSugarFromParams(params);
    } else if (action === 'addShareholder') {
      const shDataStr = params.shData || '{}';
      let shData = {};
      try { shData = JSON.parse(shDataStr); } catch(err) { shData = {}; }
      result = addShareholder(shData);
    } else {
      result = { success: true, message: 'Sugar Allotment Backend v36.0 Online' };
    }
  } catch (err) {
    result = { success: false, message: 'Error: ' + err.toString() };
  }

  const jsonString = JSON.stringify(result);

  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonString + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * STRICT EXACT UNIQUE SHAREHOLDER ID MATCHING ENGINE v36.0
 * Enforces 100% exact string equality (case-insensitive, whitespace-cleaned).
 * Typing '1' ONLY matches exact ID '1' (NOT '*1', '#1', '10', '12', etc.).
 * Typing '*1' ONLY matches exact ID '*1'.
 * Typing '#1' ONLY matches exact ID '#1'.
 * Typing '*2' ONLY matches exact ID '*2'.
 * Typing '#2' ONLY matches exact ID '#2'.
 * NO partial, contained, or substring matching.
 */
function scoreIdMatch(targetRaw, cellRaw) {
  if (targetRaw === undefined || targetRaw === null || cellRaw === undefined || cellRaw === null) return 0;

  const targetClean = String(targetRaw).trim().toUpperCase().replace(/[\s\u00A0]+/g, '');
  const cellClean = String(cellRaw).trim().toUpperCase().replace(/[\s\u00A0]+/g, '');

  if (!targetClean || !cellClean) return 0;

  // Exact string match ONLY
  if (targetClean === cellClean) return 100;

  return 0;
}

/**
 * Searches across tabs in Google Spreadsheet & returns STRICT EXACT shareholder match
 */
function getShareholderInfo(shId) {
  const ss = getSpreadsheet();
  const targetId = String(shId || '').trim();

  if (!targetId) {
    return { found: false, message: "Shareholder ID is required." };
  }

  const sheets = ss.getSheets();
  let exactMatch = null;

  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    const sheetName = sheet.getName();
    if (sheetName === 'Transactions' || sheetName === 'ReceiptCounter' || sheetName === 'CounterTracker') continue;

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) continue;

    let idColIdx = 0;
    let startRow = 0;

    if (data.length > 0 && data[0]) {
      for (let c = 0; c < data[0].length; c++) {
        const h = String(data[0][c] || '').toLowerCase().trim();
        if (h.includes('shareholder id') || h.includes('share no') || h.includes('sh_id') || h === 'id') {
          idColIdx = c;
          startRow = 1;
          break;
        }
      }
      if (startRow === 0 && (String(data[0][idColIdx]).toLowerCase().includes('id') || String(data[0][idColIdx]).toLowerCase().includes('share'))) {
        startRow = 1;
      }
    }

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const cellVal = String(row[idColIdx] || row[0] || '').trim();
      if (!cellVal) continue;

      const score = scoreIdMatch(targetId, cellVal);

      if (score === 100) {
        exactMatch = { row: row, idColIdx: idColIdx, cellVal: cellVal };
        break; // Found 100% exact match!
      }
    }

    if (exactMatch) break;
  }

  if (exactMatch) {
    const r = exactMatch.row;
    const matchedIdVal = exactMatch.cellVal;

    let matchedName = String(r[1] || '').trim();
    let matchedAddress = 'Maragur';
    let matchedCat = 'ಅ - वर्ग';
    let matchedShares = 1;

    if (r[4] !== undefined && r[4] !== null && /^\d+$/.test(String(r[4]).trim())) {
      matchedShares = parseInt(String(r[4]).trim(), 10);
    }

    for (let k = 0; k < r.length; k++) {
      if (k === exactMatch.idColIdx) continue;
      const val = String(r[k] || '').trim();
      if (!val) continue;

      if (val.includes('वर्ग') || val.includes('Class') || val.includes('Regular')) {
        matchedCat = val;
      } else if (k !== 1 && !matchedName && val.length > 1 && !/^\d+$/.test(val)) {
        matchedName = val;
      } else if (matchedName && matchedAddress === 'Maragur' && !/^\d+$/.test(val) && val !== matchedName && val !== matchedCat) {
        matchedAddress = val;
      }
    }

    if (!matchedName || /^\d+$/.test(matchedName)) matchedName = 'Shareholder ' + matchedIdVal;
    const hasReceived = checkReceivedInAllotments(ss, matchedIdVal);

    return {
      found: true,
      id: matchedIdVal,
      name: matchedName,
      address: matchedAddress,
      phone: '',
      memberType: matchedCat,
      shareQuantity: matchedShares > 0 ? matchedShares : 1,
      eligible: !hasReceived,
      hasReceived: hasReceived
    };
  }

  return {
    found: false,
    message: 'Shareholder ID "' + targetId + '" not found in Google Sheet database.'
  };
}

function checkReceivedInAllotments(ss, shId) {
  try {
    const sheet = ss.getSheetByName('Allotments') || ss.getSheetByName('Transactions');
    if (!sheet) return false;

    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) return false;

    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][1] || '').trim();
      if (scoreIdMatch(shId, rowId) === 100) {
        return true;
      }
    }
  } catch (err) {}
  return false;
}

function verifyLoginUser(userId, password) {
  const ss = getSpreadsheet();
  const targetId = String(userId || '').trim().toUpperCase();
  const enteredPass = String(password || '').trim();

  let userSheet = ss.getSheetByName('Users') || ss.getSheetByName('users');
  if (!userSheet) {
    return { success: false, message: 'Users tab not found in Google Sheet.' };
  }

  const data = userSheet.getDataRange().getValues();
  if (!data || data.length === 0) {
    return { success: false, message: 'Users tab is empty.' };
  }

  let idIdx = 0, nameIdx = 1, roleIdx = 2, passIdx = 3;
  let startRow = 0;

  for (let j = 0; j < data[0].length; j++) {
    const lbl = String(data[0][j] || '').toLowerCase().trim();
    if (lbl.includes('user id') || lbl === 'id' || lbl === 'user') idIdx = j;
    else if (lbl.includes('name')) nameIdx = j;
    else if (lbl.includes('role')) roleIdx = j;
    else if (lbl.includes('password') || lbl.includes('pass')) passIdx = j;
  }

  if (startRow === 0 && (String(data[0][idIdx]).toLowerCase().includes('user') || String(data[0][idIdx]).toLowerCase().includes('id'))) {
    startRow = 1;
  }

  for (let i = startRow; i < data.length; i++) {
    const cellId = String(data[i][idIdx] || '').trim().toUpperCase();
    if (!cellId) continue;

    if (scoreIdMatch(targetId, cellId) === 100 || cellId === targetId) {
      const expectedPass = String(data[i][passIdx] || '').trim();
      if (enteredPass !== expectedPass) {
        return { success: false, message: 'Incorrect password.' };
      }
      return {
        success: true,
        user: {
          id: cellId,
          name: String(data[i][nameIdx] || ('User ' + cellId)).trim(),
          role: String(data[i][roleIdx] || 'Cashier').trim()
        }
      };
    }
  }

  return { success: false, message: 'User ID "' + userId + '" not found in Users tab.' };
}

function allotSugarFromParams(params) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Allotments') || ss.getSheetByName('Transactions');

  if (!sheet) {
    sheet = ss.insertSheet('Allotments');
    sheet.appendRow([
      'Receipt Number', 'Shareholder ID', 'Shareholder Name', 'Shares',
      'Sugar Quantity (kg)', 'Price/kg', 'Total Amount', 'Amount Paid',
      'Balance', 'Aadhaar Number', 'Mobile Number', 'Allotment Option',
      'Processed By', 'Status', 'Timestamp'
    ]);
  }

  const receiptNo = 'SLIP-' + Math.floor(Date.now() / 1000);
  const shId = params.shId || '';
  const shName = params.shName || '';
  const shares = params.shares || 1;
  const quantity = params.quantity || 25;
  const totalAmount = params.totalAmount || (quantity * 20);
  const amountPaid = params.amountPaid || totalAmount;
  const balance = totalAmount - amountPaid;
  const aadhaar = params.aadhaar || '';
  const mobile = params.mobile || '';
  const timestamp = new Date().toLocaleString();

  sheet.appendRow([
    receiptNo, shId, shName, shares,
    quantity, 20, totalAmount, amountPaid,
    balance, aadhaar, mobile, 2,
    'Cashier 1', 'SUCCESS', timestamp
  ]);

  return {
    success: true,
    message: 'Sugar Allotment Slip Created!',
    receiptNumber: receiptNo,
    quantity: quantity,
    totalAmount: totalAmount,
    date: timestamp
  };
}

function addShareholder(shData) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Shareholders');

  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets[0];
  }

  sheet.appendRow([
    shData.id || '',
    shData.name || '',
    shData.address || 'Maragur',
    shData.memberType || 'ಅ - वर्ग',
    shData.shares || 1
  ]);

  return {
    success: true,
    message: 'New Shareholder ID "' + shData.id + '" added successfully to Google Sheet!'
  };
}
