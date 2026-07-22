'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : true;
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 36, height: 36,
        borderRadius: '50%',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-glass-hover)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-glass)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
      }}
    >
      <span style={{ display: 'inline-block', transition: 'transform var(--transition-spring)', transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
