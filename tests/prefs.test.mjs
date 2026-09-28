import test from 'node:test';
import assert from 'node:assert/strict';
import {
  columnFingerprint,
  loadColumnPrefs,
  saveColumnPrefs,
  readPrefsStore,
  clearColumnPrefs,
  clearAllColumnPrefs,
  trimPrefsStore,
  MAX_PREF_ENTRIES
} from '../site/assets/prefs.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); }
  };
}

test('column fingerprint ignores order and case', () => {
  assert.equal(columnFingerprint(['B', 'A']), columnFingerprint(['a', 'b']));
});

test('remembers approved column prefs only for matching headers', () => {
  const storage = memoryStorage();
  saveColumnPrefs(['id', 'cost'], { keyColumn: 'id', requiredColumns: [], numericColumns: ['cost'] }, storage);
  assert.deepEqual(loadColumnPrefs(['cost', 'ID'], storage), {
    keyColumn: 'id',
    requiredColumns: [],
    numericColumns: ['cost']
  });
  assert.equal(loadColumnPrefs(['id', 'name'], storage), undefined);
});

test('clears saved preferences', () => {
  const storage = memoryStorage();
  saveColumnPrefs(['id'], { keyColumn: 'id', requiredColumns: [], numericColumns: [] }, storage);
  clearColumnPrefs(['id'], storage);
  assert.equal(loadColumnPrefs(['id'], storage), undefined);
  saveColumnPrefs(['id'], { keyColumn: 'id', requiredColumns: [], numericColumns: [] }, storage);
  clearAllColumnPrefs(storage);
  assert.equal(loadColumnPrefs(['id'], storage), undefined);
});

test('ignores corrupt prefs JSON', () => {
  assert.deepEqual(readPrefsStore('{not-json'), {});
});

test('trims remembered header layouts so storage cannot grow without bound', () => {
  const store = {};
  for (let i = 0; i < MAX_PREF_ENTRIES + 5; i++) {
    store[`cols-${i}`] = { requiredColumns: [], numericColumns: [] };
  }
  store['cols-new'] = { requiredColumns: ['id'], numericColumns: [] };
  const trimmed = trimPrefsStore(store, 'cols-new', MAX_PREF_ENTRIES);
  assert.equal(Object.keys(trimmed).length, MAX_PREF_ENTRIES);
  assert.deepEqual(trimmed['cols-new'], { requiredColumns: ['id'], numericColumns: [] });
});
