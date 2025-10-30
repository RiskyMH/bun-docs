import { getPageImage, source } from '@/lib/source';
import { findPath } from "fumadocs-core/page-tree"
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { Logo, Wordmark } from '@/components/icons/bun';
import geistRegular from '@/lib/geist-sans/Geist-Regular.ttf' with { type: 'bytes' };
import geistBold from '@/lib/geist-sans/Geist-Bold.ttf' with { type: 'bytes' };


export const revalidate = false;
// export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) notFound();

  const isGuides = page.data.type === 'guides';

  let breadcrumbs = findPath(source.pageTree.children, e => 'url' in e && e.url === page.url, { includeSeparator: true })?.map(e => e.name).filter(e => !!e).slice(0, -1) || slug
  breadcrumbs = breadcrumbs.filter((item, i) => item !== "Main Sections")
  if (!isGuides) {
    breadcrumbs = ['docs', ...breadcrumbs];
  }

  if (breadcrumbs.includes(" Get Started") && breadcrumbs.includes("Runtime")) {
    breadcrumbs = ['docs', 'Get Started'];
  }

  // force only 2 elements in breadcrumbs right now
  breadcrumbs = breadcrumbs.slice(0, 2);

  // @ts-ignore
  const title = page.data?._exports?.frontmatter?.fullTitle ?? page.data.title

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          color: 'white',
          backgroundColor: 'rgb(20,20,20)',
          padding: '56px',
          paddingBottom: '46px',
        }}
      >
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {isGuides && (
            <p
              style={{
                fontSize: '48px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: 1.4,
                fontFamily: 'Geist',
                marginBottom: '24px',
              }}
            >
              {toTitleCase(breadcrumbs.at(-1)?.toString() ?? '')}
            </p>
          )}

          <h1
            style={{
              fontSize: title.length < 90 ? '98px' : '72px',
              fontWeight: 900,
              margin: 0,
              marginBottom: '24px',
              lineHeight: 1.2,
              fontFamily: 'Geist',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {title}
          </h1>
          {page.data.description && !isGuides && (
            <p
              style={{
                fontSize: '48px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: 1.4,
                fontFamily: 'Geist',
              }}
            >
              {page.data.description}
            </p>
          )}
        </div>

        {/* Horizontal divider */}
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            marginBottom: '35px',
          }}
        />

        {/* Bottom breadcrumb navigation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '20px',
            fontSize: '42px',
            // fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Geist',
            textTransform: 'uppercase',
          }}
        >
          <Logo width={70} height={60} opacity={0.8} />

          {breadcrumbs.length >= 1
            ? <span>/ {breadcrumbs.join(' / ').toUpperCase().replace(/-/g, ' ')}</span>
            : <span>/ DOCS</span>
          }

          <Wordmark
            width={150}
            height={52}
            style={{
              marginLeft: 'auto',
            }}
            opacity={0.8}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Geist',
          data: geistRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: geistBold,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}