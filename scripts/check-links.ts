import {
  type FileObject,
  printErrors,
  scanURLs,
  validateFiles,
} from "next-validate-link";
import type { InferPageType } from "fumadocs-core/source";

import { createMdxPlugin } from "fumadocs-mdx/bun";
Bun.plugin(createMdxPlugin());
await Bun.sleep(100)

console.time("parse mdx files");
const { source } = await import("@/lib/source");
const pages = source.getPages();
console.timeEnd("parse mdx files");

async function checkLinks() {
  console.time("checked links");

  const scanned = await scanURLs({
    preset: "next",
    populate: {
      "(docs)/docs/[[...slug]]": pages
        .filter((page) => page.slugs[0] !== "guides")
        .map((page) => {
          return {
            value: {
              slug: page.slugs,
            },
            hashes: getHeadings(page),
          };
        }),
      "(docs)/guides/[[...slug]]": pages
        .filter((page) => page.slugs[0] === "guides")
        .map((page) => {
          return {
            value: {
              slug: page.slugs.slice(1),
            },
            hashes: getHeadings(page),
          };
        }),
    },
  });

  const errors = await validateFiles(await getFiles(), {
    scanned,
    markdown: {
      components: {
        Card: { attributes: ["href"] },
        FancyCard: { attributes: ["href"] },
      },
    },
    checkRelativePaths: "as-url",
    // ignoreFragment: true,
    checkExternal: true,
    whitelist: [
      // its rewritten to /docs/feedback
      "/feedback",

      // something wrong with the fetch, proabibly getting confused with the ?query param
      "https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode",

      // they prob block bun/automated requests
      "https://developer.mozilla.org/*",
      "https://twitter.com/*",
      "https://twitter.com/jarredsumner/status/1458207919636287490",
      "https://twitter.com/jarredsumner/status/1606163655527059458",
      "https://twitter.com/jarredsumner/status/1499225725492076544",
      "https://twitter.com/jarredsumner/status/1499225725492076544",
    ],
  });
  console.timeEnd("checked links");

  printErrors(errors, true);
  return errors;
}

function getHeadings({ data }: InferPageType<typeof source>): string[] {
  return data.toc.map((item) => item.url.slice(1));
}

function getFiles() {
  const promises = source.getPages().map(
    async (page): Promise<FileObject> => ({
      path: page.absolutePath,
      content: await page.data.getText("raw"),
      url: page.url,
      data: page.data,
    })
  );

  return Promise.all(promises);
}

await checkLinks();
