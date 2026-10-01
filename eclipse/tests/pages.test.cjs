const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const entry = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('branch-published homepage opens the card game and preserves query and chapter', () => {
  const script = entry.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [from, expected] of [
    ['https://example.github.io/eclipse-covenant/', 'https://example.github.io/eclipse-covenant/eclipse/'],
    ['https://example.github.io/eclipse-covenant/index.html?qa=1#adventure', 'https://example.github.io/eclipse-covenant/eclipse/?qa=1#adventure'],
    ['https://game.example.com/#team', 'https://game.example.com/eclipse/#team']
  ]) {
    const current = new URL(from);
    let actual;
    vm.runInNewContext(script, { URL, window: { location: { href: current.href, search: current.search, hash: current.hash, replace(url) { actual = url; } } } });
    assert.equal(actual, expected);
  }
  assert.ok(!entry.includes('TRANSPORT SHIP'));
  assert.ok(fs.existsSync(path.join(root, '.nojekyll')));
  assert.match(fs.readFileSync(path.join(root, 'eclipse/index.html'), 'utf8'), /群星回响/);
});

test('archived shooter entry resolves its original script without replacing the card game', () => {
  const archive = fs.readFileSync(path.join(root, 'legacy/transport-ship.html'), 'utf8');
  const script = archive.match(/<script type="module" src="([^"]+)"/)[1].split('?')[0];
  assert.ok(fs.existsSync(path.resolve(root, 'legacy', script)));
});
