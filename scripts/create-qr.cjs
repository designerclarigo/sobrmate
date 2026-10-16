const fs = require('node:fs');
const { toQR } = require('toqr');
const { Resvg } = require('@resvg/resvg-js');
const target = process.argv[2];
if (!target) throw new Error('Usage: node scripts/create-qr.cjs exp://YOUR_LAN_ADDRESS:PORT');
const qr = toQR(target);
const n = Math.sqrt(qr.length);
let blocks = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
  if (qr[y * n + x]) blocks += `<rect x="${x + 4}" y="${y + 4}" width="1" height="1"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 8} ${n + 8}"><rect width="100%" height="100%" fill="white"/><g fill="#2D2538">${blocks}</g></svg>`;
fs.writeFileSync('docs/expo-go-qr.svg', svg);
fs.writeFileSync('docs/expo-go-qr.png', new Resvg(svg, { fitTo: { mode: 'width', value: 492 } }).render().asPng());
console.log(`Saved Expo Go QR for ${target}`);
