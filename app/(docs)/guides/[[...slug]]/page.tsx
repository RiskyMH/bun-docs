import { source } from '@/lib/source';

export { } from '@/app/(docs)/docs/[[...slug]]/page';
import DefaultPage, { generateMetadata as generateMetadataDocs } from '@/app/(docs)/docs/[[...slug]]/page';

export default async function Page(props: PageProps<'/guides/[[...slug]]'>) {
  const { slug } = await props.params;
  const slugs = ['guides', ...(slug || [])];
  return <DefaultPage {...props} params={Promise.resolve({ slug: slugs })} />;
}

export async function generateStaticParams() {
  return source.generateParams().filter((e) => e.slug[0] === 'guides').map((e) => ({ slug: e.slug.slice(1) }));
}


export async function generateMetadata(props: PageProps<'/guides/[[...slug]]'>) {
  const { slug } = await props.params;
  const slugs = ['guides', ...(slug || [])];
  return generateMetadataDocs({ ...props, params: Promise.resolve({ slug: slugs }) });
}

export const revalidate = false;
// export const dynamicParams = false;
