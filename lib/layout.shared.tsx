import DiscordIcon from '@/components/icons/discord';
import { Wordmark, Logo } from '@/components/icons/bun';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookIcon } from 'lucide-react';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-1">
          <Logo className="size-10" />
          <Wordmark className="h-7 w-auto mb-[3px] text-black dark:text-[#fbf0df]" stroke='currentColor' fill='currentColor' />
        </span>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        icon: <DiscordIcon />,
        text: 'Discord',
        url: 'https://bun.com/discord',
        type: 'icon',
        external: true,
      },
    ],
    githubUrl: 'https://github.com/oven-sh/bun',
    themeSwitch: {
      mode: "light-dark-single-button" as any,
    }
  };
}
