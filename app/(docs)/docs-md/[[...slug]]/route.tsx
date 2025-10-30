import { source } from '@/lib/source';
import { getLLMText } from '@/lib/source';

export async function GET(_: Request, props: any) {
  const params = await props.params;
  if (params.slug?.[0] === "docs") {
    params.slug.shift()
  }
  const page = source.getPage(params.slug);
  // if (!page) notFound();
  if (!page) return new Response('Markdown page not found: /docs/' + (params.slug || []).join('/') + ".md", { status: 404 });

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export async function generateStaticParams() {
  return source.generateParams();
}

export const revalidate = false;
// export const dynamicParams = false;
