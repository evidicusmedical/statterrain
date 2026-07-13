import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const y=readFileSync('../.github/workflows/county-boundary-national-build.yml','utf8');
test('workflow rejects main/master and auto-merge true',()=>{assert.match(y,/contents: write/);assert.match(y,/main\|master|main\/master/);assert.match(y,/auto_merge[^\n]+false|Never auto-merge/s);});
test('workflow declares completion only after push',()=>{assert.match(y,/Pushed: PASS/);assert.match(y,/COMPLETE — NATIONAL COUNTY BOUNDARY PARTITIONS BUILT/);assert.ok(y.indexOf('git push') < y.indexOf('COMPLETE — NATIONAL COUNTY BOUNDARY PARTITIONS BUILT'));});
