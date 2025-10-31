#!/usr/bin/env bun

import { join } from "node:path";
const REPO_URL = "https://github.com/oven-sh/bun.git";
const REPO_PATH = join(import.meta.dirname, "../.repos/bun");
const REPO_BRANCH = "lydia/merge-docs";

const fetchRepo = async () => {
  if (await Bun.file(join(REPO_PATH, ".git/HEAD")).exists()) {
    await Bun.$`git fetch origin ${REPO_BRANCH} && git reset --hard origin/${REPO_BRANCH}`.cwd(
      REPO_PATH
    );
  } else {
    await Bun.$`rm -rf ${REPO_PATH}`;
    await Bun.$`git clone --filter=blob:none --sparse --depth=1 --single-branch --no-tags ${REPO_URL} ${REPO_PATH} --branch=${REPO_BRANCH}`;
    await Bun.$`git sparse-checkout set docs packages/bun-types`.cwd(REPO_PATH);
  }
};

const BLOG_REPO_URL = "https://github.com/oven-sh/site.git";
const BLOG_PATH = join(import.meta.dir, "../.repos/site");
const BLOG_BRANCH = "main";

const fetchBlogRepo = async () => {
  if (await Bun.file(join(BLOG_PATH, ".git/HEAD")).exists()) {
    await Bun.$`git fetch origin ${BLOG_BRANCH} && git reset --hard origin/${BLOG_BRANCH}`.cwd(
      BLOG_PATH
    );
  } else {
    await Bun.$`rm -rf ${BLOG_PATH}`;
    await Bun.$`git clone --filter=blob:none --sparse --depth=1 --single-branch --no-tags ${BLOG_REPO_URL} ${BLOG_PATH} --branch=${BLOG_BRANCH}`;
    await Bun.$`git sparse-checkout set pages/blog`.cwd(BLOG_PATH);
  }
};
await Promise.all([
  fetchRepo().catch(() => Bun.$`rm -rf ${REPO_PATH}`.then(() => fetchRepo())),
  fetchBlogRepo().catch(() => {}),
]);

// TODO: copy ./repos/bun/docs to ./content/docs & ./repos/bun/guides to ./content/guides
// BUT right now it is made for previous docs structure, so that can't happen right now.
//     (also dont forget to make a .gitignore in those copied folders)
//     (also work out best way to store _snippets - either in bun/docs or dynamically make it here)

const cwd = join(import.meta.dirname, "../");

await Bun.$`cp -r ${join(REPO_PATH, "docs")} content`.cwd(cwd);
// await Bun.$`cp -r ${BLOG_PATH }/pages/blog content`.cwd('../'+import.meta.dirname);

// Copy snippets directly from Bun repo to content/_snippets/
await Bun.$`mkdir -p content/_snippets`.cwd(cwd);
const snippetsPath = join(REPO_PATH, "docs/snippets");
if (await Bun.file(snippetsPath).exists()) {
  await Bun.$`cp -r ${snippetsPath}/* content/_snippets/`.cwd(cwd);
}

await Bun.$`cp -r content/docs/guides content`.cwd(cwd);
await Bun.$`cp -r content/docs/images public`.cwd(cwd);

await Bun.$`rm -rf content/docs/guides`.cwd(cwd);
await Bun.$`rm -rf content/docs/icons`.cwd(cwd);
await Bun.$`rm -rf content/docs/images`.cwd(cwd);
await Bun.$`rm -rf content/docs/snippets`.cwd(cwd);
await Bun.$`rm -rf content/docs/**/*.{css,png,svg,js}`.cwd(cwd);
await Bun.$`rm -rf content/docs/README.md content/docs/docs.json _content/docs/.prettierrc.json`.cwd(cwd);

await Bun.write(join(cwd, "content/docs/.gitignore"), ".*")
await Bun.write(join(cwd, "content/guides/.gitignore"), ".*")