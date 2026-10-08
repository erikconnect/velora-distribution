import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRelease, validateProtection } from './verify-release.mjs';
const good = {repository:'erikconnect/velora-distribution',tag:'css-v1.0.0',version:'1.0.0',event:'workflow_dispatch',ref:'refs/heads/main'};
test('accept exact release identity',()=>validateRelease(good));
for (const patch of [{repository:'erikconnect/Velora'},{tag:'css-v2.0.0'},{ref:'refs/heads/evil'},{event:'pull_request'}]) {
  test('reject '+JSON.stringify(patch),()=>assert.throws(()=>validateRelease({...good,...patch})));
}
test('reject unprotected release',()=>assert.throws(()=>validateProtection({protected:false},{},{})));
test('reject missing approval',()=>assert.throws(()=>validateProtection({protected:true},{},{})));
