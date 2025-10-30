import { PageArticle, PageRoot } from "@/components/layout/docs/page";
import Layout from "./(home)/layout";

export default function NotFound() {
    return (
        <Layout params={Promise.resolve({})}>
            <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
                <h1 className="text-center font-bold text-4xl text-foreground">404</h1>
                <p className="px-2 text-center text-muted-foreground">The page you are looking for does not exist</p>
            </div>
        </Layout>
    );
}