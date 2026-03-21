import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, Moon02Icon, ModernTvIcon } from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  const s = localStorage.getItem(STORAGE_KEY);
  return s === 'light' || s === 'dark' || s === 'system' ? s : 'system';
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

const icons = {
  light: Sun01Icon,
  dark: Moon02Icon,
  system: ModernTvIcon,
} as const;

const labels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getStoredTheme() === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function selectTheme(chosen: Theme) {
    setTheme(chosen);
    localStorage.setItem(STORAGE_KEY, chosen);
    applyTheme(chosen);
  }

  const CurrentIcon = icons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Toggle theme"
        >
          <HugeiconsIcon icon={CurrentIcon} size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {(Object.keys(icons) as Theme[]).map((t) => (
          <DropdownMenuItem
            key={t}
            onClick={() => selectTheme(t)}
            className={theme === t ? 'font-medium text-primary' : ''}
          >
            <HugeiconsIcon icon={icons[t]} size={16} className="mr-2" />
            {labels[t]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
