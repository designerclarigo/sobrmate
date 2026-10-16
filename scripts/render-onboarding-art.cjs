// Render the actual native SVG illustrations for asset generation and visual QA.
// This previews vector artwork; it does not simulate or screenshot the app UI.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/onboarding');
fs.mkdirSync(output, { recursive: true });
const svgRoot = ({ accessible, accessibilityElementsHidden, importantForAccessibility, children, ...props }) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', ...props }, children);
const svgElements = { __esModule: true, default: svgRoot, Circle: 'circle', Defs: 'defs', Ellipse: 'ellipse', G: 'g', LinearGradient: 'linearGradient', Path: 'path', Rect: 'rect', Stop: 'stop', Text: 'text' };
const cache = new Map();
let renderPrefix = 'art';
let renderId = 0;
// These source components only need useId; serialize their SVG tree without a web renderer.
const artworkReact = { ...React, useId: () => `${renderPrefix}${renderId++}` };
const svgAttributes = {
  strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin',
  strokeDasharray: 'stroke-dasharray', fontSize: 'font-size', fontWeight: 'font-weight',
  fontFamily: 'font-family', letterSpacing: 'letter-spacing', textAnchor: 'text-anchor',
  stopColor: 'stop-color', stopOpacity: 'stop-opacity',
};
const families = {
  Inter_400Regular: 'Inter', Inter_500Medium: 'Inter', Inter_600SemiBold: 'Inter',
  DMSerifDisplay_400Regular: 'DM Serif Display',
};
const escapeXml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
function serializeSvg(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(serializeSvg).join('');
  if (typeof node === 'string' || typeof node === 'number') return escapeXml(node);
  if (!React.isValidElement(node)) throw new Error('Artwork contains an unsupported SVG element.');
  if (node.type === React.Fragment) return serializeSvg(node.props.children);
  if (typeof node.type === 'function') return serializeSvg(node.type(node.props));
  if (typeof node.type !== 'string' || !Object.values(svgElements).includes(node.type) && node.type !== 'svg') throw new Error('Artwork contains an unsupported SVG tag.');
  const attributes = Object.entries(node.props).filter(([key, value]) => key !== 'children' && value != null).map(([key, value]) => {
    const attribute = svgAttributes[key] || key;
    return ` ${attribute}="${escapeXml(key === 'fontFamily' ? families[value] || value : value)}"`;
  }).join('');
  return `<${node.type}${attributes}>${serializeSvg(node.props.children)}</${node.type}>`;
}
function renderSvg(component, prefix) {
  renderPrefix = prefix; renderId = 0;
  return serializeSvg(component);
}
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  const localRequire = name => {
    if (name === 'react') return artworkReact;
    if (name === 'react-native-svg') return svgElements;
    if (name === 'react-native') return { Platform: { select: options => options.default } };
    if (!name.startsWith('.')) return require(name);
    const resolved = path.resolve(path.dirname(file), name);
    const target = ['.ts', '.tsx'].map(ext => resolved + ext).find(fs.existsSync);
    if (!target || !target.startsWith(root + path.sep)) throw new Error(`Cannot resolve local artwork module ${name}`);
    return load(target);
  };
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const { BrandMark, OnboardingIllustration } = load(path.join(root, 'src/onboarding/OnboardingIllustration.tsx'));
const fontFiles = [
  'inter/400Regular/Inter_400Regular.ttf', 'inter/500Medium/Inter_500Medium.ttf',
  'dm-serif-display/400Regular/DMSerifDisplay_400Regular.ttf',
].map(file => path.join(root, 'node_modules/@expo-google-fonts', file));
const render = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' } }).render().asPng();
const mark = renderSvg(React.createElement(BrandMark, { size: 512 }), 'brand');
fs.writeFileSync(path.join(root, 'assets/splash-mark.svg'), mark);
fs.writeFileSync(path.join(root, 'assets/splash-icon.png'), render(mark, 512));
const names = ['01-fresh-beginning', '02-visible-progress', '03-your-journey'];
const labels = ['A fresh beginning', 'Visible progress', 'Your journey'];
const illustrations = names.map((name, step) => {
  const svg = renderSvg(React.createElement(OnboardingIllustration, { step }), `step${step}`);
  fs.writeFileSync(path.join(output, `${name}.svg`), svg);
  fs.writeFileSync(path.join(output, `${name}.png`), render(svg, 684));
  return svg;
});
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1026" height="330" viewBox="0 0 1026 330"><rect width="1026" height="330" fill="#FAF9F6"/>${illustrations.map((svg, index) => `<g transform="translate(${index * 342} 0)">${svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g><text x="${index * 342 + 171}" y="311" text-anchor="middle" font-family="DM Serif Display" font-size="18" fill="#24232B">${labels[index]}</text>`).join('')}</svg>`;
fs.writeFileSync(path.join(output, 'illustrations.svg'), sheet);
fs.writeFileSync(path.join(output, 'illustrations.png'), render(sheet, 1539));
console.log('Rendered three onboarding illustrations and the native splash mark.');
