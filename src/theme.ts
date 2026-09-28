export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fieldcheck.theme.v1';

export function resolveTheme(stored: string | null, prefersDark: boolean): ThemeMode {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): string | null {
  try {
    return storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: ThemeMode, storage: Pick<Storage, 'setItem'>): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
}

export function applyTheme(theme: ThemeMode, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export function themeFromDocument(root: HTMLElement = document.documentElement): ThemeMode {
  return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
