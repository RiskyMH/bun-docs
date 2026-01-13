

await Bun.$`rm -rf app/api && STATIC_EXPORT=1 bun run build && git restore app/api`;

/// 

import nextConfig from '../next.config.mjs';

let _redirectsFile = ""

const rewritess = nextConfig.rewrites ? await nextConfig.rewrites() : [];
if (Array.isArray(rewritess)) {
    for (const rewrite of rewritess) {
        _redirectsFile += `${rewrite.source}  ${rewrite.destination}  200\n`;
    }
} else if (rewritess && typeof rewritess === 'object') {
    for (const rewrite of rewritess.beforeFiles || []) {
        _redirectsFile += `${rewrite.source}  ${rewrite.destination}  200\n`;
    }
    for (const rewrite of rewritess.afterFiles || []) {
        _redirectsFile += `${rewrite.source}  ${rewrite.destination}  200\n`;
    }
    for (const rewrite of rewritess.fallback || []) {
        _redirectsFile += `${rewrite.source}  ${rewrite.destination}  200\n`;
    }
}

const redirectss = nextConfig.redirects ? await nextConfig.redirects() : [];
for (const redirect of redirectss) {
    // can't be bothered to deal with this rn
    if (redirect.has) continue;
    const statusCode = redirect.statusCode || redirect.permanent === false ? 302 : 301;
    _redirectsFile += `${redirect.source}  ${redirect.destination}  ${statusCode}\n`;
}

await Bun.write('./out/_redirects', _redirectsFile);

