import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  setTheme: (theme: ThemeMode) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
  },

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const storedTheme = (localStorage.getItem('theme') as ThemeMode) || 'light';
      set({ theme: storedTheme });
      applyTheme(storedTheme);
    }
  },
}));

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
