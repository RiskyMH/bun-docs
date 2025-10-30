import { getPageTreeRoots } from "fumadocs-core/page-tree";
import { getLLMText, source } from "@/lib/source";

export async function GET() {
  let markdown = (await getLLMText(source.getPage([])!)).replace(/\n{2,}/g, "\n\n");
  markdown += `\n\n# Docs Sitemap\nSmth smth smth.\n`;

  for (const node of getPageTreeRoots(source.pageTree)) {
    if (node.name === "Guides" || node.children.length === 0) continue;
    markdown += `\n## ${node.name?.toString().trim() ?? "<unknown title>"}\n`;
    for (const child of node.children) {
      if (child.type === "separator") {
        markdown += `\n${child.name?.toString().trim() ?? "<unknown title>"}\n`;
      } else if (child.type === "page") {
        markdown += `- [${child.name}](${child.url}): ${
          child.description ?? ""
        }\n`;
      }
    }
    markdown += "\n";
  }

  return new Response(markdown.replaceAll(": \n", "\n"), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export const revalidate = false;
