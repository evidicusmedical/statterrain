import test from 'node:test';import assert from 'node:assert/strict';
import {assertZipSignature,validateHttpResponse} from '../scripts/public-data/build-county-boundaries.mjs';
test('ZIP signature validation accepts PK archives',()=>assert.equal(assertZipSignature(Buffer.from([0x50,0x4b,3,4])),true));
test('HTML response rejection catches content type and sample',()=>{assert.throws(()=>validateHttpResponse(200,'text/html','<html>'),/HTML/);assert.throws(()=>validateHttpResponse(404,'application/zip','PK'),/HTTP 404/);});
