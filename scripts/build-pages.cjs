'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'eclipse');
const output = path.join(root, 'dist');
const gameOutput = path.join(output, 'eclipse');

// Only this generated directory is replaced. The earlier FPS project stays intact.
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(gameOutput, { recursive: true });
// Keep the same URLs for branch publishing and Actions publishing.
fs.copyFileSync(path.join(root, 'index.html'), path.join(output, 'index.html'));
for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  if (!['team-showcase.js', 'team-showcase.css'].includes(entry.name) && entry.isFile() && (entry.name === 'index.html' || /\.(js|css)$/.test(entry.name))) {
    fs.copyFileSync(path.join(source, entry.name), path.join(gameOutput, entry.name));
  }
}
const media = new Set(['.mp4', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.wav', '.mp3', '.ogg', '.glb', '.gltf', '.bin', '.woff', '.woff2']);
fs.cpSync(path.join(source, 'assets'), path.join(gameOutput, 'assets'), {
  recursive: true,
  filter(file) {
    return fs.statSync(file).isDirectory() || media.has(path.extname(file)) || file === path.join(source, 'assets/models/manifest.json');
  }
});
fs.cpSync(path.join(source, 'vendor'), path.join(gameOutput, 'vendor'), { recursive: true });
fs.writeFileSync(path.join(output, '.nojekyll'), '');

// Confirm that the exported homepage resolves its scripts and styles below a repository path.
for (const dir of [output, gameOutput]) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:#|data:|https?:)/.test(ref)) continue;
    if (ref.startsWith('/') || !fs.existsSync(path.join(dir, ref.split(/[?#]/)[0]))) throw new Error(`Invalid Pages entry reference: ${ref}`);
  }
}
let size = 0, count = 0;
function measure(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) measure(file);
    else { size += fs.statSync(file).size; count++; }
  }
}
measure(output);
console.log(`星蚀契约：群星回响 → dist/ · ${count} files · ${(size / 1024 / 1024).toFixed(1)} MiB`);
