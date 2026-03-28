import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'sweetcms-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(resolved: ResolvedTheme) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

interface ThemeStore {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  initTheme: () => () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  resolvedTheme: 'light',

  setTheme(t: Theme) {
    localStorage.setItem(STORAGE_KEY, t);
    const resolved: ResolvedTheme =
      t === 'system' ? getSystemTheme() : t;
    applyTheme(resolved);
    set({ theme: t, resolvedTheme: resolved });
  },

  initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme: Theme = stored ?? 'light';
    const resolved: ResolvedTheme =
      theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    function onChange() {
      const { theme: current } = get();
      if (current === 'system') {
        const r = getSystemTheme();
        applyTheme(r);
        set({ resolvedTheme: r });
      }
    }
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  },
}));
