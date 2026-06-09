'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-input p-2 cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
