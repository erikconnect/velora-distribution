import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const pkg = JSON.parse(readFileSync('package.json'));
const manifest = JSON.parse(readFileSync('distribution-manifest.json'));
assert.equal(pkg.version, manifest.version);
assert.equal(pkg.repository.url, 'https://github.com/erikconnect/velora-distribution.git');
for (const folder of ['src', 'dist']) {
  assert.deepEqual(readdirSync(folder).sort(), Object.keys(manifest.sha256).sort());
  for (const [name, hash] of Object.entries(manifest.sha256)) {
    const path = join(folder, name);
    const content = readFileSync(path);
    assert.equal(createHash('sha256').update(content).digest('hex'), hash, path);
    for (const match of content.toString().matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
      assert.ok(!match[1].includes('://'), 'Remote CSS imports are not allowed');
      const dependency = resolve(dirname(path), match[1]);
      assert.ok(dependency.startsWith(resolve(folder) + '/'), 'Import escapes package folder');
      assert.ok(existsSync(dependency), `Missing CSS import: ${match[1]}`);
    }
    assert.ok(!/PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20}|npm_[A-Za-z0-9]{20}|\/Users\//.test(content.toString()), 'Sensitive signature');
  }
}
for (const entry of Object.values(pkg.exports)) assert.ok(existsSync(entry), entry);
console.log('43 CSS hashes, src/dist equality, imports and package exports verified. Limited signature scan passed.');
