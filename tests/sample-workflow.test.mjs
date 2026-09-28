import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCsv, toCsv } from '../site/assets/csv.js';
import { validate, compareDatasets, comparisonReportRows } from '../site/assets/analysis.js';
import { countLabel } from '../site/assets/format.js';

test('countLabel uses singular and plural correctly', () => {
  assert.equal(countLabel(0, 'row'), '0 rows');
  assert.equal(countLabel(1, 'row'), '1 row');
  assert.equal(countLabel(2, 'finding'), '2 findings');
});

test('maintenance sample matches published QA expectations', () => {
  const before = parseCsv(readFileSync('sample-data/maintenance-before.csv', 'utf8'), 'before');
  const current = parseCsv(readFileSync('sample-data/maintenance-current.csv', 'utf8'), 'current');
  const errors = parseCsv(readFileSync('sample-data/maintenance-errors.csv', 'utf8'), 'errors');

  const validation = validate(current, {
    keyColumn: 'work_order_id',
    requiredColumns: ['property', 'status'],
    numericColumns: ['cost', 'hours']
  });
  assert.deepEqual(
    validation.issues.map(i => [i.code, i.column, i.value]),
    [
      ['MISSING_REQUIRED', 'property', ''],
      ['INVALID_NUMBER', 'cost', 'unknown']
    ]
  );

  const comparison = compareDatasets(before, current, 'work_order_id');
  assert.deepEqual(comparison.added.map(x => x.key), ['WO-1006', 'WO-1007']);
  assert.deepEqual(comparison.removed.map(x => x.key), ['WO-1004']);
  assert.equal(comparison.changed.length, 2);
  assert.equal(comparison.unchangedCount, 2);

  const issuesCsv = toCsv([
    ['Line', 'Issue', 'Column', 'Value', 'Description'],
    ...validation.issues.map(i => [String(i.row), i.code.replaceAll('_', ' '), i.column, i.value, i.message])
  ]);
  assert.match(issuesCsv, /MISSING REQUIRED/);
  assert.match(issuesCsv, /unknown/);

  const compareCsv = toCsv(comparisonReportRows(comparison));
  assert.match(compareCsv, /WO-1006/);
  assert.match(compareCsv, /WO-1004/);
  assert.match(compareCsv, /Open/);
  assert.match(compareCsv, /Closed/);

  assert.throws(
    () => compareDatasets(before, errors, 'work_order_id'),
    /duplicate identifier "WO-1002"/
  );
});
