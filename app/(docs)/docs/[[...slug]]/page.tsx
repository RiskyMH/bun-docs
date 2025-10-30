import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from '@/components/layout/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DownloadIcon, LightbulbIcon } from 'lucide-react';
import Link from 'next/link';
import { LayoutTab } from '@/components/layout/docs/client';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) return notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}

      breadcrumb={{
        enabled: true,
        // includeRoot: true,
        includeRoot: true,
        includeSeparator: true,
        // includePage: true,
        // roo
      }}
      tableOfContent={{
        style: 'clerk',
        header: <div className="flex flex-row items-center gap-2 mt-4"></div>,
        footer: <div className="flex flex-row items-center gap-2 mt-4">
          <LayoutTab
            selected={false}
            option={{ title: 'Feedback', url: '/feedback', unlisted: false, props: {}, icon: <LightbulbIcon className="size-4" /> }}
          />
        </div>
      }}
    >
      <div className="flex sm:flex-row flex-col gap-2">
        <DocsTitle className='items-center me-auto'>{page.data.fullTitle || page.data.title}</DocsTitle>
        <DocsDescription className='sm:hidden mb-0'>{page.data.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center mb-8 sm:mb-0">
          <LLMCopyButton markdownUrl={`${page.url}.md`} />
          <ViewOptions
            markdownUrl={`${page.url}.md`}
            githubUrl={`https://github.com/oven-sh/bun/blob/main/docs/${page.path}`}
          />
        </div>
      </div>
      <DocsDescription className='hidden sm:block'>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams().filter((e) => e.slug[0] !== 'guides');
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) return {};

  return {
    title: page.data.fullTitle || page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}

export const revalidate = false;

// export const dynamicParams = false;