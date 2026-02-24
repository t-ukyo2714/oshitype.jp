# Google Apps Script (GAS) for OshiType Logging

Copy and paste the following script into your Google Sheet's Apps Script editor.

```javascript
// 1. Spreadsheet > Extensions > Apps Script
// 2. Paste this code
// 3. Set your LOG_TOKEN (same as .env)
// 4. Deploy > New Deployment > Web App
// 5. Access: Anyone (Important!)

const LOG_TOKEN = "your-secret-token-here"; // Change this to a secure random string

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Simple security check
    if (data.token !== LOG_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "forbidden" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Oshi Group", "Member Mode", "Oshi Member", "Age Band", 
        "Code", "Lpct", "Spct", "Opct", "Npct", "User Agent"
      ]);
    }

    sheet.appendRow([
      data.created_at,
      data.oshi_group,
      data.member_mode,
      data.oshi_member,
      data.age_band,
      data.code,
      data.Lpct,
      data.Spct,
      data.Opct,
      data.Npct,
      data.user_agent
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```
