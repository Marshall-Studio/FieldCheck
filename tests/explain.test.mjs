import test from 'node:test';
import assert from 'node:assert/strict';
import { whyIssueMatters, plainIssueTitle, plainComparisonSummary } from '../site/assets/explain.js';

test('explains why common findings matter in plain language', () => {
  assert.match(whyIssueMatters('INVALID_NUMBER'), /numeric|number/i);
  assert.match(whyIssueMatters('DUPLICATE_KEY'), /ambiguous/i);
  assert.equal(
    plainIssueTitle({ code: 'MISSING_REQUIRED', row: 7, column: 'property', value: '', message: 'Required value is blank.' }),
    'Missing property'
  );
});

test('summarizes comparison counts for the UI', () => {
  const text = plainComparisonSummary({
    keyColumn: 'work_order_id',
    added: [{ key: 'A', differences: [] }],
    removed: [],
    changed: [{ key: 'B', differences: [{ column: 'status', before: 'Open', after: 'Closed' }] }],
    unchangedCount: 2
  });
  assert.match(text.headline, /work_order_id/);
  assert.match(text.detail, /1 added/);
  assert.match(text.detail, /1 changed/);
});
