<div align="center">
  <a href="https://bun.com">
		<img src="https://github.com/user-attachments/assets/50282090-adfd-4ddb-9e27-c30753c6b161" alt="Logo" height="170" />
	</a>
</div>
<h1 align="center">Bun Documentation</h1>

Alternative documentation for Bun: the fast, all-in-one JavaScript runtime.

Official is https://bun.com/docs (mintlify)

This is https://bun-docs.vercel.app/docs (fumadocs)

## Development

```sh
$ bun dev
```

Open http://localhost:3000 with your browser to see the result.

## Contributing

For most documentation changes, **contribute upstream** at [Bun Docs](https://github.com/oven-sh/bun/tree/main/docs).
- If your change applies **generally to the docs (not specific to this fork)**, submit it upstream.
- If your change is **specific to this fork** (e.g. migration fixes, custom features, metadata edge cases), update `manual-fixes.patch` so your fix persists after future syncs:
  - After making your changes locally and running the migration, re-generate the patch: `git add . && bun sync-docs:save`
  - This ensures any non-standard or custom doc changes survive future doc syncs.

## Extra info

TODO:
* full metadata of what og (both custom docs & mintlify one) had
* if subdir and no page that level, redirect to first child page (ie /guides/ecosystem -> /guides/ecosystem/astro)
