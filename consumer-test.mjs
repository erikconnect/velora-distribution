import { mkdtempSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const temp = mkdtempSync(join(tmpdir(), 'velora-consumer-'));
const pack = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp, '--cache', join(temp, 'cache')], {encoding:'utf8'}))[0];
assert.equal(pack.entryCount, 89);
assert.ok(pack.files.every(({path}) => ['LICENSE','README.md','package.json'].includes(path) || /^(src|dist)\/[\w.-]+\.css$/.test(path)));
execFileSync('npm', ['install', join(temp, pack.filename), '--prefix', temp, '--ignore-scripts', '--no-audit', '--no-fund', '--cache', join(temp,'cache')], {stdio:'pipe'});
const require = createRequire(join(temp, 'consumer.cjs'));
const pkg = JSON.parse(readFileSync('package.json'));
for (const [entry, path] of Object.entries(pkg.exports)) {
  assert.equal(require.resolve(entry === '.' ? '@velora/css' : '@velora/css/' + entry.slice(2)), realpathSync(resolve(temp,'node_modules/@velora/css',path)));
}
assert.equal(readdirSync(join(temp,'node_modules/@velora/css/src')).length, 43);
console.log('Isolated tarball installation and all 10 entrypoints passed.');
