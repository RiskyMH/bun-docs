import { PageArticle, PageRoot } from "@/components/layout/docs/page";

export default function NotFound() {
    return (
        <div id="nd-page" className="flex flex-1 w-full mx-auto max-w-(--fd-page-width) pt-(--fd-tocnav-height) pe-(--fd-toc-width)">
            <article className="flex min-w-0 w-full flex-col gap-4 pt-8 px-4 md:px-6 md:mx-auto items-center justify-center">
                <h1 className="mb-4 text-6xl font-extrabold text-gray-300">404</h1>
                <p className="mb-8 text-xl text-fd-muted-foreground">Page not found</p>
            </article>
        </div>
    );
}

export const revalidate = false;
