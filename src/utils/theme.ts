type Theme = 'light' | 'dark' | 'system';

const KEY = 'gm-theme';

export function resolveTheme(preference: Theme): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(value: 'light' | 'dark') {
  document.documentElement.dataset.theme = value;
}

/** Bootstraps the app theme from ?theme= / localStorage / OS setting and keeps it live. */
export function installTheme(): () => void {
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get('theme');
  if (param === 'dark' || param === 'light') {
    window.localStorage.setItem(KEY, param);
  }
  const stored = (window.localStorage.getItem(KEY) as Theme | null) ?? 'system';

  apply(resolveTheme(stored));
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    try {
      if ((window.localStorage.getItem(KEY) as Theme | null) === 'system') apply(resolveTheme('system'));
    } catch {
      apply(resolveTheme('system'));
    }
  };
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
