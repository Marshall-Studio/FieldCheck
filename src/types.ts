export interface DataRow {
  /** One-indexed physical line number at which the CSV record begins. */
  line: number;
  values: Record<string, string>;
}

export interface Dataset {
  name: string;
  columns: string[];
  rows: DataRow[];
}

export type IssueCode = 'MISSING_REQUIRED' | 'DUPLICATE_KEY' | 'DUPLICATE_ROW' | 'INVALID_NUMBER';
export interface Issue {
  code: IssueCode;
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ValidationOptions {
  keyColumn?: string;
  requiredColumns?: string[];
  numericColumns?: string[];
}
export interface ValidationResult {
  rowCount: number;
  issues: Issue[];
  issueRows: number;
}

export interface CellDifference { column: string; before: string; after: string }
export interface ComparisonRow {
  key: string;
  beforeLine?: number;
  afterLine?: number;
  differences: CellDifference[];
}
export interface ComparisonResult {
  keyColumn: string;
  added: ComparisonRow[];
  removed: ComparisonRow[];
  changed: ComparisonRow[];
  unchangedCount: number;
}
