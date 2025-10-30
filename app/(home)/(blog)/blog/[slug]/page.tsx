import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blogs, getBlogPageImage, getPageImage } from '@/lib/source';
import { PageRoot, PageTOCPopoverItems } from '@/components/layout/docs/page';
import { getMDXComponents } from '@/mdx-components';
import path from 'node:path';
import { PageTOC, PageTOCPopoverContent, PageTOCPopoverTrigger, PageTOCPopover } from '@/components/layout/docs/page-client';
import { PageTOCItems, PageTOCTitle } from '@/components/layout/docs/page';
import authors from '@/content/blog/authors.json';
import { ArrowLeftIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const params = await props.params;
  const page = blogs.getPage([params.slug]);

  if (!page) notFound();
  const { body: Mdx, toc } = page.data;

  return (
    <article className="flex flex-col mx-auto w-full max-w-[800px] px-4 py-8 xl:mr-[30%] 2xl:mr-[35%] pt-(--fd-nav-height)">
      <div className="flex flex-row gap-2 mb-4 text-sm text-fd-muted-foreground">
        <Link
          href="/blog"
          className='hover:underline transition-all duration-100 hover:text-fd-accent-foreground flex gap-2 items-center'
        >
          <ArrowLeftIcon className='size-4' />
          <span className='self-center'>Blogs</span>
        </Link>
        {page.data.category && <>
          <span>/</span>
          <Link
            href={`/blog?category=${page.data.category}`}
            className='hover:underline transition-all duration-100 hover:text-fd-accent-foreground'
          >
            {page.data.category}
          </Link>
        </>}
      </div>
      <h1 className="text-3xl font-bold mb-4">{page.data.title}</h1>

      <div className={cn("flex flex-row gap-2 text-sm mb-8 pb-4 border-b border-fd-border text-fd-muted-foreground", page.data.authors.length > 3 ? 'max-sm:flex-col flex-row' : 'flex-row')}>
        <p className="">
          {page.data.authors.map((author) => {
            const authorData = authors[author as keyof typeof authors];
            if (!authorData) return author;

            if ('github' in authorData) {
              return <a
                href={`https://github.com/${authorData.github}`}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline transition-all duration-100 text-fd-foreground'
                key={author}
              >
                {page.data.authors.length > 3 ? authorData.name.split(' ')[0] : authorData.name}
              </a>
            }
            return authorData.name;
          }).map((elem, i) => i < page.data.authors.length - 1 ? <>{elem}, </> : elem)}
        </p>
        <span className={cn('select-none', page.data.authors.length > 3 ? 'max-sm:hidden' : '')}>•</span>

        <p className="text-fd-muted-foreground text-nowrap">
          {new Date(
            page.data.date ??
            path.basename(page.path, path.extname(page.path)),
          ).toDateString()}
        </p>
      </div>

      {/* <p className="text-fd-muted-foreground mb-8">{page.data.description}</p> */}

      <div className="prose min-w-0 flex-1">
        {/* <InlineTOC items={toc} /> */}
        <Mdx components={getMDXComponents()} />
      </div>
      <PageRoot toc={{ toc, single: true }}>
        <PageTOCPopover>
          <PageTOCPopoverTrigger />
          <PageTOCPopoverContent>
            <PageTOCPopoverItems variant={"clerk"} />
          </PageTOCPopoverContent>
        </PageTOCPopover>

        <PageTOC className='pt-4'>
          {/* {tocOptions.header} */}
          <PageTOCTitle />
          <PageTOCItems variant='clerk' />
          {/* {tocOptions.footer} */}
        </PageTOC>
      </PageRoot>
    </article>
  );
}

export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = blogs.getPage([params.slug]);

  if (!page) notFound();

  return {
    title: page.data.title,
    description:
      page.data.description,
    openGraph: {
      images: getBlogPageImage(page).url,
    },
  };
}

export function generateStaticParams(): { slug: string }[] {
  return blogs.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
export const revalidate = false;
// export const dynamicParams = false;