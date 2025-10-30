import { blogs } from '@/lib/source';
import { getLLMText } from '@/lib/source';

export async function GET(_: Request, props: RouteContext<"/blog-md/[slug]">) {
  const params = await props.params;
  const page = blogs.getPage([params.slug]);
  // if (!page) notFound();
  if (!page) return new Response('Markdown page not found: /blog/' + params.slug + ".md", { status: 404 });

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export async function generateStaticParams() {
  return blogs.generateParams().map(({ slug }) => ({ slug: slug[0] }));
}

export const revalidate = false;
// export const dynamicParams = false;
