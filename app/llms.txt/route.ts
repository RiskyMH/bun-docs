import { GET as docsGet } from "../(docs)/docs.md/route";
import { GET as guidesGet } from "../(docs)/guides.md/route";
import { GET as blogGet } from "../(home)/(blog)/blog.md/route";

// todo: make this better
export async function GET() {
  const docs = await (await docsGet()).text();
  const content = await (await guidesGet()).text();
  const blog = await (await blogGet()).text();

  return new Response([docs, content, blog].join("\n\n"), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

export const revalidate = false;
