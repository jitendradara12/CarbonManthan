import { initApp } from './router/index.js';

function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = savedTheme;
  toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  toggle.onclick = () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'dark' ? '☀️' : '🌙';
  };
}

initTheme();
initApp();
