# Fumadocs Migration Guide

> A comprehensive guide documenting the migration of Bun documentation from Mintlify to Fumadocs, including all patterns, gotchas, and lessons learned.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Component Migrations](#component-migrations)
4. [Frontmatter Conventions](#frontmatter-conventions)
5. [Code Block Syntax](#code-block-syntax)
6. [Meta.json Configuration](#metajson-configuration)
7. [Common Pitfalls](#common-pitfalls)
8. [Build Process](#build-process)
9. [Dynamic Content](#dynamic-content)
10. [Version References](#version-references)

---

## Overview

### Migration Stats
- **Total Files Migrated**: 289 MDX files
  - 180 guides
  - 109 docs
- **Build Routes**: 887 static routes
- **Build Time**: ~5-6 seconds for full production build

### Key Differences: Mintlify → Fumadocs

| Feature | Mintlify | Fumadocs |
|---------|----------|----------|
| Callouts | `<Note>`, `<Warning>`, `<Tip>` | `<Callout type="info\|warning">` |
| Tabs | `<Tabs><Tab title="...">` | `<Tabs items={[...]}><Tab value="...">` |
| Code Groups | `<CodeGroup>` | Not needed (use tabs) |
| Icons in code | `icon="..."` attribute | `title="..."` attribute |
| Frames | `<Frame>` | Not available (remove) |
| Frontmatter | `title` + `sidebarTitle` | `title` + `fullTitle` |
| Navigation | `mint.json` | `meta.json` files + `source.config.ts` |

---

## Project Structure

```
fumadocs/
├── app/                          # Next.js app directory
│   ├── (docs)/
│   │   ├── docs/[[...slug]]/    # Main docs pages
│   │   ├── docs-md/[[...slug]]/ # Markdown output
│   │   └── docs.md/route.ts     # Markdown API
│   └── (home)/
│       ├── (blog)/
│       └── page.tsx
├── components/
│   ├── layout/                   # Layout components
│   │   ├── docs/                # Docs-specific layouts
│   │   └── home/                # Homepage layouts
│   └── ui/                      # Shared UI components
├── content/
│   ├── docs/                    # Documentation MDX files
│   │   ├── bundler/
│   │   ├── pm/
│   │   ├── runtime/
│   │   ├── test/
│   │   └── meta.json            # Root navigation config
│   ├── guides/                  # Guides MDX files
│   │   ├── binary/
│   │   ├── ecosystem/
│   │   ├── http/
│   │   └── meta.json
│   └── blog/
├── lib/
│   └── source.ts                # Source configuration
└── source.config.ts             # Fumadocs config
```

### Important Files

#### `source.config.ts`
- Defines documentation sources (docs, guides, blog)
- Configures file conventions
- Sets up icon mappings
- **CRITICAL**: Uses Lucide icon names (e.g., "Package", "Zap")

#### `content/*/meta.json`
- Defines navigation structure for each section
- Supports icons using `"icon": "IconName"` format
- Supports section headers with `"---[Icon] Title---"` format
- Must list all pages that should appear in navigation

---

## Component Migrations

### Callouts

#### Before (Mintlify)
```mdx
<Note>
This is an informational note.
</Note>

<Warning>
This is a warning!
</Warning>

<Tip>
This is a helpful tip.
</Tip>

<Info>
Additional information here.
</Info>
```

#### After (Fumadocs)
```mdx
<Callout type="info">
This is an informational note.
</Callout>

<Callout type="warning">
This is a warning!
</Callout>

<Callout type="info">
This is a helpful tip.
</Callout>

<Callout type="info">
Additional information here.
</Callout>
```

**Types Available**: `info`, `warning`, `error`, `success`

### Tabs

#### Before (Mintlify)
```mdx
<Tabs>
  <Tab title="npm">
    ```bash
    npm install bun
       ```
  </Tab>
  <Tab title="yarn">
    ```bash
    yarn add bun
       ```
  </Tab>
</Tabs>
```

#### After (Fumadocs)
```mdx
<Tabs items={['npm', 'yarn']}>
  <Tab value="npm">
    ```bash
    npm install bun
       ```
  </Tab>
  <Tab value="yarn">
    ```bash
    yarn add bun
       ```
  </Tab>
</Tabs>
```

**Key Changes**:
- Add `items={[...]}` array to `<Tabs>`
- Use `value="..."` instead of `title="..."` on `<Tab>`
- Value must match item in items array

### Steps

#### Before (Mintlify)
```mdx
<Steps>
  <Step title="First Step">
    Do this first
  </Step>
  <Step title="Second Step">
    Then do this
  </Step>
</Steps>
```

#### After (Fumadocs)
```mdx
<Steps>
<Step>

### First Step

Do this first

</Step>

<Step>

### Second Step

Then do this

</Step>
</Steps>
```

**Pattern**: Use `<Step>` wrapper with `###` headers inside. Each `<Step>` must have blank lines before/after the heading.

### Accordions

#### Before (Mintlify)
```mdx
<Accordion title="Click to expand">
Content here
</Accordion>

<AccordionGroup>
  <Accordion title="First">Content 1</Accordion>
  <Accordion title="Second">Content 2</Accordion>
</AccordionGroup>
```

#### After (Fumadocs)
```mdx
<Accordions>
<Accordion title="Click to expand">
Content here
</Accordion>
</Accordions>

<Accordions>
  <Accordion title="First">Content 1</Accordion>
  <Accordion title="Second">Content 2</Accordion>
</Accordions>
```

**Key Changes**: 
- `<AccordionGroup>` → `<Accordions>`
- **ALL** `<Accordion>` components must be wrapped in `<Accordions>`, even single accordions
- `<Accordions>` requires a `type` prop: `type="single"` or `type="multiple"`

### Cards

#### Before (Mintlify)
```mdx
<Card title="Card Title" icon="icon-name" href="/link">
  Card content
</Card>

<CardGroup cols={2}>
  <Card title="Card 1">Content 1</Card>
  <Card title="Card 2">Content 2</Card>
</CardGroup>
```

#### After (Fumadocs)
```mdx
<Card title="Card Title" href="/link">
  Card content
</Card>

<Cards>
  <Card title="Card 1">Content 1</Card>
  <Card title="Card 2">Content 2</Card>
</Cards>
```

**Changes**:
- `<CardGroup>` → `<Cards>`
- `cols` attribute not used (handled by CSS)
- Icons removed (not supported in Fumadocs Card)

### Removed Components

These Mintlify components have **no direct equivalent** in Fumadocs:

- `<Frame>` - Remove entirely, content displays as-is
- `<CodeGroup>` - Use `<Tabs>` instead
- `<Badge>` - Remove or use inline code/text
- Snippets (`<Snippet file="...">`) - Inline the content directly

---

## Frontmatter Conventions

### Standard Frontmatter

#### Before (Mintlify)
```yaml
---
title: How to use Bun.serve() to create an HTTP server
sidebarTitle: Bun.serve()
description: The Bun.serve API is designed for speed
---
```

#### After (Fumadocs)
```yaml
---
title: Bun.serve()
fullTitle: How to use Bun.serve() to create an HTTP server
description: The Bun.serve API is designed for speed
---
```

**Rules**:
- `title`: Short version (used in sidebar navigation)
- `fullTitle`: Long descriptive version (used in page header)
- `description`: SEO description
- If no `sidebarTitle` existed in Mintlify, no `fullTitle` needed

### Special Frontmatter Fields

```yaml
---
title: Installation
description: Install Bun on your system
icon: Download
---
```

**Available Fields**:
- `title`: Required
- `fullTitle`: Optional long title
- `description`: Recommended for SEO
- `icon`: Optional (uses Lucide icon name)
- `toc`: Optional, set to `false` to hide table of contents

---

## Code Block Syntax

> **⚠️ CRITICAL**: In Fumadocs, ANY text after the language identifier in a code fence MUST use the `title="..."` syntax. This includes filenames, labels like "Input"/"Output", and descriptive text. Failure to do this will cause rendering issues.

### Basic Code Blocks

#### Before (Mintlify)
```
```bash
bun install
`` `
```

#### After (Fumadocs)
```
```bash
bun install
`` `
```

**No change** for basic code blocks.

### Code Blocks with Icons/Titles

#### Before (Mintlify)
```
```bash icon="terminal"
bun install
`` `
```

#### After (Fumadocs)
```
```bash title="terminal"
bun install
`` `
```

**CRITICAL CHANGE**: `icon="..."` → `title="..."`

This was one of the most common issues. Fumadocs does not support `icon` attribute in code blocks.

### Code Blocks with Filenames

#### Before (Mintlify)
```
```typescript index.ts
const x = 1;
`` `
```

#### After (Fumadocs)
```
```typescript title="index.ts"
const x = 1;
`` `
```

**Pattern**: Use `title="filename"` for filenames

### Bash Commands with Output

**CRITICAL PATTERN**: When showing bash commands with their output, combine them in a single block with `$` prefix for commands:

#### Before (Separate blocks)
````
```bash terminal
bun run subscriber.ts
```

```txt
Received: Hello everyone!
```
````

#### After (Combined block)
````
```bash title="terminal"
$ bun run subscriber.ts
Received: Hello everyone!
```
````

**Pattern**: 
- Use a single code block with `title="terminal"`
- Prefix command lines with `$` 
- Output lines have no prefix
- This clearly distinguishes commands from their output

**Common examples**:
````
```bash title="terminal"
$ npm install
added 42 packages in 1.2s

$ bun --version
1.2.23

$ git status
On branch main
nothing to commit
```
````

### Code Blocks with Labels (Input/Output/Example)

This is a **VERY COMMON** pattern that MUST be converted:

#### Before (Original docs)
```
```ts Input
const x = 1;
`` `

```ts Output
const x=1;
`` `
```

#### After (Fumadocs)
```
```ts title="Input"
const x = 1;
`` `

```ts title="Output"
const x=1;
`` `
```

**CRITICAL**: Any text after the language identifier MUST use `title="..."` syntax.

Common labels to convert:
- `Input` → `title="Input"`
- `Output` → `title="Output"`
- `Example` → `title="Example"`
- `Before` → `title="Before"`
- `After` → `title="After"`

### Code Block Tabs (Simple)

For basic tabbed code blocks (like showing different files), use the `tab` attribute:

```
```ts tab="entry-a.ts"
export default function() {
  console.log('A');
}
`` `

```ts tab="entry-b.ts"
export default function() {
  console.log('B');
}
`` `
```

**Note**: You can combine `tab` and `title` if needed:
```
```ts tab="entry-a.ts" title="Entry Point A"
`` `
```

But often `tab` alone is sufficient for simple file tabs.

### Shared Tabs (Advanced)

For synchronized tabs across multiple sections (e.g., CLI commands that should sync with package manager choice), use the `<Tabs>` component with `groupId` and `persist`:

```mdx
<Tabs groupId="package-manager" persist>
  <Tab value="npm">
    ```bash
    npm install fumadocs
       ```
  </Tab>
  <Tab value="bun">
    ```bash
    bun add fumadocs
       ```
  </Tab>
</Tabs>
```

When user selects "bun" in one place, ALL tabs with `groupId="package-manager"` will switch to "bun" automatically!

**Pro tip**: Use this for:
- Package manager commands (npm/yarn/pnpm/bun)
- Framework variants (Next.js/Vite/etc.)
- Language examples (TypeScript/JavaScript)

**Example from bundler docs**: Multiple sections showing CLI vs JavaScript API - when user picks CLI, all examples show CLI across the page.

### Invalid Syntax Patterns

❌ **DO NOT USE**:
```
```ts#input.ts
```ts#filename.ts (with comment)
```bash icon="terminal"
```typescript icon="typescript.svg"
```ts Input                   ← Missing title=""
```bash Output                ← Missing title=""
```js Example                 ← Missing title=""
```ts highlight={8, 12-15}   ← Don't use highlight attribute

// Separate blocks for bash command and output
```bash terminal             ← Don't split command and output
bun install
`` `
```txt                       ← Don't use separate txt block
added 42 packages
`` `
```

✅ **CORRECT USAGE**:
```
```ts title="input.ts"
```ts title="filename.ts (with comment)"
```bash title="terminal"
```typescript title="index.ts"
```ts title="Input"
```bash title="Output"
```js title="Example"

// Use inline comments for highlighting
```ts title="s3.ts"
const endpoint = "https://..."; // [!code highlight]
`` `

// Combined bash with $ prefix for commands
```bash title="terminal"    ← Use single block with $ prefix
$ bun install
added 42 packages
`` `
```

### Code Highlighting

**IMPORTANT**: Fumadocs uses inline comment syntax for highlighting, NOT attributes in the code fence.

#### Before (Other systems)
```
```ts highlight={8, 12-15}
import { S3Client } from "bun";

const client = new S3Client({
  accessKeyId: "key",
  endpoint: "https://storage.googleapis.com", // This line should be highlighted
});
`` `
```

#### After (Fumadocs)
```
```ts title="s3.ts"
import { S3Client } from "bun";

const client = new S3Client({
  accessKeyId: "key",
  endpoint: "https://storage.googleapis.com", // [!code highlight]
});
`` `
```

**Pattern**: Add `// [!code highlight]` at the end of each line you want to highlight.

**Full example**:
```typescript title="example.ts"
function hello() {
  console.log("Hello"); // [!code highlight]
  console.log("World"); // [!code ++]
  console.log("Old");   // [!code --]
}
```

**Supported markers**:
- `// [!code highlight]` - Highlight line (yellow background)
- `// [!code ++]` - Added line (green, for diffs)
- `// [!code --]` - Removed line (red, for diffs)
- `// [!code focus]` - Focus on this line (dims others)
- `// [!code word:TextToHighlight]` - Highlight specific word/text inline

**Key differences from other systems**:
- ❌ Don't use `highlight={line numbers}` in code fence
- ❌ Don't use `icon="/icons/file.svg"` attributes
- ✅ Do use inline `// [!code highlight]` comments
- ✅ Do use `title="filename"` for file names

### Line Numbers

Add line numbers to code blocks:

````md
```ts lineNumbers
function example() {
  return true;
}
```
````

Or start from a specific number:

````md
```js lineNumbers=42
function main() {
  // This is line 42
  return 0;
}
```
````

### NPM Install Commands (Auto-convert)

Fumadocs automatically converts npm commands to all package managers:

````md
```npm
npm i fumadocs -D
```
````

This generates **synchronized tabs** for npm, pnpm, yarn, and bun automatically! The tabs persist across the site with `groupId="package-manager"`.

### Custom Heading Anchors

Customize heading IDs for cleaner links:

```md
## My Complex Heading With Lots of Words [#simple]
```

Link to it: `/page#simple` instead of `/page#my-complex-heading-with-lots-of-words`

You can chain with TOC settings:

```md
## Heading [toc] [#custom-id]
```

### TOC Control

Control what appears in the table of contents:

```md
# Hidden from TOC [!toc]

This heading won't appear in the sidebar TOC.

# Only in TOC [toc]

This heading ONLY appears in TOC, not rendered in content.
Useful for adding TOC structure for content rendered in components.
```

### Include Files

Reference content from other files (Fumadocs MDX only):

```mdx
<include>./shared-content.mdx</include>
```

**Use cases**:
- Reusing common content across pages
- Keeping large pages modular
- Sharing code examples between guides

---

## Meta.json Configuration

### Structure

```json
{
  "title": "Section Title",
  "description": "Section description",
  "root": true,
  "icon": "LucideIconName",
  "pages": [
    "---[Icon] Group Name---",
    "page-slug",
    "another-page",
    "---[AnotherIcon] Second Group---",
    "nested-page"
  ]
}
```

### Icon Format

Icons in `meta.json` use **Lucide icon names**:

```json
{
  "icon": "Package",
  "pages": [
    "---[Zap] Optimization---",
    "---[Binary] Executables---",
    "---[ArrowRight] Migration---"
  ]
}
```

**Common Icons**:
- `Package` - Core/bundling
- `Zap` - Performance/optimization
- `Monitor` - Development
- `Binary` - Executables
- `Plug` - Plugins/extensions
- `ArrowRight` - Migration
- `Terminal` - CLI
- `Image` - Assets
- `Server` - Runtime
- `Database` - Data
- `Network` - Networking
- `Sparkles` - Features

Find more: https://lucide.dev/icons/

### Nested Directories

For nested directories, create `meta.json` in each subdirectory:

```
content/docs/
├── meta.json           # Root navigation
├── bundler/
│   ├── meta.json       # Bundler section
│   ├── index.mdx
│   └── plugins.mdx
└── runtime/
    ├── meta.json       # Runtime section
    ├── index.mdx
    └── networking/
        ├── meta.json   # Networking subsection
        └── fetch.mdx
```

### Page Order

Pages appear in navigation **in the order listed** in `pages` array:

```json
{
  "pages": [
    "index",           // First
    "installation",    // Second
    "quickstart"       // Third
  ]
}
```

### Unlisted Pages

Files NOT in `meta.json` are still accessible but won't appear in navigation. Useful for:
- Draft pages
- Deep-linked content
- API-generated pages

---

## Common Pitfalls

### 1. Duplicate Files

**Issue**: Files with the same filename exist in different directories.

**Note**: Many duplicates are **intentional** and serve different purposes:
- `index.mdx` - Each section has its own index (normal)
- `docs/*/topic.mdx` vs `guides/*/topic.mdx` - Reference docs vs how-to guides
- `guides/category-a/topic.mdx` vs `guides/category-b/topic.mdx` - Different contexts

**Examples of intentional duplicates**:
- `docs/pm/cli/add.mdx` (CLI reference) vs `guides/install/add.mdx` (how-to guide)
- `guides/http/simple.mdx` (HTTP server) vs `guides/websocket/simple.mdx` (WebSocket server)
- `guides/read-file/stream.mdx` vs `guides/write-file/stream.mdx` (different operations)

**Check Command**:
```bash
# Find potential duplicates
find content -name "*.mdx" -type f | 
  xargs -I {} basename {} | 
  sort | 
  uniq -d
```

**Action**: Only remove duplicates if they have **identical content** and serve the same purpose. Most filename duplicates are intentional.

### 2. Icon Attribute in Code Blocks

**Issue**: Using `icon="..."` in code blocks causes build failure.

**Error**: `ShikiError: Language 'bash icon="terminal"' is not included`

**Fix**:
```bash
# Find all occurrences
rg 'icon="' content/ --glob '*.mdx'

# Replace with title
sed -i '' 's/icon="/title="/' file.mdx
```

### 3. Invalid Code Fence Syntax

**Issue**: Using `#` or other special syntax in code fences.

**Examples**:
```
```ts#input.ts        ❌
```bash#example       ❌
```js icon="file.svg" ❌
```

**Fix**:
```
```ts title="input.ts"     ✅
```bash title="example"    ✅
```js title="example.js"   ✅
```

### 4. Missing Title in Frontmatter

**Issue**: Using `name` instead of `title`.

**Error**: `invalid frontmatter: title: Invalid input: expected string, received undefined`

**Fix**:
```diff
---
- name: My Page
+ title: My Page
  description: Page description
---
```

### 5. Incorrect Tab Syntax

**Issue**: Using old `title` attribute on `<Tab>`.

**Error**: Tabs don't render or wrong tab selected.

**Fix**:
```mdx
<!-- Before -->
<Tabs>
  <Tab title="Option 1">Content</Tab>
</Tabs>

<!-- After -->
<Tabs items={['Option 1']}>
  <Tab value="Option 1">Content</Tab>
</Tabs>
```

### 6. Broken Internal Links

**Issue**: Links still point to old Mintlify structure.

**Examples**:
```mdx
[Link](/docs/runtime/spawn)  <!-- May be wrong -->
```

**Solution**: Verify all internal links after migration:
```bash
# Find all markdown links
rg '\[.*\]\(/.*\)' content/ --glob '*.mdx'

# Check if target exists
# Update to correct path
```

### 7. Missing Meta.json Entries

**Issue**: Page exists but doesn't appear in navigation.

**Symptom**: Page accessible via URL but not in sidebar.

**Fix**: Add page slug to `meta.json`:
```json
{
  "pages": [
    "existing-page",
    "new-page"  // Add this
  ]
}
```

### 8. Dynamic Version Replacement

**Feature**: The MDX parser automatically replaces `$BUN_LATEST_VERSION` with the actual version string.

**How it works**: A remark plugin in `source.config.ts` replaces all instances:
```typescript
tree.value.replaceAll(
  "$BUN_LATEST_VERSION",
  process.env.BUN_VERSION || "1.3.1"
);
```

**Usage**:
```bash
# In MDX files, use $BUN_LATEST_VERSION directly
bun install v$BUN_LATEST_VERSION
curl -fsSL https://bun.com/install | bash -s "bun-v$BUN_LATEST_VERSION"
```

**Result**: This gets replaced with the actual version (e.g., "1.3.1") during build.

**Note**: This is intentional behavior - do NOT escape the `$` sign when you want version replacement.

---

## Build Process

### Development Build

```bash
bun run dev
```

- Starts Next.js dev server on `http://localhost:3000`
- Hot reload enabled
- Faster builds (no optimization)
- Use for testing changes

### Production Build

```bash
bun run build
```

- Full static site generation
- 887 routes generated
- ~5-6 second build time
- Minified output

**Build Output**:
```
✓ Generating static pages (887/887) in 5.6s
Route (app)
├ ○ /
├ ● /blog/[[...slug]]
├ ● /docs/[[...slug]]
└ ○ /llms-full.txt
```

### Build Errors

#### Common Build Errors

**1. Invalid Frontmatter**
```
Error: invalid frontmatter in file.mdx:
- title: Invalid input: expected string, received undefined
```
**Fix**: Ensure `title` field exists in frontmatter.

**2. Unknown Language**
```
ShikiError: Language 'ts#input.ts' is not included
```
**Fix**: Remove `#` or `icon=` from code fence, use `title=` instead.

**3. Import Error**
```
Error: Cannot find module '@/components/Card'
```
**Fix**: Check component import paths, ensure component exists.

**4. MDX Syntax Error**
```
Error: Unexpected character
```
**Fix**: Check for unescaped JSX characters (`<`, `>`, `{`, `}`) in content.

### Pre-build Checklist

Before running build:

- [ ] All `icon="..."` replaced with `title="..."` in code blocks
- [ ] **All code block labels use `title=""` syntax** (Input, Output, Example, etc.)
- [ ] **Bash commands use single block with `$` prefix** (not separate command + txt blocks)
- [ ] All frontmatter has `title` field
- [ ] No `ts#filename` or similar syntax in code fences
- [ ] All `<Tab>` components use `value` not `title`
- [ ] All `<Tabs>` have `items` array
- [ ] All pages listed in appropriate `meta.json`
- [ ] No duplicate files across docs/guides
- [ ] Internal links point to correct paths

**Quick validation**:
```bash
# This should return 0 results (checks for labels without title="")
rg '```[a-z]+ [A-Z]' content/ --glob '*.mdx'

# Check for separated bash/txt blocks that should be combined
rg -U '```bash.*\n.*\n```\n\n```txt' content/ --glob '*.mdx'
```

---

## Dynamic Content

### Guides Index Page

Location: `content/guides/index.mdx`

This page **dynamically generates** its content by:
1. Reading directory structure with `fs.readdirSync()`
2. Parsing frontmatter from guide files
3. Rendering category sections with cards

**Key Pattern**:
```mdx
export const categories = fs
  .readdirSync(path.join(process.cwd(), 'content/guides'))
  .filter(...)
  .map(categoryDir => {
    const guides = fs.readdirSync(...)
      .map(file => {
        const frontmatter = parseFrontmatter(content);
        return { ...frontmatter, slug };
      })
      .sort((a, b) => a.fullTitle.localeCompare(b.fullTitle));
    
    return { name, guides };
  });
```

**Frontmatter Parsing**:
```javascript
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return {};
  
  const frontmatterText = match[1];
  const lines = frontmatterText.split('\n');
  const frontmatter = {};
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  });
  
  return frontmatter;
}
```

**Important**: 
- Only parses frontmatter between `---` markers
- Does NOT parse YAML libraries (lighter weight)
- Categories use `fullTitle` for sorting
- Directory names become category headers

### Blog Index

Similar pattern but for blog posts in `content/blog/`.

---

## Version References

### The `$BUN_LATEST_VERSION` Pattern

Throughout docs, version numbers are referenced as:
```bash
bun install v$BUN_LATEST_VERSION
```

**DO NOT** hard-code version numbers like:
```bash
bun install v1.3.1  ❌
```

**Why**:
- Versions change frequently
- Environment variable pattern allows global updates
- Documentation stays evergreen

### Finding Version References

```bash
# Find hardcoded versions
rg '\b1\.\d+\.\d+\b' content/ --glob '*.mdx'

# Find version patterns
rg 'bun.*v\d+\.\d+\.\d+' content/ --glob '*.mdx'
```

### Acceptable Hardcoded Versions

Version numbers are acceptable when:
- Part of historical examples
- Showing upgrade paths
- Documentation for specific version features
- In code comments

**Example**:
```typescript
// Requires Bun v1.0.0+
if (Bun.version >= '1.0.0') {
  // use new API
}
```

---

## Migration Checklist

Use this checklist when migrating new content:

### Pre-Migration
- [ ] Identify source files (Mintlify structure)
- [ ] Determine target location (docs/ or guides/)
- [ ] Check for duplicates
- [ ] Review current meta.json structure

### Content Migration
- [ ] Copy MDX file to target location
- [ ] Convert frontmatter (`sidebarTitle` → `fullTitle`, `title` → `title`)
- [ ] Replace all `<Note>` → `<Callout type="info">`
- [ ] Replace all `<Warning>` → `<Callout type="warning">`
- [ ] Replace all `<Tip>` → `<Callout type="info">`
- [ ] Convert `<Tabs>` syntax (add `items`, change `title` to `value`)
- [ ] Convert `<Steps>` (use `###` headers)
- [ ] Convert `<AccordionGroup>` → `<Accordions>`
- [ ] Convert `<CardGroup>` → `<Cards>`
- [ ] Remove `<Frame>` components
- [ ] Remove `<Badge>` components
- [ ] Replace snippets with inline content
- [ ] Fix code block syntax (`icon=` → `title=`)
- [ ] Remove `#` syntax from code fences
- [ ] Verify internal links
- [ ] Check image paths

### Post-Migration
- [ ] Add page to `meta.json`
- [ ] Run `bun run dev` and test page
- [ ] Check navigation appears correctly
- [ ] Verify all components render
- [ ] Test all links work
- [ ] Run `bun run build` successfully
- [ ] Verify no build errors
- [ ] Check final route count increased

---

## Quick Reference Commands

### Search & Replace Patterns

```bash
# Find all icon attributes in code blocks
rg 'icon="' content/ --glob '*.mdx'

# Replace icon with title
find content -name "*.mdx" -exec sed -i '' 's/icon="/title="/g' {} +

# Find invalid code fence syntax
rg '```\w+#' content/ --glob '*.mdx'

# Find code blocks with labels but no title="" syntax (CRITICAL)
rg '```[a-z]+ [A-Z]' content/ --glob '*.mdx'

# Fix Input/Output labels
find content -name "*.mdx" -exec sed -i '' 's/```\([a-z]*\) Input/```\1 title="Input"/g' {} +
find content -name "*.mdx" -exec sed -i '' 's/```\([a-z]*\) Output/```\1 title="Output"/g' {} +

# Find separated bash/txt blocks that should be combined
rg -U '```bash.*\n.*\n```\n\n```txt' content/ --glob '*.mdx'

# Find bash blocks without $ prefix (potential command blocks)
rg '```bash title="terminal"\n[^$]' content/ --glob '*.mdx'

# Find code blocks with highlight attribute (should use inline comments)
rg 'highlight=\{' content/ --glob '*.mdx'

# Find icon attributes in code fences
rg '```[a-z]+ .* icon=' content/ --glob '*.mdx'

# Find old callout syntax
rg '<Note>|<Warning>|<Tip>|<Info>' content/ --glob '*.mdx'

# Find old tab syntax
rg '<Tab title=' content/ --glob '*.mdx'

# Find hardcoded versions
rg 'v\d+\.\d+\.\d+' content/ --glob '*.mdx'

# Find missing frontmatter titles
rg -U '(?s)^---.*\n(?!.*title:).*---' content/ --glob '*.mdx'
```

### File Operations

```bash
# Count total MDX files
find content -name "*.mdx" | wc -l

# List all meta.json files
find content -name "meta.json"

# Find orphaned files (not in any meta.json)
# (requires custom script)

# Check for duplicate filenames
find content -name "*.mdx" -type f | 
  xargs -I {} basename {} | 
  sort | uniq -d
```

### Build Commands

```bash
# Development
bun run dev

# Production build
bun run build

# Check build output
bun run build 2>&1 | grep "Generating static pages"

# Count generated routes
bun run build 2>&1 | grep -oE '\([0-9]+/[0-9]+\)' | tail -1
```

---

## Testing Strategy

### Manual Testing Checklist

For each migrated page:

1. **Navigation**
   - [ ] Page appears in sidebar
   - [ ] Title is correct
   - [ ] Icon displays (if specified)
   - [ ] Position in menu is correct

2. **Content**
   - [ ] All callouts render correctly
   - [ ] All tabs work and switch properly
   - [ ] All code blocks have proper syntax highlighting
   - [ ] All links are clickable and point to correct pages
   - [ ] All images load
   - [ ] All components render without errors

3. **Functionality**
   - [ ] Table of contents generates correctly
   - [ ] Search finds the page
   - [ ] Mobile layout works
   - [ ] Dark/light mode works

### Automated Testing

```bash
# Build test
bun run build

# Should output something like:
# ✓ Generating static pages (887/887) in 5.6s

# Link checking (requires custom script)
# Check all internal links resolve

# Component usage audit
rg '<Callout' content/ --glob '*.mdx' | wc -l
rg '<Tabs' content/ --glob '*.mdx' | wc -l
rg '<Card' content/ --glob '*.mdx' | wc -l
```

---

## Best Practices

### 1. Always Use Frontmatter Correctly

```yaml
---
title: Short Title          # Required, used in navigation
fullTitle: Long Title       # Optional, used in header
description: SEO desc       # Recommended
---
```

### 2. Prefer Guides Over Docs for Specific Topics

**Docs** = Broad reference material
**Guides** = Specific how-to content

Example:
- ❌ `docs/runtime/http-server.mdx` (too specific)
- ✅ `guides/http/simple-server.mdx` (clear how-to)

### 3. Keep Meta.json Organized

Use section headers for logical grouping:

```json
{
  "pages": [
    "---[Package] Core Features---",
    "feature-1",
    "feature-2",
    "---[Zap] Performance---",
    "optimization-1",
    "optimization-2"
  ]
}
```

### 4. Use Consistent Code Block Titles

```mdx
<!-- Consistent pattern for file names -->
```typescript title="index.ts"
```bash title="terminal"
```json title="package.json"

<!-- Consistent pattern for descriptions -->
```bash title="Install dependencies"
```bash title="Start dev server"
```

### 5. Always Combine Bash Commands with Output

**DON'T** separate commands and output:
```mdx
<!-- ❌ Avoid this -->
```bash title="terminal"
bun install
`` `

```txt
added 42 packages
`` `
```

**DO** combine them with `$` prefix:
```mdx
<!-- ✅ Do this -->
```bash title="terminal"
$ bun install
added 42 packages
`` `
```

**Benefits**:
- Clearer association between command and output
- Easier to copy commands (users know `$` is not part of command)
- Consistent with terminal conventions
- Single code block is easier to maintain

### 6. Test Locally Before Committing

```bash
# Always run before committing
bun run build

# Should complete without errors
# Should show expected route count
```

### 6. Document Special Cases

If a page has unusual requirements, add comments:

```mdx
---
title: Special Page
---

{/* This page uses dynamic content - do not migrate syntax */}

export const data = ...
```

### 7. Keep Internal Links Relative

```mdx
<!-- Good -->
[See installation](/docs/installation)
[API Reference](/docs/runtime/api)

<!-- Avoid absolute URLs -->
[Link](https://bun.sh/docs/installation)
```

---

## Troubleshooting

### Build Fails with "Language not included"

**Cause**: Invalid code fence syntax

**Fix**: Check all code blocks, replace `icon=` with `title=`:
```bash
rg 'icon="' content/ --glob '*.mdx'
find content -name "*.mdx" -exec sed -i '' 's/icon="/title="/g' {} +
```

### Code Blocks Not Rendering Properly

**Cause**: Missing `title=""` syntax for labels like Input/Output/Example

**Symptoms**: 
- Build may succeed but code blocks look wrong
- Labels appear as plain text
- Syntax highlighting broken

**Diagnosis**:
```bash
# Find all instances
rg '```[a-z]+ [A-Z]' content/ --glob '*.mdx'
```

**Fix**:
```bash
# Fix Input/Output patterns
sed -i '' 's/```\([a-z]*\) Input/```\1 title="Input"/g' file.mdx
sed -i '' 's/```\([a-z]*\) Output/```\1 title="Output"/g' file.mdx

# Or fix all at once
find content -name "*.mdx" -exec sed -i '' 's/```\([a-z]*\) Input/```\1 title="Input"/g' {} +
find content -name "*.mdx" -exec sed -i '' 's/```\([a-z]*\) Output/```\1 title="Output"/g' {} +
```

**Common patterns to fix**:
- ` Input` → ` title="Input"`
- ` Output` → ` title="Output"`
- ` Example` → ` title="Example"`
- ` Before` → ` title="Before"`
- ` After` → ` title="After"`

### Bash Commands and Output Separated

**Cause**: Using separate code blocks for bash commands and their output

**Symptoms**:
- Bash command in one block, output in a `txt` block below
- Harder to read and doesn't follow convention
- Output not clearly associated with command

**Example Problem**:
```mdx
```bash terminal
bun run dev
`` `

```txt
Server started on port 3000
`` `
```

**Fix**: Combine into single block with `$` prefix for commands:
```mdx
```bash title="terminal"
$ bun run dev
Server started on port 3000
`` `
```

**Pattern**:
- Command lines start with `$`
- Output lines have no prefix
- Use single code block with `title="terminal"`

**Find instances**:
```bash
rg -U '```bash.*\n.*\n```\n\n```txt' content/ --glob '*.mdx'
```

### Page Not Appearing in Navigation

**Cause**: Missing from `meta.json`

**Fix**: Add to appropriate `meta.json`:
```json
{
  "pages": [
    "existing-page",
    "your-page"
  ]
}
```

### Components Not Rendering

**Cause**: Old Mintlify syntax

**Fix**: Check syntax guide above, replace with Fumadocs equivalents.

### Build is Slow

**Causes**:
- Too many routes
- Large files
- Complex dynamic content

**Solutions**:
- Use `bun run dev` during development
- Optimize images
- Reduce dynamic content processing

### Links Break After Migration

**Cause**: File moved to different location

**Fix**:
1. Find all references to old path
2. Update to new path
3. Consider adding redirects in Next.js config

```bash
# Find all references
rg '/old/path' content/ --glob '*.mdx'
```

---

## Summary

### Key Takeaways

1. **Component Mapping**: Mintlify → Fumadocs has clear 1:1 mappings
2. **Code Blocks**: Always use `title=` never `icon=`
3. **Frontmatter**: `title` + `fullTitle` pattern
4. **Navigation**: Explicit via `meta.json` files
5. **Build Check**: Always run `bun run build` before committing

### Success Metrics

- ✅ 887 routes generated
- ✅ 289 MDX files migrated
- ✅ 0 build errors
- ✅ All pages navigable
- ✅ All components render correctly

### Future Additions

When adding new documentation:

1. Choose location (docs vs guides)
2. Create MDX with proper frontmatter
3. Add to meta.json
4. Use Fumadocs component syntax
5. Test locally with `bun run dev`
6. Build with `bun run build`
7. Verify in production

---

## Additional Resources

- [Fumadocs Documentation](https://fumadocs.vercel.app)
- [Lucide Icons](https://lucide.dev/icons/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [MDX Documentation](https://mdxjs.com/)

---

**Last Updated**: October 24, 2024  
**Migration Status**: Complete ✅  
**Total Routes**: 887
