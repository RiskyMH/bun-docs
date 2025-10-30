import Link from 'next/link';
import { blogs } from '@/lib/source';
import { PathUtils } from 'fumadocs-core/source';
import authors from '@/content/blog/authors.json';

function getName(path: string) {
  return PathUtils.basename(path, PathUtils.extname(path));
}

export default function Page() {
  const posts = [...blogs.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? getName(b.path)).getTime() -
      new Date(a.data.date ?? getName(a.path)).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-fd-container px-4 py-12 flex flex-col gap-8">
      <div className="mb-4 gap-2 z-2 p-2">
        <h1 className="text-3xl font-medium">Bun Blog</h1>
        <p className="text-fd-muted-foreground">Latest announcements of Bun.</p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="flex flex-col bg-fd-card rounded-2xl border shadow-sm p-4 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <h4 className="font-medium text-lg">{post.data.title}</h4>
            <p className="text-sm text-fd-muted-foreground">
              {post.data.description}
            </p>

            <p className="mt-auto pt-4 text-xs text-brand flex gap-2">
              <span className='text-nowrap'>{new Date(post.data.date ?? getName(post.path)).toDateString()}</span>
              {post.data.category && <>
                <span className='select-none text-fd-muted-foreground'>•</span>
                <span className='text-fd-muted-foreground'>{post.data.category}</span>
              </>}
              {post.data.authors.length >= 1 && <>
                <span className='select-none text-fd-muted-foreground'>•</span>
                <span className='text-fd-muted-foreground'>{post.data.authors.map((author) => {
                  const authorData = authors[author as keyof typeof authors];
                  if (!authorData) return author;
                  return post.data.authors.length > 3 ? authorData.name.split(' ')[0] : authorData.name;
                }).join(', ')}</span>
              </>}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export const revalidate = false;
