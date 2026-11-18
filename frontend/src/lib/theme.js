const ACCENTS = { laranja: '249 115 22', ambar: '251 191 36', verde: '34 197 94' };
export const ACCENT_LIST = [['laranja', 'Laranja'], ['ambar', 'Âmbar'], ['verde', 'Verde']];

export function applyTheme(t = 'dark') {
  const resolved = t === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem('pm-theme', t);
}
export function applyAccent(a = 'laranja') {
  document.documentElement.style.setProperty('--brand', ACCENTS[a] || ACCENTS.laranja);
  localStorage.setItem('pm-accent', a);
}
export function initTheme() {
  applyTheme(localStorage.getItem('pm-theme') || 'dark');
  applyAccent(localStorage.getItem('pm-accent') || 'laranja');
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (localStorage.getItem('pm-theme') === 'system') applyTheme('system');
  });
}
