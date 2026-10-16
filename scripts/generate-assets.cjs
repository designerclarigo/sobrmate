const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require('@resvg/resvg-js');
async function main() {
  const root = path.resolve(__dirname, '..');
  for (const [name, size] of [['icon.png', 1024], ['adaptive-icon.png', 1024], ['splash-icon.png', 512], ['favicon.png', 64]]) {
    const source = name === 'splash-icon.png' ? 'splash-mark.svg' : 'komorebi-mark.svg';
    const renderer = new Resvg(fs.readFileSync(path.join(root, 'assets', source)), { fitTo: { mode: 'width', value: size } });
    fs.writeFileSync(path.join(root, 'assets', name), renderer.render().asPng());
    console.log(`${name}: ${size} x ${size}`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
