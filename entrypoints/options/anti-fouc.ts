export function initTheme() {
  try {
    const theme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const finalTheme = !theme || theme === 'system' ? systemTheme : theme;
    
    if (finalTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {
    console.error('Anti-FOUC error:', e);
  }
}

initTheme();