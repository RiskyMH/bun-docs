import { source } from '@/lib/source';
import { getLLMText } from '@/lib/source';

export async function GET(_: Request, props: any) {
  const params = await props.params;
  if (params.slug?.[0] === "docs") {
    params.slug.shift()
  }
  if (params.slug?.at(-1)?.endsWith('.md')) {
    params.slug[params.slug.length - 1] = params.slug[params.slug.length - 1].slice(0, -'.md'.length);
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
  return source.generateParams().map(e => {
    if (e.slug.length > 0) {
      e.slug[e.slug.length - 1] += '.md';
    } else {
      e.slug[0] = ".md"
    }
    return e;
  });
}

export const revalidate = false;
// export const dynamicParams = false;
