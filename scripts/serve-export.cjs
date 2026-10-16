const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '../dist');
const port = Number(process.argv[2] || 8084);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a port between 1024 and 65535.');
const mime = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.json':'application/json', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.ttf':'font/ttf', '.woff2':'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = path.resolve(root, `.${pathname}`);
    if (requested !== root && !requested.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    const candidates = requested === root ? [path.join(root,'index.html')] : [requested, requested + '.html', path.join(requested, 'index.html')];
    for (const candidate of candidates) {
      try {
        if (!(await fs.stat(candidate)).isFile()) continue;
        const content = await fs.readFile(candidate);
        response.writeHead(200, { 'Content-Type':mime[path.extname(candidate)] || 'application/octet-stream', 'Cache-Control':'no-store' });
        response.end(content); return;
      } catch (error) { if (!['ENOENT','ENOTDIR'].includes(error.code)) throw error; }
    }
    response.writeHead(404); response.end('Not found');
  } catch { response.writeHead(500); response.end('Unable to serve the exported app.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Expo production preview: http://127.0.0.1:${port}`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
