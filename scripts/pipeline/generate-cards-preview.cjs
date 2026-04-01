const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(ROOT, 'review', 'cards_preview_latest.html');

const IDS = [
  'BS01-RU-002',
  'BS01-RU-003',
  'BS01-RU-004',
  'BS01-RU-005',
  'BS01-RU-006',
  'BS01-MO-002',
  'BS01-MO-003',
  'BS01-MO-004',
  'BS01-MO-005',
  'BS01-MO-006',
];

const NOTE = {
  'BS01-RU-002': '\\u5148\\u624B\\u5E72\\u6270\\uFF1A1\\u8D39\\u6302\\u6000\\u7591\\u5E76\\u8FC7\\u724C\\uFF0C\\u62A2\\u8282\\u594F\\u3002',
  'BS01-RU-003': '\\u624B\\u724C\\u5FAA\\u73AF\\uFF1A2\\u8D39\\u62BD2\\u5F031\\uFF0C\\u8FC7\\u6EE4\\u624B\\u724C\\u8D28\\u91CF\\u3002',
  'BS01-RU-004': '\\u4E2D\\u671F\\u7A33\\u573A\\uFF1A3\\u8D39\\u8865\\u62A4\\u6301\\u5E76\\u8865\\u724C\\u3002',
  'BS01-RU-005': '\\u4E2D\\u671F\\u538B\\u5236\\uFF1A3\\u8D39\\u53CC\\u6548\\u679C\\uFF0C\\u517C\\u987E\\u9632\\u5B88\\u548C\\u63A7\\u5236\\u3002',
  'BS01-RU-006': '\\u9AD8\\u8D39\\u6536\\u53E3\\uFF1A4\\u8D39\\u76F4\\u4F24+\\u88651\\uFF0C\\u7ED3\\u675F\\u62C9\\u626F\\u56DE\\u5408\\u3002',
  'BS01-MO-002': '\\u5148\\u624B\\u8BD5\\u63A2\\uFF1A1\\u8D39\\u62531\\u5E76\\u8FC7\\u724C\\uFF0C\\u4F4E\\u98CE\\u9669\\u8D77\\u624B\\u3002',
  'BS01-MO-003': '\\u4E2D\\u4F4E\\u8D39\\u538B\\u5236\\uFF1A2\\u8D39\\u62532\\u5E76\\u4E0A\\u6000\\u7591\\u3002',
  'BS01-MO-004': '\\u9632\\u7EBF\\u5EFA\\u7ACB\\uFF1A3\\u8D39\\u9AD8\\u62A4\\u6301+\\u56DE\\u590D\\uFF0C\\u6297\\u7206\\u53D1\\u3002',
  'BS01-MO-005': '\\u8D44\\u6E90\\u7EED\\u822A\\uFF1A3\\u8D39\\u62A4\\u6301+\\u62BD\\u724C\\uFF0C\\u7A33\\u4F4F\\u4E2D\\u76D8\\u3002',
  'BS01-MO-006': '\\u58C1\\u5792\\u7EC8\\u7ED3\\uFF1A4\\u8D39\\u539A\\u62A4\\u6301\\u5E76\\u8865\\u4E00\\u70B9\\u8F93\\u51FA\\u3002',
};

const TXT = {
  pageTitle: 'BS01 10\\u5F20\\u5361\\u9884\\u89C8\\uFF08\\u9632\\u4E71\\u7801\\u7248\\uFF09',
  h1: 'BS01 \\u9996\\u627910\\u5F20\\u5361\\u9884\\u89C8',
  sub: '\\u7EDF\\u4E00\\u4F7F\\u7528\\u5B9E\\u4F53\\u7F16\\u7801\\u8F93\\u51FA\\uFF0C\\u4FDD\\u8BC1\\u4E0D\\u53D7\\u7CFB\\u7EDF\\u7F16\\u7801\\u5DEE\\u5F02\\u5F71\\u54CD\\u3002',
  dist: '\\u8D39\\u7528\\u5206\\u5E03\\uFF1A',
  avg: '\\u5E73\\u5747\\u8D39\\u7528\\uFF1A',
  cap: '\\u89C4\\u5219\\u4E0A\\u9650\\uFF1A\\u6BCF\\u5F20\\u226425\\u5B57',
  gate: '\\u95E8\\u7981\\u72B6\\u6001\\uFF1Agate:daily PASS',
  school: '\\u5B66\\u6D3E',
  type: '\\u7C7B\\u578B',
  rarity: '\\u7A00\\u6709\\u5EA6',
  cost: '\\u8D39\\u7528',
  rules: '\\u89C4\\u5219\\u6587\\u672C\\uFF1A',
  chars: '\\u5B57',
  keywords: '\\u5173\\u952E\\u8BCD\\uFF1A',
  mechanics: '\\u673A\\u5236\\uFF1A',
  anchors: '\\u951A\\u70B9\\uFF1A',
  note: '\\u5B9A\\u4F4D\\u89E3\\u91CA\\uFF1A',
  none: '\\u65E0',
};

function toEntities(input) {
  const s = String(input ?? '');
  let out = '';
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code < 128 && ch !== '&' && ch !== '<' && ch !== '>' && ch !== '"' && ch !== "'") {
      out += ch;
    } else if (ch === '&') out += '&amp;';
    else if (ch === '<') out += '&lt;';
    else if (ch === '>') out += '&gt;';
    else if (ch === '"') out += '&quot;';
    else if (ch === "'") out += '&#39;';
    else out += `&#x${code.toString(16).toUpperCase()};`;
  }
  return out;
}

function decodeUnicodeEscapes(input) {
  return String(input ?? '').replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function loadCard(id) {
  const p = path.join(ROOT, 'content', 'cards', `${id}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const cards = IDS.map(loadCard);
  const costMap = new Map();
  for (const c of cards) {
    costMap.set(c.cost, (costMap.get(c.cost) || 0) + 1);
  }
  const costDist = [...costMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, v]) => `${decodeUnicodeEscapes('\\u8D39')}${k}: ${v}${decodeUnicodeEscapes('\\u5F20')}`)
    .join(' / ');
  const avgCost = (cards.reduce((sum, c) => sum + c.cost, 0) / cards.length).toFixed(2);

  const cardHtml = cards.map((c) => {
    const keywords = (c.keyword_ids || []).join(decodeUnicodeEscapes('\\u3001')) || decodeUnicodeEscapes(TXT.none);
    return `
<section class="card">
  <div class="head"><span class="id">${toEntities(c.id)}</span><h2>${toEntities(c.name)}</h2></div>
  <div class="meta">
    <div><b>${toEntities(decodeUnicodeEscapes(TXT.school))}</b><span>${toEntities(c.faction)}</span></div>
    <div><b>${toEntities(decodeUnicodeEscapes(TXT.type))}</b><span>${toEntities(c.type)}</span></div>
    <div><b>${toEntities(decodeUnicodeEscapes(TXT.rarity))}</b><span>${toEntities(c.rarity)}</span></div>
    <div><b>${toEntities(decodeUnicodeEscapes(TXT.cost))}</b><span>${toEntities(c.cost)}</span></div>
  </div>
  <div class="line"><b>${toEntities(decodeUnicodeEscapes(TXT.rules))}</b>${toEntities(c.rules_text)} <span class="dim">(${toEntities((c.rules_text || '').length)}${toEntities(decodeUnicodeEscapes(TXT.chars))})</span></div>
  <div class="line"><b>${toEntities(decodeUnicodeEscapes(TXT.keywords))}</b>${toEntities(keywords)}</div>
  <div class="line"><b>${toEntities(decodeUnicodeEscapes(TXT.mechanics))}</b>${toEntities((c.mechanic_ids || []).join(' / '))}</div>
  <div class="line"><b>${toEntities(decodeUnicodeEscapes(TXT.anchors))}</b>${toEntities((c.lore_anchor_ids || []).join(' / '))}</div>
  <div class="note"><b>${toEntities(decodeUnicodeEscapes(TXT.note))}</b>${toEntities(decodeUnicodeEscapes(NOTE[c.id] || ''))}</div>
</section>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${toEntities(decodeUnicodeEscapes(TXT.pageTitle))}</title>
<style>
:root{--bg:#f4f6fb;--card:#fff;--text:#1f2937;--muted:#6b7280;--line:#e5e7eb;--acc:#155e75}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif}
.wrap{max-width:980px;margin:20px auto;padding:0 14px 24px}
.banner{background:#ecfeff;border:1px solid #bae6fd;border-radius:12px;padding:12px 14px;margin-bottom:12px}
h1{margin:0 0 6px;font-size:28px}.sub{color:var(--muted);font-size:14px}
.kv{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}.pill{background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 10px;font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:12px 0;box-shadow:0 4px 14px rgba(0,0,0,.04)}
.head{display:flex;gap:10px;align-items:baseline}.id{font-weight:700;color:var(--acc)} h2{margin:0;font-size:22px}
.meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0}
.meta>div{border:1px solid var(--line);background:#fafafa;border-radius:10px;padding:8px}
.meta b{display:block;font-size:12px;color:#374151}.meta span{font-size:15px}
.line{margin:5px 0}.note{margin-top:8px;padding:9px 10px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0}
.dim{color:var(--muted);font-size:12px}
@media (max-width:720px){.meta{grid-template-columns:repeat(2,minmax(0,1fr));}}
</style>
</head>
<body>
<div class="wrap">
  <div class="banner">
    <h1>${toEntities(decodeUnicodeEscapes(TXT.h1))}</h1>
    <div class="sub">${toEntities(decodeUnicodeEscapes(TXT.sub))}</div>
    <div class="kv">
      <div class="pill">${toEntities(decodeUnicodeEscapes(TXT.dist) + costDist)}</div>
      <div class="pill">${toEntities(decodeUnicodeEscapes(TXT.avg) + avgCost)}</div>
      <div class="pill">${toEntities(decodeUnicodeEscapes(TXT.cap))}</div>
      <div class="pill">${toEntities(decodeUnicodeEscapes(TXT.gate))}</div>
    </div>
  </div>
  ${cardHtml}
</div>
</body>
</html>`;

  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT, html, 'utf8');
  console.log(`[generate-cards-preview] Wrote ${path.relative(ROOT, OUTPUT).replace(/\\\\/g, '/')}`);
}

main();
