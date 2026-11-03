export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'prepskm_theme_mode';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
    return saved;
  }
  return 'light'; // Default to light with white background as requested
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent('prepskm_theme_changed', { detail: { theme, isDark } }));
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
