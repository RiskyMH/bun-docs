import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();


const llmAcceptedHeaders = "(?=.*(?:text/plain|text/markdown))(?!.*text/html.*(?:text/plain|text/markdown)).*";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
    // inlineCss: true,
    turbopackImportTypeBytes: true,
  },
  reactCompiler: true,
  assetPrefix: "/docs",
  // output: "export",
  transpilePackages: ['react-tweet'],
  rewrites: async () => {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/docs-md/:path*',
      },
      {
        source: '/guides/:path*.md',
        destination: '/docs-md/guides/:path*',
      },
      // {
      //   source: '/guides/:path*',
      //   destination: '/docs/guides/:path*',
      // },
      {
        source: '/blog/:path*.md',
        destination: '/blog-md/:path*',
      },
      {
        source: '/feedback',
        destination: '/docs/feedback',
      },
      {
        source: '/feedback.md',
        destination: '/docs-md/feedback',
      },
      {
        source: '/llm.txt',
        destination: '/llms.txt',
      },
      {
        source: '/reference',
        destination: 'https://site-oven.vercel.app/reference',
      },
      {
        source: '/reference/:path*',
        destination: 'https://site-oven.vercel.app/reference/:path*',
      },
      {
        source: '/install.sh',
        destination: 'https://raw.githubusercontent.com/oven-sh/bun/refs/heads/main/src/cli/install.sh'
      },
      {
        source: '/install.ps1',
        destination: 'https://raw.githubusercontent.com/oven-sh/bun/refs/heads/main/src/cli/install.ps1'
      },
      {
        source: '/install',
        destination: 'https://raw.githubusercontent.com/oven-sh/bun/refs/heads/main/src/cli/install.sh'
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: '/docs/guides/:path*',
        destination: '/guides/:path*',
        permanent: true,
      },
      {
        source: '/docs/feedback',
        destination: '/feedback',
        permanent: true,
      },
      {
        source: '/docs/project/feedback',
        destination: '/feedback',
        permanent: true,
      },
      {
        source: '/docs/pm',
        destination: '/docs/pm/install',
        permanent: true,
      },
      {
        source: '/docs/runtime/typescript',
        destination: '/docs/typescript',
        permanent: true,
      },
      ...["docs", "guides", "blog"].map(type => [
        {
          source: `/${type}/llms.txt`,
          destination: `/${type}.md`,
          permanent: true,
        }, {
          source: `/${type}/llm.txt`,
          destination: `/${type}.md`,
          permanent: true,
        }]
      ).flat(),
      ...["docs", "guides", "blog"].map(type => ({
        source: `/${type}`,
        destination: `/${type}.md`,
        permanent: false,
        has: [
          {
            type: "header",
            key: "accept",
            value: llmAcceptedHeaders,
          }
        ]
      })),
      ...[["docs", "docs-md"], ["guides", "docs-md/guides"], ["blog", "blog-md"]].map(([type, destination]) => ({
        source: `/${type}/:path*`,
        destination: `/${destination}/:path*`,
        permanent: false,
        has: [
          {
            type: "header",
            key: "accept",
            value: llmAcceptedHeaders,
          }
        ]
      })),
      {
        source: "/docs-md/docs/:path*",
        destination: "/docs-md/:path*",
        permanent: false,
      },
      {
        source: '/docs/images/:path*',
        destination: '/images/:path*',
        permanent: false,
      },
      ...Object.entries(permanentRedirects).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
  "headers": () => [
    {
      "source": "/install.sh",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain;charset=utf-8"
        },
        {
          "key": "Content-Disposition",
          "value": "inline"
        }
      ]
    },
    {
      "source": "/install",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain;charset=utf-8"
        },
        {
          "key": "Content-Disposition",
          "value": "inline"
        }
      ]
    },
    {
      "source": "/install.ps1",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain;charset=utf-8"
        },
        {
          "key": "Content-Disposition",
          "value": "inline"
        }
      ]
    }
  ],
};

export default withMDX(config);



const permanentRedirects = {
  "/download": "/get",
  "/1.3": "/blog/bun-v1.3",
  "/blog/bun-v1.3.0": "/blog/bun-v1.3",
  "/blog/bun-v1.2.0": "/blog/bun-v1.2",
  "/blog/bun-v1.1.0": "/blog/bun-v1.1",
  "/blog/release-notes/bun-v1.1.36": "/blog/release-notes/bun-v1.1.35",
  "/blog/release-notes/bun-v1.1.24": "/blog/release-notes/bun-v1.1.23",
  "/blog/release-notes/bun-v1.1.20": "/blog/release-notes/bun-v1.1.19",
  "/blog/release-notes/bun-v1.1.12": "/blog/release-notes/bun-v1.1.11",
  "/blog/release-notes/bun-v1.1.15": "/blog/release-notes/bun-v1.1.14",
  "/blog/release-notes/bun-v1.0.35": "/blog/release-notes/bun-v1.0.34",
  "/issues": "https://github.com/oven-sh/bun/issues",
  "/careers": "https://apply.workable.com/bun/",
  "/jobs": "https://apply.workable.com/bun/",
  "/discord": "https://discord.gg/bun-876711213126520882",
  "/docs/ecosystem/awesome": "https://github.com/oven-sh/awesome-bun",
  "/docs/project/profiling": "/docs/project/benchmarking",
  "/docs/project/developing": "/docs/project/development",
  "/docs/ecosystem/nodejs": "/docs/runtime/nodejs-apis",
  "/docs/ecosystem/typescript": "/docs/runtime/typescript",
  "/docs/templates": "/docs/cli/bun-create",
  "/docs/project/configuration": "/docs/runtime/configuration",
  "/docs/bundler/migration": "/docs/bundler/vs-esbuild",
  "/docs/cli/build": "/docs/bundler",
  "/docs/test/extending": "/docs/test/lifecycle",
  "/docs/ecosystem/:slug": "/docs/guides/ecosystem/:slug",
  "/live": "https://twitter.com/jarredsumner",
  "/windows": "/docs/installation#windows",
  "/nodejs": "/docs/runtime/nodejs-apis",
  "/1.0": "/blog/bun-v1.0",
  "/at-work": "https://forms.gle/VQesejrFZ4YC7xAv9",
  "/docs/runtime/configuration": "/docs/runtime/bunfig",
  "/docs/project/development": "/docs/project/contributing",
  "/docs/install/utilities": "/docs/cli/pm",
  "/:path*/.md": "/:path*.md",
  "/docs/api/binary-data": "/docs/runtime/binary-data",
  "/docs/api/cc": "/docs/runtime/c-compiler",
  "/docs/api/color": "/docs/runtime/color",
  "/docs/api/console": "/docs/runtime/console",
  "/docs/api/cookie": "/docs/runtime/cookies",
  "/docs/api/dns": "/docs/runtime/networking/dns",
  "/docs/api/fetch": "/docs/runtime/networking/fetch",
  "/docs/api/ffi": "/docs/runtime/ffi",
  "/docs/api/file-io": "/docs/runtime/file-io",
  "/docs/api/file-system-router": "/docs/runtime/file-system-router",
  "/docs/api/file": "/docs/runtime/file-io",
  "/docs/api/glob": "/docs/runtime/glob",
  "/docs/api/globals": "/docs/runtime/globals",
  "/docs/api/hashing": "/docs/runtime/hashing",
  "/docs/api/html-rewriter": "/docs/runtime/html-rewriter",
  "/docs/api/http": "/docs/runtime/http/server",
  "/docs/api/import-meta": "/docs/runtime/globals",
  "/docs/api/node-api": "/docs/runtime/node-api",
  "/docs/api/redis": "/docs/runtime/redis",
  "/docs/api/s3": "/docs/runtime/s3",
  "/docs/api/secrets": "/docs/runtime/secrets",
  "/docs/api/semver": "/docs/runtime/semver",
  "/docs/api/spawn": "/docs/runtime/child-process",
  "/docs/api/sql": "/docs/runtime/sql",
  "/docs/api/sqlite": "/docs/runtime/sqlite",
  "/docs/api/streams": "/docs/runtime/streams",
  "/docs/api/tcp": "/docs/runtime/networking/tcp",
  "/docs/api/transpiler": "/docs/runtime/transpiler",
  "/docs/api/udp": "/docs/runtime/networking/udp",
  "/docs/api/utils": "/docs/runtime/utils",
  "/docs/api/websockets": "/docs/runtime/http/websockets",
  "/docs/api/workers": "/docs/runtime/workers",
  "/docs/api/yaml": "/docs/runtime/yaml",
  "/docs/cli/add": "/docs/pm/cli/add",
  "/docs/cli/bun-completions": "/docs/runtime",
  "/docs/cli/bun-create": "/docs/runtime",
  "/docs/cli/bun-install": "/docs/pm/cli/install",
  "/docs/cli/bun-upgrade": "/docs/install",
  "/docs/cli/bunx": "/docs/pm/bunx",
  "/docs/cli/filter": "/docs/pm/filter",
  "/docs/cli/info": "/docs/pm/cli/pm",
  "/docs/cli/init": "/docs/runtime",
  "/docs/cli/install": "/docs/pm/cli/install",
  "/docs/cli/link": "/docs/pm/cli/link",
  "/docs/cli/outdated": "/docs/pm/cli/outdated",
  "/docs/cli/patch-commit": "/docs/pm/cli/patch",
  "/docs/cli/pm": "/docs/pm/cli/pm",
  "/docs/cli/publish": "/docs/pm/cli/publish",
  "/docs/cli/remove": "/docs/pm/cli/remove",
  "/docs/cli/run": "/docs/runtime",
  "/docs/cli/test": "/docs/test",
  "/docs/cli/unlink": "/docs/pm/cli/link",
  "/docs/cli/update": "/docs/pm/cli/update",
  "/docs/cli/why": "/docs/pm/cli/why",
  "/docs/install/audit": "/docs/pm/cli/audit",
  "/docs/install/cache": "/docs/pm/global-cache",
  "/docs/install/catalogs": "/docs/pm/catalogs",
  "/docs/install/isolated": "/docs/pm/isolated-installs",
  "/docs/install/lifecycle": "/docs/pm/lifecycle",
  "/docs/install/lockfile": "/docs/pm/lockfile",
  "/docs/install/npmrc": "/docs/pm/npmrc",
  "/docs/install/overrides": "/docs/pm/overrides",
  "/docs/install/patch": "/docs/pm/cli/patch",
  "/docs/install/registries": "/docs/pm/scopes-registries",
  "/docs/install/security-scanner-api": "/docs/pm/security-scanner-api",
  "/docs/install/workspaces": "/docs/pm/workspaces",
  "/docs/runtime/autoimport": "/docs/runtime/auto-install",
  "/docs/runtime/env": "/docs/runtime/environment-variables",
  "/docs/runtime/hot": "/docs/runtime/watch-mode",
  "/docs/runtime/loaders": "/docs/runtime/file-types",
  "/docs/runtime/modules": "/docs/runtime/module-resolution",
  "/docs/runtime/nodejs-apis": "/docs/runtime/nodejs-compat",
  "/docs/test/coverage": "/docs/test/code-coverage",
  "/docs/test/hot": "/docs/test",
  "/docs/test/time": "/docs/test/dates-times",
  "/docs/test/writing": "/docs/test/writing-tests",
  "/docs/bundler/css_modules": "/docs/bundler/css",
  "/docs/bundler/hmr": "/docs/bundler/hot-reloading",
  "/docs/bundler/html": "/docs/bundler/html-static",
  "/docs/bundler/intro": "/docs/bundler",
  "/docs/bundler/vs-esbuild": "/docs/bundler/esbuild",
  "/docs/project/licensing": "/docs/project/license",
  "/docs/benchmarks": "/docs",
  "/docs/contributing/upgrading-webkit": "/docs/contributing",
  "/docs/ecosystem/elysia": "/docs/guides/ecosystem/elysia",
  "/docs/ecosystem/express": "/docs/guides/ecosystem/express",
  "/docs/ecosystem/hono": "/docs/guides/ecosystem/hono",
  "/docs/ecosystem/react": "/docs/guides/ecosystem/react",
  "/docs/ecosystem/stric": "/docs/guides/ecosystem/stric"

}