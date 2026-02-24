# Google Apps Script (GAS) for OshiType Logging

Copy and paste the following script into your Google Sheet's Apps Script editor.

```javascript
// 1. Spreadsheet > Extensions > Apps Script
// 2. Paste this code
// 3. Set your LOG_TOKEN (same as .env)
// 4. Deploy > New Deployment > Web App
// 5. Access: Anyone (Important!)

const LOG_TOKEN = "your-secret-token-here";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== LOG_TOKEN) {
      return response({ ok: false, error: "forbidden" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action || 'log_submission';

    if (action === 'log_submission') {
      const sheet = getOrCreateSheet(ss, "Log");
      sheet.appendRow([
        data.created_at, data.oshi_group, data.member_mode, data.oshi_member,
        data.age_band, data.code, data.Lpct, data.Spct, data.Opct, data.Npct, data.user_agent
      ]);
      return response({ ok: true });
    }

    if (action === 'update_master') {
      const sheet = ss.getSheetByName(data.type); // type: Questions, Results, AxisDefinitions
      if (!sheet) return response({ ok: false, error: "sheet not found" });
      
      sheet.clear();
      if (data.rows && data.rows.length > 0) {
        sheet.getRange(1, 1, data.rows.length, data.rows[0].length).setValues(data.rows);
      }
      return response({ ok: true });
    }

    return response({ ok: false, error: "unknown action" });
  } catch (err) {
    return response({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  try {
    const type = e.parameter.type; // Questions, Results, AxisDefinitions
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(type);
    if (!sheet) return response({ ok: false, error: "sheet not found" });

    const values = sheet.getDataRange().getValues();
    return response({ ok: true, data: values });
  } catch (err) {
    return response({ ok: false, error: err.toString() });
  }
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Log") {
      sheet.appendRow(["Timestamp", "Oshi Group", "Member Mode", "Oshi Member", "Age Band", "Code", "Lpct", "Spct", "Opct", "Npct", "User Agent"]);
    }
  }
  return sheet;
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```
