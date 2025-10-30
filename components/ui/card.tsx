import Link from 'fumadocs-core/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ChevronRightIcon } from 'lucide-react';

export function Cards(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('grid grid-cols-2 gap-3 @container', props.className)}
    >
      {props.children}
    </div>
  );
}

export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;

  href?: string;
  external?: boolean;
  cta?: ReactNode;
};

export function Card({ icon, title, description, ...props }: CardProps) {
  const E = props.href ? Link : 'div';

  return (
    <E
      {...props}
      data-card
      className={cn(
        'group block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full',
        props.href && 'hover:bg-fd-accent/80',
        props.className,
      )}
    >
      {icon ? (
        <div className="not-prose mb-2 w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-primary [&_svg]:size-6">
          {icon}
        </div>
      ) : null}
      <h3 className="not-prose mb-1 text-sm font-medium">{title}</h3>
      {description ? (
        <p className="!my-0 text-sm text-fd-muted-foreground">{description}</p>
      ) : null}
      <div className="text-sm text-fd-muted-foreground prose-no-margin empty:hidden">
        {props.children}
      </div>
      {props.cta ? (
        <div className="mt-5 text-sm text-fd-muted-foreground prose-no-margin empty:hidden group-hover:text-fd-primary flex">
          {props.cta}
          <ChevronRightIcon className="size-4 self-center" />
        </div>
      ) : null}
    </E>
  );
}