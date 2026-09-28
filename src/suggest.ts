import type { Dataset, DataRow } from './types.js';

export interface ColumnSuggestions {
  /** Existing column suggested as unique ID — never invented. */
  keyColumn?: string;
  keyReason?: string;
  numericColumns: string[];
  /** Columns that already contain at least one blank and one filled value. */
  requiredColumns: string[];
  notes: string[];
}

const KEY_NAME = /^(id|record[_ -]?id|asset[_ -]?id|work[_ -]?order[_ -]?id|sku|uuid|guid)$/i;
const KEY_SUFFIX = /(_id|Id|ID)$/;

function cell(row: DataRow, column: string): string {
  return row.values[column] ?? '';
}

function nonBlank(dataset: Dataset, column: string): string[] {
  return dataset.rows.map(r => cell(r, column).trim()).filter(Boolean);
}

/** True when most filled values look like finite numbers (safe suggestion only). */
export function looksNumeric(dataset: Dataset, column: string): boolean {
  const values = nonBlank(dataset, column);
  if (!values.length) return false;
  const numeric = values.filter(v => Number.isFinite(Number(v))).length;
  return numeric / values.length >= 0.8;
}

function uniquenessScore(dataset: Dataset, column: string): number {
  const values = nonBlank(dataset, column);
  if (!values.length) return 0;
  const unique = new Set(values).size;
  return unique / values.length;
}

/**
 * Suggest configuration from existing columns and values.
 * Never creates IDs, never invents relationships between rows.
 */
export function suggestColumns(dataset: Dataset): ColumnSuggestions {
  const notes: string[] = [];
  const numericColumns = dataset.columns.filter(c => looksNumeric(dataset, c));
  const requiredColumns = dataset.columns.filter(c => {
    const blanks = dataset.rows.filter(r => !cell(r, c).trim()).length;
    const filled = dataset.rows.length - blanks;
    return blanks > 0 && filled > 0;
  });

  let keyColumn: string | undefined;
  let keyReason: string | undefined;

  const byName = dataset.columns.find(c => KEY_NAME.test(c) || KEY_SUFFIX.test(c));
  if (byName) {
    const score = uniquenessScore(dataset, byName);
    if (score >= 0.95 || dataset.rows.length === 0) {
      keyColumn = byName;
      keyReason = `“${byName}” looks like an existing unique identifier column.`;
    } else {
      notes.push(`“${byName}” looks like an ID name, but values are not unique enough to auto-select.`);
    }
  }

  if (!keyColumn) {
    notes.push('No safe unique ID was auto-selected. Choose an existing ID column yourself before comparing.');
  }
  if (numericColumns.length) notes.push(`Suggested numeric checks: ${numericColumns.join(', ')}.`);
  if (requiredColumns.length) notes.push(`Columns with some blank values: ${requiredColumns.join(', ')}.`);

  return { keyColumn, keyReason, numericColumns, requiredColumns, notes };
}
