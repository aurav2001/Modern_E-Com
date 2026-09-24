const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'products', 'whatsapp');
const files = fs.readdirSync(dir);

const cards = files.map((f, i) => {
  const enc = encodeURIComponent(f);
  return `  <div class="card">
    <div class="num">#${i + 1}</div>
    <img src="/products/whatsapp/${enc}" alt="${f}" />
    <div class="name">${f}</div>
  </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>WhatsApp Product Images Catalog</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
  h1 { text-align: center; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .card { background: #1e293b; border-radius: 10px; padding: 12px; border: 1px solid #334155; }
  .num { font-weight: bold; color: #38bdf8; font-size: 14px; margin-bottom: 6px; }
  img { width: 100%; height: 220px; object-fit: contain; background: #fff; border-radius: 6px; }
  .name { font-size: 11px; color: #94a3b8; margin-top: 8px; word-break: break-all; }
</style>
</head>
<body>
  <h1>WhatsApp Product Images (${files.length} items)</h1>
  <div class="grid">
${cards}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'gallery.html'), html);
console.log('Successfully written public/gallery.html');
