import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const pkg = JSON.parse(readFileSync('package.json'));
const manifest = JSON.parse(readFileSync('distribution-manifest.json'));
assert.equal(pkg.version, manifest.version);
assert.equal(pkg.repository.url, 'https://github.com/erikconnect/velora-distribution.git');

let count = 0;
for (const folder of ['src', 'dist']) {
  const expected = manifest[folder];
  assert.deepEqual(readdirSync(folder).sort(), Object.keys(expected).sort(), `${folder}/ does not match the manifest`);
  for (const [name, hash] of Object.entries(expected)) {
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
    count++;
  }
}
assert.ok(!readFileSync('dist/motion-core.min.css', 'utf8').includes('@import'), 'The CDN bundle must not chain @import');
for (const entry of [...Object.values(pkg.exports), pkg.main, pkg.unpkg, pkg.jsdelivr]) assert.ok(existsSync(entry), entry);
console.log(`${count} CSS hashes, imports and package entrypoints verified. Limited signature scan passed.`);
