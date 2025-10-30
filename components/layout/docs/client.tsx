'use client';

import { BookIcon, DownloadIcon, LightbulbIcon, NewspaperIcon, Sidebar as SidebarIcon } from 'lucide-react';
import { type ComponentProps, Fragment, useMemo } from 'react';
import { cn } from '../../../lib/cn';
import { buttonVariants } from '../../ui/button';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { useNav } from 'fumadocs-ui/contexts/layout';
import { SidebarCollapseTrigger } from '../../sidebar';
import { SearchToggle } from '../../search-toggle';
import type { Option } from '../../root-toggle';
import { usePathname } from 'fumadocs-core/framework';
import { isTabActive } from '../../../lib/is-active';
import Link from 'fumadocs-core/link';
import { baseOptions } from '@/lib/layout.shared';

export function Navbar(props: ComponentProps<'header'>) {
  const { isTransparent } = useNav();

  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        'fixed top-(--fd-banner-height) left-0 right-(--removed-body-scroll-bar-size,0) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm',
        !isTransparent && 'bg-fd-background/80',
        props.className,
      )}
    >
      {props.children}
    </header>
  );
}

export function LayoutBody(props: ComponentProps<'main'>) {
  const { collapsed } = useSidebar();

  return (
    <main
      id="nd-docs-layout"
      {...props}
      className={cn(
        'flex flex-1 flex-col pt-(--fd-nav-height) transition-[padding] fd-default-layout',
        !collapsed && 'mx-(--fd-layout-offset)',
        props.className,
      )}
      style={{
        ...props.style,
        paddingInlineStart: collapsed
          ? 'min(calc(100vw - var(--fd-page-width)), var(--fd-sidebar-width))'
          : 'var(--fd-sidebar-width)',
      }}
    >
      {props.children}
    </main>
  );
}

export function CollapsibleControl() {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        'fixed flex shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10 max-md:hidden xl:start-4 max-xl:end-4 z-20',
        !collapsed && 'pointer-events-none opacity-0',
      )}
      style={{
        top: 'calc(var(--fd-banner-height) + var(--fd-tocnav-height) + var(--spacing) * 4)',
      }}
    >
      <SidebarCollapseTrigger
        className={cn(
          buttonVariants({
            color: 'ghost',
            size: 'icon-sm',
            className: 'rounded-lg',
          }),
        )}
      >
        <SidebarIcon />
      </SidebarCollapseTrigger>
      <SearchToggle className="rounded-lg" hideIfDisabled />
    </div>
  );
}

export function LayoutTabs({
  options,
  ...props
}: ComponentProps<'div'> & {
  options: Option[];
}) {
  const pathname = usePathname();
  const selected = useMemo(() => {
    return options.findLast((option) => isTabActive(option, pathname));
  }, [options, pathname]);

  return (
    <div
      {...props}
      className={cn(
        'flex flex-row items-end gap-6 overflow-auto',
        props.className,
      )}
    >

      {(options.at(0)?.title === 'Docs') && (
        <>
          {baseOptions().nav?.title}
          <span className="ms-auto" />
        </>
      )}

      {options.map((option) => (
        option.url === '---'
          ? <span key={option.url} className="ms-auto" />
          : <Fragment key={option.url}>
            <LayoutTab
              key={option.url}
              selected={selected === option}
              option={option}
            />
          </Fragment>
      ))}

      {!(options.map(option => option.url).includes('---')) && <span className="ms-auto" />}

      <Link href='/docs/installation' className=' -mt-3 flex flex-row items-center gap-2 rounded-lg py-1.5 px-2 text-sm tracking-wider text-nowrap self-center text-start [&_svg]:size-4 [&_svg]:shrink-0 bg-fd-primary/10 hover:bg-fd-primary/15 text-fd-primary'>
        <DownloadIcon className="size-4" />
        Install Bun
      </Link>
    </div>
  );
}

export function LayoutTab({
  option: { title, url, unlisted, props, icon },
  selected = false,
}: {
  option: Option;
  selected?: boolean;
}) {
  return (
    <Link
      href={url}
      {...props}
      className={cn(
        'inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground',
        unlisted && !selected && 'hidden',
        selected && 'border-fd-primary text-fd-primary',
        props?.className,
      )}
    >
      <span className="size-4!">{icon}</span>
      {title}
    </Link>
  );
}
