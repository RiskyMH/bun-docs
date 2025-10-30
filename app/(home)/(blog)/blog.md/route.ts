import { getPageTreeRoots } from "fumadocs-core/page-tree";
import { getLLMText, blogs } from "@/lib/source";

export async function GET() {
  let markdown = `# Bun Blog\nLatest news and updates about Bun.\n`;

  for (const post of blogs.getPages()) {
    markdown += `- [${post?.data?.title ?? "<unknown title>"}](${post?.path ?? "<unknown path>"})\n`;
  }

  return new Response(markdown.replaceAll(": \n", "\n"), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export const revalidate = false;

