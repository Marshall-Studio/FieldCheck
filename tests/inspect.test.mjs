import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCsv } from '../site/assets/csv.js';
import {
  findingContext,
  filterDatasetRows,
  pageForIndex,
  pageCount,
  slicePage,
  findRowByRecordId,
  PREVIEW_PAGE_SIZE
} from '../site/assets/inspect.js';
import { validate } from '../site/assets/analysis.js';

test('findingContext includes file, record ID, CSV line, and data row', () => {
  const current = parseCsv(readFileSync('sample-data/maintenance-current.csv', 'utf8'), 'maintenance-current.csv');
  const result = validate(current, {
    keyColumn: 'work_order_id',
    requiredColumns: ['property', 'status'],
    numericColumns: ['cost', 'hours']
  });
  assert.equal(result.issues.length, 2);
  const first = result.issues[0];
  assert.ok(first);
  const ctx = findingContext(current, first, 'work_order_id');
  assert.equal(ctx.fileName, 'maintenance-current.csv');
  assert.equal(ctx.recordId, 'WO-1007');
  assert.equal(ctx.csvLine, 7);
  assert.equal(ctx.dataRowNumber, 6);
  assert.equal(ctx.column, 'property');
});

test('preview pagination and search locate WO-1007 without loading every row at once', () => {
  const rows = Array.from({ length: 60 }, (_, i) => `WO-${i + 1},value`);
  const dataset = parseCsv(['id,name', ...rows].join('\n'), 'big.csv');
  assert.equal(pageCount(dataset.rows.length), Math.ceil(60 / PREVIEW_PAGE_SIZE));
  const matches = filterDatasetRows(dataset, 'WO-40');
  assert.equal(matches.length, 1);
  const index = dataset.rows.findIndex(r => (r.values.id ?? '') === 'WO-40');
  assert.equal(pageForIndex(index), 2);
  assert.equal(slicePage(dataset.rows, 2).length, PREVIEW_PAGE_SIZE);
  assert.equal(findRowByRecordId(dataset, 'id', 'WO-40')?.values.name, 'value');
});
