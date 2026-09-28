import test from 'node:test';
import assert from 'node:assert/strict';
import { columnFingerprint, loadColumnPrefs, saveColumnPrefs, readPrefsStore } from '../site/assets/prefs.js';

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

test('ignores corrupt prefs JSON', () => {
  assert.deepEqual(readPrefsStore('{not-json'), {});
});
