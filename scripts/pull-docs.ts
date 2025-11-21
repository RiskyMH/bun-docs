#!/usr/bin/env bun

import { join } from "node:path";

const fetchRepo = async (repoUrl: string, destinationPath: string, repoBranch = "main", sparseCheckout?: string[]) => {
  if (await Bun.file(join(destinationPath, ".git/HEAD")).exists()) {
    await Bun.$`git fetch origin ${repoBranch} && git reset --hard origin/${repoBranch}`.cwd(destinationPath);
  } else {
    await Bun.$`rm -rf ${destinationPath}`;
    if (sparseCheckout && sparseCheckout.length > 0) {
      await Bun.$`git clone --filter=blob:none --sparse --depth=1 --single-branch --no-tags ${repoUrl} ${destinationPath} --branch=${repoBranch}`;
      await Bun.$`git sparse-checkout set ${{raw: sparseCheckout.join(" ")}}`.cwd(destinationPath);
    } else {
      await Bun.$`git clone --depth=1 --single-branch --no-tags ${repoUrl} ${destinationPath} --branch=${repoBranch}`;
    }
  }
};

const BUN_REPO_URL = "https://github.com/oven-sh/bun.git";
const BUN_REPO_PATH = join(import.meta.dirname, "../.repos/bun");

const fetchBun = () => fetchRepo(BUN_REPO_URL, BUN_REPO_PATH, "main", ["docs", "packages/bun-types"]);

await Promise.all([
  fetchBun().catch(() => Bun.$`rm -rf ${BUN_REPO_PATH}`.then(fetchBun)),
]);

if (process.argv.includes("--download-only")) process.exit(0);

// TODO: copy ./repos/bun/docs to ./content/docs & ./repos/bun/guides to ./content/guides
// BUT right now it is made for previous docs structure, so that can't happen right now.
//     (also dont forget to make a .gitignore in those copied folders)
//     (also work out best way to store _snippets - either in bun/docs or dynamically make it here)

const cwd = join(import.meta.dirname, "../");

// await Bun.$`cp -r ${join(DOCS_REPO_PATH)}/* content/docs`.cwd(cwd);
await Bun.$`cp -r ${join(BUN_REPO_PATH, "docs")} content`.cwd(cwd);
// await Bun.$`cp -r ${BLOG_PATH }/pages/blog content`.cwd('../'+import.meta.dirname);
await Bun.$`cp -r content/docs/guides content`.cwd(cwd);
await Bun.$`cp -r content/docs/images public`.cwd(cwd);

await Bun.$`rm -rf content/docs/guides`.cwd(cwd);
await Bun.$`rm -rf content/docs/icons`.cwd(cwd);
await Bun.$`rm -rf content/docs/images`.cwd(cwd);
await Bun.$`rm -rf content/docs/snippets`.cwd(cwd);
await Bun.$`rm -rf content/docs/**/*.{css,png,svg,js}`.cwd(cwd);
await Bun.$`rm -rf content/docs/README.md content/docs/docs.json _content/docs/.prettierrc.json`.cwd(
  cwd
);

await Bun.write(join(cwd, "content/docs/.gitignore"), ".*");
await Bun.write(join(cwd, "content/guides/.gitignore"), ".*");
