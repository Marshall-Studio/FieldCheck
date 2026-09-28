export interface ColumnPrefs {
  keyColumn?: string;
  requiredColumns: string[];
  numericColumns: string[];
}

const STORAGE_KEY = 'fieldcheck.columnPrefs.v1';

/** Stable fingerprint of a column set so prefs only restore for the same headers. */
export function columnFingerprint(columns: string[]): string {
  return columns.map(c => c.trim().toLocaleLowerCase()).filter(Boolean).sort().join('|');
}

export function readPrefsStore(raw: string | null): Record<string, ColumnPrefs> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, ColumnPrefs>;
  } catch {
    return {};
  }
}

export function writePrefsStore(store: Record<string, ColumnPrefs>): string {
  return JSON.stringify(store);
}

export function loadColumnPrefs(columns: string[], storage: Storage = localStorage): ColumnPrefs | undefined {
  const store = readPrefsStore(storage.getItem(STORAGE_KEY));
  return store[columnFingerprint(columns)];
}

export function saveColumnPrefs(columns: string[], prefs: ColumnPrefs, storage: Storage = localStorage): void {
  const store = readPrefsStore(storage.getItem(STORAGE_KEY));
  store[columnFingerprint(columns)] = {
    keyColumn: prefs.keyColumn,
    requiredColumns: [...prefs.requiredColumns],
    numericColumns: [...prefs.numericColumns]
  };
  storage.setItem(STORAGE_KEY, writePrefsStore(store));
}

export function clearColumnPrefs(columns: string[], storage: Storage = localStorage): void {
  const store = readPrefsStore(storage.getItem(STORAGE_KEY));
  delete store[columnFingerprint(columns)];
  if (Object.keys(store).length) storage.setItem(STORAGE_KEY, writePrefsStore(store));
  else storage.removeItem(STORAGE_KEY);
}

export function clearAllColumnPrefs(storage: Storage = localStorage): void {
  storage.removeItem(STORAGE_KEY);
}
