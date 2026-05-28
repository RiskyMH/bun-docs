import type { MetadataRoute } from 'next'
import { execSync } from 'node:child_process';
import { source, blogs } from "@/lib/source";

export const dynamic = "force-static";

const canonical = 'https://bun-docs.vercel.app';

function buildGitLastModMap(): Map<string, Date> {
    try {
        const output = execSync(
            `git log --diff-filter=AM --pretty=format:"%ct" --name-only`,
            { encoding: 'utf-8', timeout: 30000 }
        );

        const map = new Map<string, Date>();
        let currentTs = 0;

        for (const line of output.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (/^\d+$/.test(trimmed)) {
                currentTs = parseInt(trimmed) * 1000;
            } else if (currentTs > 0 && !map.has(trimmed)) {
                map.set(trimmed, new Date(currentTs));
            }
        }

        return map;
    } catch {
        return new Map();
    }
}

export default function sitemap(): MetadataRoute.Sitemap {
    const gitModMap = buildGitLastModMap();

    const getLastMod = (absolutePath?: string): Date | undefined => {
        if (absolutePath && gitModMap.has(absolutePath)) {
            return gitModMap.get(absolutePath)!;
        }
    };

    const blogPages = blogs.getPages().map((page) => ({
        url: `${canonical}${page.url}`,
        lastModified: getLastMod(page.absolutePath) || (page.data.date ? new Date(page.data.date) : undefined),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [
        {
            url: canonical,
            // lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1,
        },
        ...blogPages,
    ];
}
