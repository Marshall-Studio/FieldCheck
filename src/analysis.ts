import type { Dataset, Issue, ValidationOptions, ValidationResult, ComparisonResult, ComparisonRow, DataRow } from './types.js';

function header(dataset: Dataset, desired: string): string | undefined {
  return dataset.columns.find(c => c.toLocaleLowerCase() === desired.toLocaleLowerCase());
}
function requireHeader(dataset: Dataset, desired: string): string {
  const column = header(dataset, desired);
  if (!column) throw new Error(`${dataset.name} is missing column "${desired}".`);
  return column;
}
function val(row: DataRow, column: string): string { return row.values[column] ?? ''; }

export function validate(dataset: Dataset, options: ValidationOptions = {}): ValidationResult {
  const required = [...new Set(options.requiredColumns ?? [])].map(c => requireHeader(dataset, c));
  const numeric = [...new Set(options.numericColumns ?? [])].map(c => requireHeader(dataset, c));
  const key = options.keyColumn ? requireHeader(dataset, options.keyColumn) : undefined;
  const issues: Issue[] = [];
  const seenIds = new Map<string, number>();
  const seenRows = new Map<string, number>();
  for (const row of dataset.rows) {
    if (key) {
      const id = val(row, key).trim();
      if (!id) issues.push({ code: 'MISSING_REQUIRED', row: row.line, column: key, value: '', message: 'Missing record identifier.' });
      else if (seenIds.has(id)) issues.push({ code: 'DUPLICATE_KEY', row: row.line, column: key, value: id, message: `Identifier repeats a record beginning on line ${seenIds.get(id)}.` });
      else seenIds.set(id, row.line);
    }
    for (const col of required) {
      if (col === key) continue;
      if (!val(row, col).trim()) issues.push({ code: 'MISSING_REQUIRED', row: row.line, column: col, value: '', message: 'Required value is blank.' });
    }
    for (const col of numeric) {
      const raw = val(row, col).trim();
      if (raw && !Number.isFinite(Number(raw))) issues.push({ code: 'INVALID_NUMBER', row: row.line, column: col, value: raw, message: 'This value is not a usable number (for example, text like “unknown” fails a numeric check).' });
    }
    const signature = JSON.stringify(dataset.columns.map(c => val(row, c)));
    if (seenRows.has(signature)) issues.push({ code: 'DUPLICATE_ROW', row: row.line, column: '(whole row)', value: '', message: `Entire row repeats line ${seenRows.get(signature)}.` });
    else seenRows.set(signature, row.line);
  }
  return { rowCount: dataset.rows.length, issues, issueRows: new Set(issues.map(x => x.row)).size };
}

function indexRows(dataset: Dataset, key: string): Map<string, DataRow> {
  const index = new Map<string, DataRow>();
  for (const row of dataset.rows) {
    const id = val(row, key).trim();
    if (!id) throw new Error(`${dataset.name} has a blank identifier on line ${row.line}; fix it before comparing.`);
    if (index.has(id)) throw new Error(`${dataset.name} has duplicate identifier "${id}" on lines ${index.get(id)!.line} and ${row.line}; comparison would be ambiguous.`);
    index.set(id, row);
  }
  return index;
}

export function compareDatasets(before: Dataset, after: Dataset, desiredKey: string): ComparisonResult {
  const keyBefore = requireHeader(before, desiredKey);
  const keyAfter = requireHeader(after, desiredKey);
  const beforeIndex = indexRows(before, keyBefore);
  const afterIndex = indexRows(after, keyAfter);
  const columns = new Map<string, { before?: string; after?: string; display: string }>();
  for (const c of before.columns) columns.set(c.toLocaleLowerCase(), { before: c, display: c });
  for (const c of after.columns) {
    const norm = c.toLocaleLowerCase();
    const existing = columns.get(norm);
    if (existing) { existing.after = c; }
    else columns.set(norm, { after: c, display: c });
  }
  columns.delete(desiredKey.toLocaleLowerCase());
  const result: ComparisonResult = { keyColumn: desiredKey, added: [], removed: [], changed: [], unchangedCount: 0 };
  for (const [id, next] of afterIndex) {
    const prev = beforeIndex.get(id);
    if (!prev) { result.added.push({ key: id, afterLine: next.line, differences: [] }); continue; }
    const differences = [...columns.values()].flatMap(c => {
      const a = c.before ? val(prev, c.before) : '';
      const b = c.after ? val(next, c.after) : '';
      return a === b ? [] : [{ column: c.display, before: a, after: b }];
    });
    if (differences.length) result.changed.push({ key: id, beforeLine: prev.line, afterLine: next.line, differences });
    else result.unchangedCount++;
  }
  for (const [id, prev] of beforeIndex) {
    if (!afterIndex.has(id)) result.removed.push({ key: id, beforeLine: prev.line, differences: [] });
  }
  return result;
}

export function comparisonReportRows(result: ComparisonResult): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [['Change Type', result.keyColumn, 'Column', 'Before', 'After', 'Baseline Line', 'Current Line']];
  function add(kind: string, items: ComparisonRow[]): void {
    for (const item of items) {
      if (!item.differences.length) rows.push([kind, item.key, '', '', '', item.beforeLine ?? '', item.afterLine ?? '']);
      for (const diff of item.differences) rows.push([kind, item.key, diff.column, diff.before, diff.after, item.beforeLine ?? '', item.afterLine ?? '']);
    }
  }
  add('Added', result.added); add('Removed', result.removed); add('Changed', result.changed);
  return rows;
}
