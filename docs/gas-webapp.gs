const SHEET_NAME = 'submissions';
const HEADER = [
  'created_at',
  'oshi_group',
  'member_mode',
  'oshi_member',
  'age_band',
  'code',
  'Lpct',
  'Spct',
  'Opct',
  'Npct',
  'answers_json',
  'user_agent'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const token = PropertiesService.getScriptProperties().getProperty('LOG_TOKEN');

    if (!token || body.token !== token) {
      return json({ ok: false, error: 'invalid token' });
    }

    const sheet = getOrCreateSheet_(SHEET_NAME);
    const row = [
      body.created_at || new Date().toISOString(),
      body.oshi_group || '',
      body.member_mode || '',
      body.oshi_member || '',
      body.age_band || '',
      body.code || '',
      body.Lpct || '',
      body.Spct || '',
      body.Opct || '',
      body.Npct || '',
      body.answers_json || '[]',
      body.user_agent || ''
    ];

    sheet.appendRow(row);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function getOrCreateSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
  }

  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
