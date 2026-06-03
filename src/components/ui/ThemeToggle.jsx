import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

export const ThemeToggle = ({ className = '' }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-[#171a21] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
      aria-label="Toggle color theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
