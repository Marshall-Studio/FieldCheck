import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../site/assets/csv.js';
import { suggestColumns, looksNumeric } from '../site/assets/suggest.js';

test('suggests existing work_order_id and flags blank-prone columns without inventing IDs', () => {
  const d = parseCsv('work_order_id,property,hours,cost\nWO-1,Oak,2,10\nWO-2,,3,bad\n');
  const s = suggestColumns(d);
  assert.equal(s.keyColumn, 'work_order_id');
  assert.deepEqual(s.numericColumns, ['hours']);
  assert.ok(s.requiredColumns.includes('property'));
  assert.ok(s.keyReason);
});

test('looksNumeric requires mostly finite numbers', () => {
  const good = parseCsv('n\n1\n2\n3\n');
  const mixed = parseCsv('n\n1\nbad\n3\n');
  assert.equal(looksNumeric(good, 'n'), true);
  assert.equal(looksNumeric(mixed, 'n'), false);
});

test('does not invent an ID when no safe unique column exists', () => {
  const d = parseCsv('color,size\nred,M\nred,L\n');
  const s = suggestColumns(d);
  assert.equal(s.keyColumn, undefined);
  assert.ok(s.notes.some(n => /No safe unique ID/i.test(n)));
});
