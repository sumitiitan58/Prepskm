export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'prepskm_theme_mode';

let memoryTheme: ThemeMode = 'light';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
      return saved;
    }
  } catch (e) {
    return memoryTheme;
  }
  return 'light'; // Default to light with white background as requested
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  let isDark = theme === 'dark';
  try {
    if (theme === 'system' && window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch (e) {
    isDark = false;
  }

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    if (document.body) {
      document.body.style.backgroundColor = '#020617';
      document.body.style.color = '#f1f5f9';
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (document.body) {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#0f172a';
    }
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    memoryTheme = theme;
  }

  try {
    window.dispatchEvent(new CustomEvent('prepskm_theme_changed', { detail: { theme, isDark } }));
  } catch (e) {}
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
