'use client';
import { cva } from 'class-variance-authority';
import { Moon, Sun, Airplay } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type HTMLAttributes, useLayoutEffect, useState } from 'react';
import { cn } from '../lib/cn';

const itemVariants = cva(
  'size-6.5 rounded-full p-1.5 text-fd-muted-foreground',
  {
    variants: {
      active: {
        true: 'bg-fd-accent text-fd-accent-foreground',
        false: 'text-fd-muted-foreground',
      },
    },
  },
);

const full = [
  ['light', Sun] as const,
  ['dark', Moon] as const,
  ['system', Airplay] as const,
];

export function ThemeToggle({
  className,
  mode = 'light-dark',
  ...props
}: HTMLAttributes<HTMLElement> & {
  mode?: 'light-dark' | 'light-dark-system' | 'light-dark-single-button';
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (mode === 'light-dark-single-button') {
    return (
      <button
        className={cn("justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&_svg]:size-4.5 flex items-center gap-2", className?.replace('p-0', ''))}
        aria-label={`Toggle Theme`}
        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
        data-abc={className}
      >
        {theme === 'light' ? <Sun className="size-full" fill="currentColor" /> : <Moon className="size-full" fill="currentColor" />}
        <span className="sr-only">Toggle Theme</span>
      </button>
    );
  }

  const container = cn(
    'inline-flex items-center rounded-full border p-1',
    className,
  );

  if (mode === 'light-dark') {
    const value = mounted ? resolvedTheme : null;

    return (
      <button
        className={container}
        aria-label={`Toggle Theme`}
        onClick={() => setTheme(value === 'light' ? 'dark' : 'light')}
        data-theme-toggle=""
        {...props}
      >
        {full.map(([key, Icon]) => {
          if (key === 'system') return;

          return (
            <Icon
              key={key}
              fill="currentColor"
              className={cn(itemVariants({ active: value === key }))}
            />
          );
        })}
      </button>
    );
  }

  const value = mounted ? theme : null;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(itemVariants({ active: value === key }))}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
