export interface ColumnPrefs {
  keyColumn?: string;
  requiredColumns: string[];
  numericColumns: string[];
}

const STORAGE_KEY = 'fieldcheck.columnPrefs.v1';
/** Cap remembered header layouts so localStorage cannot grow without bound. */
export const MAX_PREF_ENTRIES = 20;

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

/** Keep at most MAX_PREF_ENTRIES layouts; newest key is retained, oldest keys dropped. */
export function trimPrefsStore(store: Record<string, ColumnPrefs>, newestKey: string, max = MAX_PREF_ENTRIES): Record<string, ColumnPrefs> {
  const keys = Object.keys(store);
  if (keys.length <= max) return store;
  const ordered = [newestKey, ...keys.filter(k => k !== newestKey)];
  const keep = new Set(ordered.slice(0, max));
  const next: Record<string, ColumnPrefs> = {};
  for (const key of keep) {
    const value = store[key];
    if (value) next[key] = value;
  }
  return next;
}

export function loadColumnPrefs(columns: string[], storage: Storage = localStorage): ColumnPrefs | undefined {
  const store = readPrefsStore(storage.getItem(STORAGE_KEY));
  return store[columnFingerprint(columns)];
}

export function saveColumnPrefs(columns: string[], prefs: ColumnPrefs, storage: Storage = localStorage): void {
  const key = columnFingerprint(columns);
  let store = readPrefsStore(storage.getItem(STORAGE_KEY));
  store[key] = {
    keyColumn: prefs.keyColumn,
    requiredColumns: [...prefs.requiredColumns],
    numericColumns: [...prefs.numericColumns]
  };
  store = trimPrefsStore(store, key);
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
