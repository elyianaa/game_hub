// Game Hub leaderboard backend (Google Apps Script).
// Paste this into Extensions > Apps Script inside a Google Sheet, then deploy as a Web app (see README).
const SHEET = 'scores';
const MAX = { sudoku: 100, tile: 1000 };   // highest allowed score per game
const TOP = 20;                            // how many players the leaderboard shows

function doGet(e) {
  const p = (e && e.parameter) || {};
  try { return out(p.action === 'submit' ? submit(p) : top(p.game)); }
  catch (err) { return out({ ok: false, error: String(err) }); }
}

const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) { s = ss.insertSheet(SHEET); s.appendRow(['game', 'name', 'score', 'updated']); s.getRange('B:B').setNumberFormat('@'); }
  return s;
}

// Remove odd characters and leading = + - @ so a name can never become a spreadsheet formula.
function clean(n) {
  return String(n || '').replace(/[\u0000-\u001f<>"'`\\]/g, '').trim().replace(/^[=+\-@]+/, '').slice(0, 15).trim();
}

function submit(p) {
  const game = p.game, name = clean(p.name), score = Math.floor(Number(p.score));
  if (!(game in MAX)) throw 'bad game';
  if (!name) throw 'bad name';
  if (!(score >= 0 && score <= MAX[game])) throw 'bad score';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const s = sheet(), rows = s.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === game && String(rows[i][1]).toLowerCase() === name.toLowerCase()) {
        const old = Number(rows[i][2]);
        if (score > old) s.getRange(i + 1, 3, 1, 2).setValues([[score, new Date()]]);   // only ever goes up
        return { ok: true, best: Math.max(score, old) };
      }
    }
    s.appendRow([game, name, score, new Date()]);
    return { ok: true, best: score };
  } finally { lock.releaseLock(); }
}

function top(game) {
  if (!(game in MAX)) throw 'bad game';
  const rows = sheet().getDataRange().getValues().slice(1).filter(r => r[0] === game);
  rows.sort((a, b) => b[2] - a[2] || new Date(a[3]) - new Date(b[3]));   // highest score first, earlier date wins ties
  return { ok: true, list: rows.slice(0, TOP).map(r => ({ name: String(r[1]), score: Number(r[2]) })) };
}
