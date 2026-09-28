import type { Dataset, DataRow } from './types.js';

export class CsvError extends Error { constructor(message: string) { super(message); this.name = 'CsvError'; } }
export const LIMITS = { bytes: 8 * 1024 * 1024, rows: 30000, columns: 80 } as const;

interface ParsedRecord { fields: string[]; line: number }

/** RFC-4180-style comma-separated parser, including escaped quotes and newlines in quoted cells. */
export function parseCsv(text: string, name = 'dataset.csv'): Dataset {
  if (new TextEncoder().encode(text).byteLength > LIMITS.bytes) throw new CsvError('File exceeds the 8 MB V1 limit.');
  if (text.startsWith('\uFEFF')) text = text.slice(1);
  const records: ParsedRecord[] = [];
  let fields: string[] = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;
  let line = 1;
  let rowStart = 1;
  const commit = () => {
    fields.push(field);
    if (fields.some(x => x.trim() !== '')) records.push({ fields, line: rowStart });
    fields = []; field = ''; rowStart = line;
    if (records.length > LIMITS.rows + 1) throw new CsvError(`File exceeds the ${LIMITS.rows.toLocaleString()}-row V1 limit.`);
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; afterQuote = true; }
      else if (ch === '\r' && next === '\n') { field += '\n'; i++; line++; }
      else { field += ch; if (ch === '\r' || ch === '\n') line++; }
    } else if (afterQuote) {
      if (ch === ',') { fields.push(field); field = ''; afterQuote = false; }
      else if (ch === '\r' || ch === '\n') {
        if (ch === '\r' && next === '\n') i++;
        line++; commit(); afterQuote = false;
      } else if (ch === ' ' || ch === '\t') { /* allow whitespace after quoted fields */ }
      else throw new CsvError(`Unexpected character after closing quote at line ${line}.`);
    } else {
      if (ch === '"') {
        if (field !== '') throw new CsvError(`Unexpected quote at line ${line}.`);
        inQuotes = true;
      } else if (ch === ',') { fields.push(field); field = ''; }
      else if (ch === '\r' || ch === '\n') {
        if (ch === '\r' && next === '\n') i++;
        line++; commit();
      } else field += ch;
    }
  }
  if (inQuotes) throw new CsvError(`Unclosed quoted field beginning at line ${rowStart}.`);
  if (field !== '' || fields.length > 0 || afterQuote) commit();
  if (!records.length) throw new CsvError('File is empty. Choose a CSV with a header row.');

  const header = records[0]!.fields.map(s => s.trim());
  if (header.length > LIMITS.columns) throw new CsvError(`File exceeds the ${LIMITS.columns}-column V1 limit.`);
  if (header.some(h => !h)) throw new CsvError('The header row contains a blank column name.');
  const lower = header.map(h => h.toLocaleLowerCase());
  if (new Set(lower).size !== lower.length) throw new CsvError('The header row contains duplicate column names (ignoring case).');

  const rows: DataRow[] = [];
  for (const record of records.slice(1)) {
    if (record.fields.length !== header.length) throw new CsvError(`Line ${record.line}: found ${record.fields.length} columns; expected ${header.length}.`);
    const values: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) values[header[i]!] = record.fields[i]!;
    rows.push({ line: record.line, values });
  }
  return { name, columns: header, rows };
}

/** Protect exports against spreadsheet-formula injection. This does not modify the imported dataset. */
export function safeCsvCell(value: string | number): string {
  let s = String(value);
  // Neutralize leading formula markers and tab/CR control prefixes used by some spreadsheet apps.
  if (/^[\s\u0000]*[=+\-@\t\r]/.test(s) || s.includes('\u0000')) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}
export function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map(row => row.map(safeCsvCell).join(',')).join('\r\n') + '\r\n';
}
