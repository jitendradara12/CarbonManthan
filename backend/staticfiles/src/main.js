import { initApp } from './router/index.js';

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = savedTheme;
  const sync = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(b => { b.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙'; });
  };
  sync();
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.matches('[data-theme-toggle]')) {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      sync();
    }
  });
}

initTheme();
// Hamburger logic (robust)
function initHamburger(){
  const navToggle = document.getElementById('nav-toggle');
  if(!navToggle) return;
  if(navToggle.dataset.bound) return; // avoid rebinding
  navToggle.dataset.bound = '1';
  navToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  
  const closeNav = () => {
    if(document.body.classList.contains('nav-open')){
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded','false');
    }
  };

  window.addEventListener('hashchange', closeNav);
  
  // Also close nav if clicking any link inside it
  document.addEventListener('click', (e) => {
    if (e.target.closest('#nav') && e.target.tagName === 'A') {
      closeNav();
    }
  });
}
initHamburger();
initApp();
