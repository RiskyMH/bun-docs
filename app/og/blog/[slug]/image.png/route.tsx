import { blogs } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { Logo } from '@/components/icons/bun';
import geistRegular from '@/lib/geist-sans/Geist-Regular.ttf' with { type: 'bytes' };
import geistBold from '@/lib/geist-sans/Geist-Bold.ttf' with { type: 'bytes' };


export const revalidate = false;
// export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/blog/[slug]/image.png'>,
) {
  const { slug } = await params;
  const page = blogs.getPage([slug]);
  if (!page) notFound();

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

          <h1
            style={{
              fontSize: page.data.title.length < 90 ? '90px' : '72px',
              fontWeight: 900,
              margin: 0,
              marginBottom: '24px',
              lineHeight: 1.2,
              fontFamily: 'Geist',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {page.data.title}
          </h1>
          {page.data.description && (
            <p
              style={{
                fontSize: page.data.description.length < 90 ? '48px' : '33px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: 1.4,
                fontFamily: 'Geist',
              }}
            >
              {page.data.description.slice(0, 350)}{page.data.description.length > 350 ? '…' : ''}
            </p>
          )}
        </div>

        {/* Horizontal divider */}
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            marginBottom: '20px',
          }}
        />

        {/* Bottom breadcrumb navigation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '20px',
            fontSize: '33px',
            // fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Geist',
          }}
        >

          {page.data.date && (
            new Date(page.data.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          )}

          <Logo width={70} height={60} opacity={0.8} style={{
            marginLeft: 'auto',
          }}
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
  return blogs.getPages().map((page) => ({
    lang: page.locale,
    slug: page.slugs[0],
  }));
}
