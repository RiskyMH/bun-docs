# Documentation Sync Workflow

This repository maintains a custom fork of Bun's documentation, converted from Mintlify to Fumadocs format.

## Syncing with Bun Upstream

To sync with the latest Bun documentation:

```bash
bun run sync-docs
```

This command:
1. Pulls the latest docs from Bun's repository
2. Runs the migration script to convert Mintlify → Fumadocs
3. Applies `manual-fixes.patch` to preserve our customizations

**Expected Result**: Zero diffs unless Bun upstream has made actual changes to their docs.

## How It Works

The migration script (`migrate-docs.ts`) converts:
- Mintlify `<Tab title="...">` → Fumadocs `<Tab value="...">`  
- `<CodeGroup>` → `<Tabs>` (for JS/CLI pairs) or `tab=` attributes
- Terminal commands get `$` prompts
- Bun source typos are fixed
- And many more transformations...

The `manual-fixes.patch` file contains differences between what the migration produces and our preferred format. It's automatically applied to maintain consistency with our existing docs until Bun upstream changes.

## When Bun Updates Their Docs

If Bun makes upstream changes, you'll see diffs after running `sync-docs`. Review these diffs:
- **Legitimate updates**: Accept them and regenerate the patch
- **Formatting only**: Keep the patch as-is

## Regenerating the Patch

If you've made intentional changes to the docs and want to update the patch:

```bash
git restore content/
bun run pull-docs
bun run migrate-docs  
git diff content/ > manual-fixes.patch
git add manual-fixes.patch
git commit -m "Update manual-fixes.patch"
```

## Migration Script Improvements

The migration script is continuously improved to reduce diffs. See commit history for details on what's been fixed.
