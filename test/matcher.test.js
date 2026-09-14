// Run with `npm test`. Covers the matching rules the content script relies on.
const assert = require('node:assert/strict');
const { buildMatcher } = require('../src/content/matcher.js');

const m = buildMatcher(['learning', 'machine learning', 'API', 'RAG', 'embedding', 'CI/CD', 'LoRA']);
const keys = (text, seen = new Set()) => m.find(text, seen).map((x) => x.key);

// Longest term wins.
assert.deepEqual(keys('Intro to machine learning'), ['machine learning']);
// Word boundaries: no matches inside other words.
assert.deepEqual(keys('aptitude apiary rapid dragging'), []);
// Capitalized terms need exact case or ALL CAPS; lowercase terms match any case.
assert.deepEqual(keys('an old rag and an api'), []);
assert.deepEqual(keys('RAG and API and LORA and Embedding'), ['RAG', 'API', 'LoRA', 'Embedding'].map((k) => k.toLowerCase()));
// Plurals and punctuation-heavy terms.
assert.deepEqual(m.find('Two APIs.', new Set()), [{ index: 4, length: 4, key: 'api' }]);
assert.deepEqual(keys('our CI/CD pipeline'), ['ci/cd']);
// First match only: repeats in the same text and terms already seen elsewhere are skipped.
assert.deepEqual(keys('API API embedding', new Set(['embedding'])), ['api']);

console.log('matcher tests passed');
