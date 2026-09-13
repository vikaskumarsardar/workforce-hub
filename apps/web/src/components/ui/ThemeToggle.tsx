'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title={`Theme: ${theme}`}
    >
      {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />}
      {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" aria-hidden="true" />}
      {theme === 'system' && <Laptop className="w-4 h-4 text-slate-400" aria-hidden="true" />}
    </button>
  );
};
