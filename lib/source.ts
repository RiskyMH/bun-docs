import { docs, guides, blog as blogSrc } from "@/.source";
import { createMDXSource } from "fumadocs-mdx/runtime/next";
import { type InferPageType, loader, multiple } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

// See https://fumadocs.dev/docs/headless/source-api for more info

const g = guides.toFumadocsSource();
g.files.forEach((e) => (e.path = `guides/${e.path}`));

export const source = loader(
  multiple({
    docs: docs.toFumadocsSource(),
    guides: g,
  }),
  {
    baseUrl: "/",
    url(slugs: string[]) {
      if (slugs[0] == "guides" || slugs[0] == "feedback") {
        return `${slugs.join("/")}`;
      }
      return `/docs/${slugs.join("/")}`;
    },

    plugins: [lucideIconsPlugin()],
  }
);

export const blogs = loader(createMDXSource(blogSrc), {
  baseUrl: "/blog",
  // plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

export function getBlogPageImage(page: InferPageType<typeof blogs>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/blog/${segments.join("/")}`,
  };
}
export async function getLLMText(
  page: InferPageType<typeof source | typeof blogs>
) {
  const processed = await page?.data?.getText("processed") ?? "<unknown page>";

  // Remove sections marked as llm ignored (between {/* start llm ignored codeblock */} and {/* end llm ignored codeblock */})
  const cleaned = processed.replace(
    /\{\/\*\s*start llm ignored codeblock\s*\*\/\}[\s\S]*?\{\/\*\s*end llm ignored codeblock\s*\*\/\}/g,
    ""
  );

  return `# ${page?.data?.title ?? "<unknown title>"} (${page?.url ?? "<unknown url>"})

${cleaned}`;
}
