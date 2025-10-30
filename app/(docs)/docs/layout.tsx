import { DocsLayout } from '@/components/layout/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import {
  CogIcon,
  BoxIcon,
  FlaskConicalIcon,
  CombineIcon,
  BookIcon,
  NewspaperIcon,
  MapIcon,
} from "lucide-react";
import { pages as runtimePages } from "../../../content/docs/runtime/meta.json";
import { pages as bundlerPages } from "../../../content/docs/bundler/meta.json";
import { pages as pmPages } from "../../../content/docs/pm/meta.json";
import { pages as testPages } from "../../../content/docs/test/meta.json";
import { pages as guidesPages } from "../../../content/guides/meta.json";
import path from "node:path";
import { Metadata } from 'next';
import { Root } from 'fumadocs-core/page-tree';
import { AISearchTrigger } from '@/components/search';
import XIcon from '@/components/icons/x';
import YouTubeIcon from '@/components/icons/youtube';


export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      tabMode='top'
      {...baseOptions()}
      links={[
        ...(baseOptions().links ?? []),
        {
          icon: <XIcon />,
          text: 'X',
          url: 'https://x.com/bunjavascript',
          type: 'icon',
          external: true,
        },
        {
          icon: <YouTubeIcon />,
          text: 'YouTube',
          url: 'https://www.youtube.com/@bunjs',
          type: 'icon',
          external: true,
        },
      ]}
      sidebar={{
        tabs: [
          {
            title: 'Runtime',
            description: 'Bun Runtime - Fast JavaScript runtime',
            url: '/docs',
            urls: getUrls(runtimePages, '/docs/runtime' as const).add('/docs'),
            icon: iconTransform(<CogIcon className="sm:size-full " />),
          },
          {
            title: 'Bundler',
            description: 'Bun\'s fast native bundler',
            url: '/docs/bundler',
            urls: getUrls(bundlerPages, '/docs/bundler' as const),
            icon: iconTransform(<CombineIcon className="size-full" />),
          },
          {
            title: 'Package Manager',
            description: 'Bun\'s fast package manager',
            url: '/docs/pm/cli/install',
            urls: getUrls(pmPages, '/docs/pm' as const),
            icon: iconTransform(<BoxIcon className="size-full" />),
          },
          {
            title: 'Test Runner',
            description: 'Bun\'s built-in test runner',
            url: '/docs/test',
            urls: getUrls(testPages, '/docs/test' as const),
            icon: iconTransform(<FlaskConicalIcon className="size-full" />),
          },
          {
            title: '',
            url: '---',
          },
          {
            title: 'Guides',
            description: 'Practical guides and examples',
            url: '/guides',
            // urls: getUrls(guidesPages, '/guides' as const),
            icon: iconTransform(<MapIcon className="size-full" />),
          },
          {
            title: 'Reference',
            description: 'TypeScript API reference',
            url: '/reference',
            icon: iconTransform(<BookIcon className="size-full" />),
          },
          {
            title: 'Blog',
            description: 'Latest news and updates',
            url: '/blog',
            icon: iconTransform(<NewspaperIcon className="size-full" />),
          },

        ]
      }}
    >
      {children}
      <AISearchTrigger />
    </DocsLayout>
  );
}


const iconTransform = (icon: React.ReactNode) => {
  return (
    <div className="size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:border max-md:bg-fd-secondary">
      {icon}
    </div>
  );
};

const getUrls = (pages: string[], prefix: string) => {
  return new Set(pages.filter((page) => !page.startsWith('---')).map((page) => path.join(prefix, page.replace("index", ""))));
}



export const metadata: Metadata = {
  title: {
    default: 'Bun Docs',
    template: '%s | Bun Docs',
  },
  description: 'Bun is a fast, modern runtime for JavaScript and TypeScript',
};

