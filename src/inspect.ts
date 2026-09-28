import type { Dataset, DataRow, Issue } from './types.js';

export const PREVIEW_PAGE_SIZE = 25;

export interface FindingContext {
  fileName: string;
  csvLine: number;
  dataRowNumber?: number;
  recordId?: string;
  column: string;
  value: string;
}

export interface HighlightTarget {
  csvLine: number;
  column?: string;
  recordId?: string;
}

/** 1-based position among parsed data rows (not the physical CSV line). */
export function dataRowNumberForLine(dataset: Dataset, csvLine: number): number | undefined {
  const index = dataset.rows.findIndex(row => row.line === csvLine);
  return index >= 0 ? index + 1 : undefined;
}

export function recordIdForLine(dataset: Dataset, csvLine: number, keyColumn?: string): string | undefined {
  if (!keyColumn) return undefined;
  const row = dataset.rows.find(r => r.line === csvLine);
  if (!row) return undefined;
  const id = (row.values[keyColumn] ?? '').trim();
  return id || undefined;
}

export function findingContext(dataset: Dataset, issue: Issue, keyColumn?: string): FindingContext {
  return {
    fileName: dataset.name,
    csvLine: issue.row,
    dataRowNumber: dataRowNumberForLine(dataset, issue.row),
    recordId: recordIdForLine(dataset, issue.row, keyColumn),
    column: issue.column,
    value: issue.value
  };
}

export function findRowByRecordId(dataset: Dataset, keyColumn: string, recordId: string): DataRow | undefined {
  const wanted = recordId.trim();
  return dataset.rows.find(row => (row.values[keyColumn] ?? '').trim() === wanted);
}

export function filterDatasetRows(dataset: Dataset, query: string): DataRow[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return dataset.rows;
  return dataset.rows.filter(row => {
    if (String(row.line).includes(q)) return true;
    return dataset.columns.some(column => (row.values[column] ?? '').toLocaleLowerCase().includes(q));
  });
}

export function pageCount(total: number, pageSize = PREVIEW_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageForIndex(index: number, pageSize = PREVIEW_PAGE_SIZE): number {
  if (index < 0) return 1;
  return Math.floor(index / pageSize) + 1;
}

export function slicePage<T>(items: T[], page: number, pageSize = PREVIEW_PAGE_SIZE): T[] {
  const safePage = Math.min(Math.max(1, page), pageCount(items.length, pageSize));
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
