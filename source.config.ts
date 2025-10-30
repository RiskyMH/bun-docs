import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
  defineCollections,
} from "fumadocs-mdx/config";
import {
  rehypeCodeDefaultOptions,
} from "fumadocs-core/mdx-plugins";
import { z } from "zod";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      fullTitle: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  dir: "content/docs",
  meta: {
    schema: metaSchema,
  },
});

export const guides = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      fullTitle: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  dir: "content/guides",
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  postprocess: {
    includeProcessedMarkdown: true,
  },
  schema: frontmatterSchema.extend({
    authors: z.union([
      z.string().transform((value) => [value]),
      z.array(z.string()),
    ]),
    date: z.iso.date().or(z.date()),
    category: z.string().optional(),
  }),
});

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: [
      () => (tree) => {
        function replace(tree: any) {
          if (typeof tree.value === "string") {
            tree.value = tree.value.replaceAll(
              "$BUN_LATEST_VERSION",
              process.env.BUN_VERSION || "1.3.1"
            );
          }
          if (tree.children && tree.children.length > 0) {
            tree.children.forEach(replace);
          }
        }
        replace(tree);
      },
    ],
    rehypeCodeOptions: {
      // theme: "dracula",
      // themes: {
      //   dark: "dracula",
      //   light: "dracula",
      // },
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      langAlias: {
        env: "ini",
      },
      icon: {
        // https://github.com/fuma-nama/fumadocs/blob/main/packages/core/src/mdx-plugins/transformer-icon.ts
        extend: {
          // html: {
          //   viewBox: "0 0 24 24",
          //   fill: "currentColor",
          //   d: "M19.835,2H4.163C3.542,2,3.059,2.54,3.128,3.156l1.794,16.149c0.047,0.42,0.343,0.77,0.749,0.886l6.042,1.726	c0.187,0.053,0.385,0.053,0.572,0l6.042-1.726c0.406-0.116,0.702-0.466,0.749-0.886L20.87,3.156C20.939,2.54,20.456,2,19.835,2z M15.947,8H9.219l0.201,2.31l6.077-0.02c0.001,0,0.002,0,0.003,0c0.279,0,0.545,0.117,0.734,0.322	c0.19,0.206,0.285,0.482,0.262,0.761l-0.383,4.609c-0.034,0.416-0.323,0.767-0.726,0.88l-3.117,0.877	c-0.088,0.024-0.18,0.037-0.271,0.037c-0.094,0-0.188-0.013-0.277-0.039l-3.091-0.894c-0.394-0.114-0.678-0.455-0.718-0.862	l-0.079-0.798c-0.055-0.55,0.347-1.039,0.896-1.094c0.541-0.045,1.04,0.348,1.094,0.896l0.013,0.124l2.166,0.626l2.174-0.611	l0.235-2.832l-5.906,0.019c-0.001,0-0.002,0-0.003,0c-0.519,0-0.951-0.396-0.996-0.913L7.132,7.087	C7.107,6.808,7.201,6.531,7.391,6.324S7.848,6,8.128,6h7.819c0.553,0,1,0.448,1,1S16.5,8,15.947,8z",
          // },
          default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>`,
          config: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`,
          json: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`,
        },
        shortcuts: {
          mdx: "md",
          powershell: "shellscript",
          toml: "config",
          yaml: "config",
          yml: "config",
        },
      },
      transformers: [
        {
          // a thing to make the $ sign not selectable
          // and codeblock lines appear as a comment if not starting with $
          name: "sh-$-transformer",
          line(hast, line) {
            const sh = [
              ["sh", "$"],
              ["shell", "$"],
              ["bash", "$"],
              ["zsh", "$"],
              ["fish", "$"],
              ["powershell", ">"],
              ["cmd", "$"],
            ];
            // if (
            //   !sh.includes(this.options.lang) ||
            //   !this.source.split("\n").some((line) => line.startsWith("$ "))
            // )
            //   return hast;
            const lines = this.source.split("\n");
            const [, prefix] =
              sh.find(([lang, prefix]) => lang === this.options.lang) ?? [];
            if (!prefix || !lines.some((line) => line.startsWith(prefix + " ")))
              return hast;

            const children = hast.children;

            var isCommand = false;
            var commentStated = false;

            for (let index = 0; index < children.length; index++) {
              const child = children[index];
              if (child.type !== "element") continue;
              const c = child.children[0];
              if (!c || c.type !== "text") continue;

              if (index === 0) {
                isCommand = c.value === prefix;
                if (isCommand)
                  this.addClassToHast(child, [
                    "select-none",
                    "shiki-sh-true-beginning",
                  ]);
              }

              if (index === 1 && isCommand) {
                if (c.value?.startsWith(" ")) {
                  c.value = c.value.slice(1);
                  this.addClassToHast(child, "shiki-sh-new-beginning");
                  if (
                    children[0]?.type === "element" &&
                    children[0].children[0]?.type === "text"
                  ) {
                    children[0].children[0].value =
                      children[0].children[0].value + " ";
                  }
                }
              }

              if (c.value?.includes("#")) {
                commentStated = true;
              }

              if (commentStated && isCommand) {
                this.addClassToHast(child, "select-none");
              }

              if (!isCommand) {
                this.addClassToHast(child, "skiki-sh-comment");
              }
            }

            return hast;
          },
        },
        ...(rehypeCodeDefaultOptions.transformers ?? []),
      ],
    },
  },
});
