import test from 'node:test';
import assert from 'node:assert/strict';
import doc, { VECTORS, CONSTANTS, SUPPLEMENTARY, REVISION } from './index.js';

// This repo ships no encoder, so it cannot test encoding. What it CAN do is
// guarantee the fixtures themselves stay well-formed — a corrupted vectors.json
// would silently break every downstream implementation at once.

test('the document is well-formed', () => {
  assert.equal(doc.protocol, 'placepin');
  assert.equal(REVISION, 'v5-draft');
  assert.equal(VECTORS.length, 10);
});

test('constants match the specification', () => {
  assert.equal(CONSTANTS.alphabet, '0123456789BCDFGHJKMNPQRSTVWXYZ');
  assert.equal(CONSTANTS.alphabet.length, 30);
  assert.equal(CONSTANTS.base, 30);
  assert.equal(CONSTANTS.factor, 27000);
  assert.equal(CONSTANTS.earthRadiusM, 6371000);
  assert.equal(CONSTANTS.datum, 'WGS84');

  // §02: no vowels, so a code can never spell a word. No L.
  for (const c of 'AEIOUL') {
    assert.ok(!CONSTANTS.alphabet.includes(c), `${c} must not be in the alphabet`);
  }
});

test('every vector is shaped correctly', () => {
  for (const v of VECTORS) {
    assert.match(v.code, /^[0-9BCDFGHJKMNPQRSTVWXYZ]{3}-[0-9BCDFGHJKMNPQRSTVWXYZ]{3}-[0-9BCDFGHJKMNPQRSTVWXYZ]{3}$/,
      `${v.code} must be three blocks of three from the alphabet`);
    assert.ok(Number.isFinite(v.input.lat) && Number.isFinite(v.input.lng), 'input must be numeric');
    assert.ok(v.centre.lat >= -90 && v.centre.lat <= 90, `${v.code} centre latitude out of range`);
    assert.ok(v.centre.lng >= -180 && v.centre.lng < 180, `${v.code} centre longitude must be in [-180, 180)`);
  }
});

test('codes are unique', () => {
  assert.equal(new Set(VECTORS.map((v) => v.code)).size, VECTORS.length);
});

test('the supplementary MUSTs are all asserted', () => {
  assert.equal(SUPPLEMENTARY.antimeridian.lng180EqualsMinus180, true);
  assert.equal(SUPPLEMENTARY.suffixContainment.holds, true);
  assert.equal(SUPPLEMENTARY.prefixUnrelated.holds, true);
  assert.equal(SUPPLEMENTARY.partitionInvariant.totalEqualsFactor, true);
});

test('coverage includes the awkward places', () => {
  const inputs = VECTORS.map((v) => `${v.input.lat},${v.input.lng}`);
  assert.ok(inputs.includes('0,0'), 'null island');
  assert.ok(inputs.includes('90,0'), 'north pole');
  assert.ok(inputs.includes('-90,0'), 'south pole');
  assert.ok(inputs.includes('0,180'), 'antimeridian');
});
