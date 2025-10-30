import { getPageTreeRoots } from "fumadocs-core/page-tree";
import { source } from "@/lib/source";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Fragment } from "react";

export const revalidate = false;

export async function GET() {
  let markdown = "# All Guides\n";
  markdown += `A collection of code samples and walkthroughs for performing common tasks with Bun.\n`;

  const guidesNode = getPageTreeRoots(source.pageTree).find(
    (p) => p.name === "Guides"
  );
  for (const child of guidesNode?.children || []) {
    if (child.type === "separator") {
      markdown += `\n## ${child.name?.toString().trim()}\n\n`;
    } else if (child.type === "page") {
      markdown += `- [${child.name}](${child.url})\n`;
    }
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}
