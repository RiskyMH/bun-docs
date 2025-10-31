#!/usr/bin/env bun
/**
 * Comprehensive Bun Docs Migration Script v3
 * 
 * NOW WITH PROPER CODEGROUP→TAB HANDLING
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface Stats {
  filesProcessed: number;
  filesModified: number;
  transformationsApplied: Record<string, number>;
  warnings: string[];
}

const stats: Stats = {
  filesProcessed: 0,
  filesModified: 0,
  transformationsApplied: {},
  warnings: [],
};

function incrementStat(name: string) {
  stats.transformationsApplied[name] = (stats.transformationsApplied[name] || 0) + 1;
}

function addWarning(file: string, message: string) {
  stats.warnings.push(`${file}: ${message}`);
}

/**
 * Transform frontmatter
 */
function transformFrontmatter(content: string, isGuide: boolean): string {
  let modified = content;
  
  const frontmatterMatch = modified.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return content;

  const frontmatter = frontmatterMatch[1];
  let newFrontmatter = frontmatter;
  let changed = false;

  // Change name: to title:
  if (newFrontmatter.match(/^name:/m)) {
    newFrontmatter = newFrontmatter.replace(/^name:/m, "title:");
    changed = true;
    incrementStat("frontmatter-name-to-title");
  }

  // For guides: Keep fullTitle format (if it exists, don't change)
  // Only swap if using old sidebarTitle format
  if (isGuide && newFrontmatter.includes("sidebarTitle:") && !newFrontmatter.includes("fullTitle:")) {
    const titleMatch = newFrontmatter.match(/^title:\s*(.+)$/m);
    const sidebarTitleMatch = newFrontmatter.match(/^sidebarTitle:\s*(.+)$/m);
    
    if (titleMatch && sidebarTitleMatch) {
      const title = titleMatch[1].trim();
      const sidebarTitle = sidebarTitleMatch[1].trim();
      
      // Swap: title (long) becomes fullTitle, sidebarTitle (short) becomes title
      newFrontmatter = newFrontmatter.replace(/^title:\s*.+$/m, `title: ${sidebarTitle}`);
      newFrontmatter = newFrontmatter.replace(/^sidebarTitle:\s*.+$/m, `fullTitle: ${title}`);
      
      changed = true;
      incrementStat("frontmatter-guide-title-swap");
    }
  }
  
  // If already has fullTitle, keep it as-is (don't convert back)

  if (changed) {
    modified = modified.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${newFrontmatter}\n---`);
  }

  return modified;
}

/**
 * Handle CodeGroup → tab= conversion
 * This must run BEFORE other code fence transformations
 */
function handleCodeGroups(content: string): string {
  let modified = content;

  // Match CodeGroup blocks with surrounding whitespace
  const codeGroupRegex = /\n*<CodeGroup>\n*([\s\S]*?)\n*<\/CodeGroup>\n*/g;
  
  modified = modified.replace(codeGroupRegex, (_match: string, innerContent: string) => {
    incrementStat("codegroup-to-tabs");
    
    // Transform code blocks inside to use tab=
    let transformed = innerContent;
    
    // Pattern: ```lang filename icon="..."
    transformed = transformed.replace(
      /```(\w+)\s+([^\s]+)\s+icon="([^"]+)"/g,
      (_m: string, lang: string, filename: string, icon: string) => {
        incrementStat("codegroup-block-to-tab");
        // If icon was "terminal", add title="terminal" so prompt detection works
        if (icon === "terminal") {
          return `\`\`\`${lang} tab="${filename}" title="terminal"`;
        }
        return `\`\`\`${lang} tab="${filename}"`;
      }
    );
    
    // Pattern: ```lang title="filename" icon="..."
    transformed = transformed.replace(
      /```(\w+)\s+title="([^"]+)"\s+icon="[^"]+"/g,
      (_m: string, lang: string, filename: string) => {
        incrementStat("codegroup-title-to-tab");
        return `\`\`\`${lang} tab="${filename}"`;
      }
    );
    
    // Pattern: ```lang label (no icon, but inside CodeGroup)
    // This handles cases where CodeGroup has blocks without icon attributes
    transformed = transformed.replace(
      /```(\w+)\s+([^\n`]+?)\r?\n/g,
      (_m: string, lang: string, label: string) => {
        // Only convert if it doesn't already have tab= or title=
        if (label.includes('tab=') || label.includes('title=')) {
          return _m;
        }
        incrementStat("codegroup-label-to-tab");
        return `\`\`\`${lang} tab="${label.trim()}"\n`;
      }
    );
    
    // Don't wrap in Tabs - the tab= attributes work without a wrapper
    return `\n\n${transformed.trim()}\n\n`;
  });

  return modified;
}

/**
 * Detect if a string is a filename or a label
 */
function isFilename(str: string): boolean {
  if (/\.\w+$/.test(str)) return true;
  if (/^(Input|Output|Example|Usage|CLI|API|Terminal)/i.test(str)) return false;
  if (/^[a-z]/.test(str)) return true;
  if (str.includes("/")) return true;
  return false;
}

/**
 * Revert code fence attributes
 */
function revertCodeFences(content: string): string {
  let modified = content;

  // Pattern 0a: icon="..." before title="..." (reversed order)
  modified = modified.replace(
    /```(\w+)\s+icon="[^"]+"\s+title="([^"]+)"/g,
    (_match: string, lang: string, title: string) => {
      incrementStat("revert-icon-before-title");
      return `\`\`\`${lang} title="${title}"`;
    }
  );

  // Pattern 0b: Remove expandable attribute with icon (no title before it)
  modified = modified.replace(
    /```(\w+)\s+expandable\s+icon="[^"]+"/g,
    (_match: string, lang: string) => {
      incrementStat("revert-expandable-icon-removed");
      return `\`\`\`${lang}`;
    }
  );

  // Pattern 1: Remove icon when title already exists
  modified = modified.replace(
    /```(\w+)\s+title="([^"]+)"\s+icon="[^"]+"/g,
    (_match: string, lang: string, title: string) => {
      incrementStat("revert-remove-icon-from-title");
      return `\`\`\`${lang} title="${title}"`;
    }
  );

  // Pattern 2: filename="..." icon="..." (explicit filename attribute)
  modified = modified.replace(
    /```(\w+)\s+filename="([^"]+)"\s+icon="[^"]+"/g,
    (_match: string, lang: string, filename: string) => {
      incrementStat("revert-filename-attr-icon-to-title");
      return `\`\`\`${lang} title="${filename}"`;
    }
  );

  // Pattern 3: Filename with icon but no title wrapper
  modified = modified.replace(
    /```(\w+)\s+([^\s]+\.\w+)\s+icon="[^"]+"/g,
    (_match: string, lang: string, filename: string) => {
      incrementStat("revert-filename-icon-to-title");
      return `\`\`\`${lang} title="${filename}"`;
    }
  );

  // Pattern 4: Catch-all for any remaining icon attributes
  // This handles multi-word labels, special chars, etc.
  modified = modified.replace(
    /```(\w+)\s+(.+?)\s+icon="[^"]+"/g,
    (_match: string, lang: string, label: string) => {
      // Clean up the label (remove extra attributes if any)
      const cleanLabel = label.trim();
      incrementStat("revert-catchall-icon-to-title");
      return `\`\`\`${lang} title="${cleanLabel}"`;
    }
  );

  // Pattern 4a: Handle # separator syntax (e.g., ```ts#input.ts with --drop=assert)
  // Convert to title with metadata in comment or title
  modified = modified.replace(
    /```(\w+)#([^\s\n]+)(?:\s+(.+?))?\n/g,
    (_match: string, lang: string, filename: string, metadata: string | undefined) => {
      incrementStat("revert-hash-syntax-to-title");
      if (metadata) {
        // If there's metadata, put filename in title and metadata as comment on first line
        return `\`\`\`${lang} title="${filename}"\n// ${metadata}\n`;
      } else {
        return `\`\`\`${lang} title="${filename}"\n`;
      }
    }
  );

  // Pattern 4b: Plain filename without icon (e.g., ```ts script.ts)
  // Match: language + filename.ext on the same line as the fence
  // Use \n to ensure we only match the fence line, not content
  modified = modified.replace(
    /```(\w+)\s+([^\s"\n]+\.\w+)\n/g,
    (_match: string, lang: string, filename: string) => {
      incrementStat("revert-plain-filename-to-title");
      return `\`\`\`${lang} title="${filename}"\n`;
    }
  );

  // Pattern 5: Terminal blocks
  modified = modified.replace(
    /```(bash|sh|zsh)\s+terminal\s+icon="[^"]+"/g,
    (_match: string, shell: string) => {
      incrementStat("revert-terminal-fence");
      return `\`\`\`${shell} title="terminal"`;
    }
  );

  // Pattern 6: Terminal with icon first
  modified = modified.replace(
    /```(bash|sh|zsh)\s+icon="terminal"\s+terminal/g,
    (_match: string, shell: string) => {
      incrementStat("revert-terminal-fence-reversed");
      return `\`\`\`${shell} title="terminal"`;
    }
  );

  // Pattern 7: PowerShell
  modified = modified.replace(
    /```powershell\s+PowerShell\s+icon="[^"]+"/g,
    () => {
      incrementStat("revert-powershell-fence");
      return '```powershell title="PowerShell"';
    }
  );

  // Pattern 8: Docker
  modified = modified.replace(
    /```docker\s+Dockerfile\s+icon="[^"]+"/g,
    () => {
      incrementStat("revert-docker-fence");
      return '```docker title="Dockerfile"';
    }
  );

  // Pattern 9: icon directly after language (no label)
  // E.g., ```ts icon="file-code" or ```bash terminal icon="terminal"
  modified = modified.replace(
    /```(\w+)\s+(\w+)\s+icon="[^"]+"/g,
    (_match: string, lang: string, label: string) => {
      incrementStat("revert-no-label-icon");
      if (label === 'terminal') {
        return `\`\`\`${lang} title="terminal"`;
      }
      return `\`\`\`${lang}`;
    }
  );

  // Pattern 10: icon directly after language with no label at all
  modified = modified.replace(
    /```(\w+)\s+icon="[^"]+"/g,
    (_match: string, lang: string) => {
      incrementStat("revert-icon-only");
      return `\`\`\`${lang}`;
    }
  );

  // Pattern 11: Remove expandable attribute
  modified = modified.replace(
    /```(\w+)([^\n]*?)\s+expandable/g,
    (_match: string, lang: string, attrs: string) => {
      incrementStat("revert-expandable-removed");
      return `\`\`\`${lang}${attrs}`.trim();
    }
  );

  // Pattern 12: Fix highlight={} syntax (convert to inline comments)
  modified = modified.replace(
    /```(\w+)([^\n]*?)highlight=(\d+)\}/g,
    (_match: string, lang: string, attrs: string, lineNum: string) => {
      incrementStat("revert-highlight-fixed");
      // Just remove the broken highlight syntax for now
      return `\`\`\`${lang}${attrs}`.replace(/\s+$/, '');
    }
  );

  return modified;
}

/**
 * Transform highlight metadata to inline comments
 */
function transformHighlights(content: string): string {
  let modified = content;

  // Match highlight syntax, supporting CRLF line endings
  const codeBlockRegex = /```(\w+)([^\r\n]*?)highlight=\{([^}]+)\}\r?\n([\s\S]*?)```/g;
  
  modified = modified.replace(codeBlockRegex, (_match: string, lang: string, attrs: string, highlights: string, code: string) => {
    const lineNumbers = highlights.split(',').map(n => parseInt(n.trim()));
    
    // Split on both \n and \r\n
    const lines = code.split(/\r?\n/);
    const highlightedLines = lines.map((line, index) => {
      const lineNum = index + 1;
      if (lineNumbers.includes(lineNum)) {
        incrementStat("highlight-inline-comment-added");
        return `${line} // [!code highlight]`;
      }
      return line;
    });

    const cleanAttrs = attrs.replace(/\s*highlight=\{[^}]+\}/, '').trim();
    
    return `\`\`\`${lang}${cleanAttrs ? ' ' + cleanAttrs : ''}\n${highlightedLines.join('\n')}\`\`\``;
  });

  return modified;
}

/**
 * Merge terminal command blocks with following txt output blocks
 */
function mergeTerminalWithOutput(content: string): string {
  let modified = content;
  
  // First, protect PowerShell + txt blocks from being merged by converting txt to text
  modified = modified.replace(
    /```powershell([^\n]*)\n([\s\S]*?)```\s*\n+\s*```txt\n/g,
    (_match: string, attrs: string, commandContent: string) => {
      // Convert txt to text to prevent merging
      return `\`\`\`powershell${attrs}\n${commandContent}\`\`\`\n\n\`\`\`text\n`;
    }
  );
  
  // Merge bash/sh terminal blocks followed by txt blocks (command + output pattern)
  // Pattern: bash/sh block with "terminal" in attrs, followed by txt block
  // Match space/newline after language to avoid matching "powershell"
  modified = modified.replace(
    /```(bash|sh|shell|zsh)([ \t])([^\n]*terminal[^\n]*)\n([\s\S]*?)```\s*\n+\s*```txt\n([\s\S]*?)```/g,
    (_match: string, lang: string, space: string, attrs: string, commandContent: string, outputContent: string) => {
      incrementStat("terminal-output-merged");
      // Merge the command and output into one block, keeping the terminal attrs
      return `\`\`\`${lang}${space}${attrs}\n${commandContent}\n${outputContent}\`\`\``;
    }
  );
  
  // Convert text blocks back to txt
  modified = modified.replace(/```text\n/g, '```txt\n');
  
  return modified;
}

/**
 * Add $ prefix to terminal commands
 */
function addTerminalPrompts(content: string): string {
  let modified = content;

  // PowerShell blocks
  const powershellBlockRegex = /```powershell([^\n]*)\n([\s\S]*?)```/g;
  
  modified = modified.replace(powershellBlockRegex, (_match: string, attrs: string, code: string) => {
    const lines = code.split("\n");
    const processedLines = lines.map((line: string) => {
      const trimmed = line.trim();
      
      // Skip comments, existing prompts, and marked output lines
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(">") || trimmed.startsWith("//")) {
        // If this is a marked output line, strip the marker
        if (trimmed.startsWith("# OUTPUT: ")) {
          const leadingSpace = line.match(/^(\s*)/)?.[1] || "";
          return `${leadingSpace}${trimmed.slice(10)}`; // Remove "# OUTPUT: " prefix
        }
        return line;
      }
      
      if (/^[a-zA-Z]/.test(trimmed)) {
        incrementStat("powershell-prompt-added");
        const leadingSpace = line.match(/^(\s*)/)?.[1] || "";
        return `${leadingSpace}> ${trimmed}`;
      }
      
      return line;
    });

    return `\`\`\`powershell${attrs}\n${processedLines.join("\n")}\`\`\``;
  });

  // Bash/sh/zsh blocks - add $ prompts to ALL of them
  const codeBlockRegex = /```(bash|sh|zsh)([^\n]*)\n([\s\S]*?)```/g;
  
  modified = modified.replace(codeBlockRegex, (_match: string, lang: string, attrs: string, code: string) => {
    const lines = code.split("\n");
    let inOutput = false; // Track if we're in output section
    let sawCommand = false; // Track if we've seen at least one command
    let blankLineAfterCommand = false; // Track blank line after command
    
    const processedLines = lines.map((line: string, index: number) => {
      const trimmed = line.trim();
      
      // Track blank lines after we've seen a command
      if (!trimmed) {
        if (sawCommand && !blankLineAfterCommand) {
          blankLineAfterCommand = true;
        }
        return line;
      }
      
      // Skip comments and interactive prompts
      if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith(">")) {
        return line;
      }
      
      // If line already has $, mark that we've seen a command and skip
      if (trimmed.startsWith("$")) {
        sawCommand = true;
        blankLineAfterCommand = false; // Reset blank line tracking
        return line;
      }
      
      // If line looks like output indicators, we're in output mode
      if (/^[✓✗×⚠➜→]/.test(trimmed) || // Status symbols
          /^\d+ (pass|fail|skip)/.test(trimmed) || // Test results
          /^-{3,}/.test(trimmed) || // Separator lines (tables)
          /^\|/.test(trimmed) || // Table rows starting with pipe
          /^[└├│─]/.test(trimmed) || // Directory tree characters
          /^(packed|dependencies|Current|Target|Latest|Package)\s/.test(trimmed) || // Common output words
          /^(you|shouldn)/i.test(trimmed) || // Words indicating non-command text
          /^(bun|npm|node)\s+(\w+\s+)*v[\d.$]/.test(trimmed) || // Version banners like "bun test v1.3.1", "bun pm version v1.0.0"
          /^\.\/[^:]+:\s+(valid|satisfies|error|warning)/.test(trimmed)) { // Path verification output like "./myapp: valid on disk"
        inOutput = true;
        return line;
      }
      
      // If already in output mode, don't add $
      if (inOutput) {
        return line;
      }
      
      // Check if this looks like an actual command - BE VERY SPECIFIC, no generic patterns
      const looksLikeCommand = 
        /^(bun|npm|npx|bunx|yarn|pnpm|node|git|cd|ls|mkdir|touch|rm|cp|mv|curl|wget|docker|cargo|go|python|pip|echo|export|source|railway)\s/.test(trimmed) || // Common commands
        /^(export|source)\s+[A-Z_]+=/.test(trimmed) || // Export/source env vars  
        (/^[A-Z_]+=/.test(trimmed) && /\s+(bun|npm|node|git)/.test(trimmed)) || // Env var before command like: FOO=bar bun run
        (/^\.\//.test(trimmed) && !/\s+@\d/.test(trimmed)); // Relative paths (but not output like "./path @1.2.3")
      
      if (looksLikeCommand) {
        sawCommand = true;
        blankLineAfterCommand = false; // Reset blank line tracking
        incrementStat("terminal-dollar-added");
        const leadingSpace = line.match(/^(\s*)/)?.[1] || "";
        return `${leadingSpace}$ ${trimmed}`;
      }
      
      // If we see content after a blank line following a command, and it doesn't look like a command, it's output
      if (blankLineAfterCommand) {
        inOutput = true;
      }
      
      // If we see output-like content after commands, enter output mode
      if (sawCommand && /^[A-Z]/.test(trimmed) && trimmed.length > 30) {
        inOutput = true;
      }
      
      return line;
    });

    return `\`\`\`${lang}${attrs}\n${processedLines.join("\n")}\`\`\``;
  });

  return modified;
}

/**
 * Revert component syntax
 */
function revertComponents(content: string): string {
  let modified = content;

  // Note → Callout type="info"
  modified = modified.replace(
    /<Note>([\s\S]*?)<\/Note>/g,
    (_match: string, inner: string) => {
      incrementStat("revert-note-to-callout");
      return `<Callout type="info">${inner}</Callout>`;
    }
  );

  // Tip → Callout type="info"
  modified = modified.replace(
    /<Tip>([\s\S]*?)<\/Tip>/g,
    (_match: string, inner: string) => {
      incrementStat("revert-tip-to-callout");
      return `<Callout type="info">${inner}</Callout>`;
    }
  );

  // Warning → Callout type="warning"
  modified = modified.replace(
    /<Warning>([\s\S]*?)<\/Warning>/g,
    (_match: string, inner: string) => {
      incrementStat("revert-warning-to-callout");
      return `<Callout type="warning">${inner}</Callout>`;
    }
  );

  // Info → Callout type="info"
  modified = modified.replace(
    /<Info>([\s\S]*?)<\/Info>/g,
    (_match: string, inner: string) => {
      incrementStat("revert-info-to-callout");
      return `<Callout type="info">${inner}</Callout>`;
    }
  );

  // Tab title= → Tab value=
  modified = modified.replace(
    /<Tab title=/g,
    () => {
      incrementStat("revert-tab-title-to-value");
      return "<Tab value=";
    }
  );

  // AccordionGroup → Accordions type="single" (DO THIS FIRST before wrapping lone Accordions)
  modified = modified.replace(/<AccordionGroup>/g, () => {
    incrementStat("revert-accordiongroup-to-accordions");
    return '<Accordions type="single">';
  });
  modified = modified.replace(/<\/AccordionGroup>/g, "</Accordions>");

  // Wrap lone Accordion in Accordions (only if not already inside Accordions)
  // Find all Accordions that are NOT preceded by <Accordions and NOT followed by </Accordions> with another Accordion
  const accordionPattern = /<Accordion[\s\S]*?<\/Accordion>/g;
  const accordionsPattern = /<Accordions[^>]*>[\s\S]*?<\/Accordions>/g;
  
  // First, find all regions that are already wrapped in Accordions
  const wrappedRegions: Array<{ start: number; end: number }> = [];
  let accordionsMatch;
  while ((accordionsMatch = accordionsPattern.exec(modified)) !== null) {
    wrappedRegions.push({ start: accordionsMatch.index, end: accordionsMatch.index + accordionsMatch[0].length });
  }
  
  // Now wrap individual Accordions that are not in wrapped regions
  let result = modified;
  let offset = 0;
  accordionPattern.lastIndex = 0; // Reset regex
  let accordionMatch;
  while ((accordionMatch = accordionPattern.exec(modified)) !== null) {
    const accordionStart = accordionMatch.index;
    const accordionEnd = accordionStart + accordionMatch[0].length;
    
    // Check if this Accordion is inside any wrapped region
    const isWrapped = wrappedRegions.some(region => 
      accordionStart >= region.start && accordionEnd <= region.end
    );
    
    if (!isWrapped) {
      const wrapped = `<Accordions type="single">\n${accordionMatch[0]}\n</Accordions>`;
      result = result.slice(0, accordionStart + offset) + wrapped + result.slice(accordionEnd + offset);
      offset += wrapped.length - accordionMatch[0].length;
      incrementStat("wrap-accordion-in-accordions");
    }
  }
  
  modified = result;

  // CardGroup → Cards
  modified = modified.replace(/<CardGroup/g, () => {
    incrementStat("revert-cardgroup-to-cards");
    return "<Cards";
  });
  modified = modified.replace(/<\/CardGroup>/g, "</Cards>");

  // // Remove Frame wrappers (handles multi-line images too)
  // modified = modified.replace(
  //   /<Frame>\s*(!\[[\s\S]*?\]\([^)]+\))\s*<\/Frame>/g,
  //   (_match: string, img: string) => {
  //     incrementStat("revert-frame-removed");
  //     return img.trim();
  //   }
  // );

  // Step title attribute → markdown header (capture indentation)
  modified = modified.replace(
    /(\s*)(<Step title="([^"]+)">)/g,
    (_match: string, indent: string, _fullMatch: string, title: string) => {
      incrementStat("revert-step-title");
      const contentIndent = indent + '  '; // Add 2 spaces for content indentation
      return `${indent}<Step>\n${contentIndent}### ${title}`;
    }
  );

  return modified;
}

/**
 * Fix Step component indentation
 */
function fixStepIndentation(content: string): string {
  let modified = content;
  
  // Find all <Step>...</Step> blocks and fix their content indentation
  modified = modified.replace(
    /(\s*)(<Step>)\n([\s\S]*?)(\s*)(<\/Step>)/g,
    (_match: string, leadingSpace: string, openTag: string, innerContent: string, closingSpace: string, closeTag: string) => {
      // Get the base indentation from the <Step> tag
      const baseIndent = leadingSpace;
      const contentIndent = baseIndent + '  '; // Add 2 spaces for content
      
      // Split the content into lines
      const lines = innerContent.split('\n');
      
      // Check if content needs fixing - if first non-empty line doesn't start with proper indent
      const firstNonEmpty = lines.find(l => l.trim());
      if (firstNonEmpty && firstNonEmpty.startsWith(contentIndent)) {
        // Already properly indented, skip
        return _match;
      }
      
      // Process each line - simply add proper indentation without changing structure
      const processedLines: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Empty lines stay empty
        if (!trimmed) {
          processedLines.push('');
          continue;
        }
        
        // If line already has proper indentation, keep it
        if (line.startsWith(contentIndent)) {
          processedLines.push(line);
        } else {
          // Add proper indentation
          processedLines.push(contentIndent + trimmed);
        }
      }
      
      incrementStat("step-indentation-fixed");
      return `${baseIndent}${openTag}\n${processedLines.join('\n')}\n${baseIndent}${closeTag}`;
    }
  );
  
  return modified;
}

/**
 * Add Tabs items attribute
 */
function addTabsItems(content: string): string {
  let modified = content;

  const tabsRegex = /<Tabs(?!\s+items=)([^>]*)>([\s\S]*?)<\/Tabs>/g;
  
  modified = modified.replace(tabsRegex, (match: string, attrs: string, tabsContent: string) => {
    const tabMatches = tabsContent.matchAll(/<Tab value="([^"]+)"/g);
    const tabValues = Array.from(tabMatches, m => m[1]);
    
    if (tabValues.length > 0) {
      incrementStat("tabs-items-added");
      const itemsAttr = ` items={[${tabValues.map(v => `'${v}'`).join(', ')}]}`;
      return `<Tabs${itemsAttr}${attrs}>${tabsContent}</Tabs>`;
    }
    
    return match;
  });

  return modified;
}

/**
 * Unwrap Tabs/Tab structures - convert back to plain code blocks with tab= attributes
 */
function unwrapTabs(content: string): string {
  let modified = content;
  
  // Remove <Tabs> and </Tabs> wrappers entirely
  modified = modified.replace(/<Tabs[^>]*>\s*/g, '');
  modified = modified.replace(/\s*<\/Tabs>/g, '\n');
  
  // Convert <Tab title="..."> blocks to plain code blocks with tab=
  // Handle both ``` and ```` (markdown allows 4 backticks when code contains 3)
  modified = modified.replace(
    /<Tab\s+(?:value|title)="([^"]+)">\s*\n*(````?)(\w+)(?:\s+title="([^"]+)")?(?:\s+icon="[^"]+")?([\s\S]*?)\2\s*\n*<\/Tab>/g,
    (_match: string, tabLabel: string, backticks: string, lang: string, title: string | undefined, code: string) => {
      incrementStat("tab-unwrapped");
      // Use the tab label as the tab attribute, preserve backtick count
      return `${backticks}${lang} tab="${tabLabel}"${code}${backticks}\n`;
    }
  );
  
  // Remove any remaining <Tab> and </Tab> tags that weren't converted
  // (These are tabs with complex content that can't be auto-converted to tab= attributes)
  modified = modified.replace(/<Tab\s+(?:value|title)="[^"]+"\s*>\s*/g, '');
  modified = modified.replace(/\s*<\/Tab>/g, '\n');
  
  return modified;
}

/**
 * Fix image links
 */
function fixImageLinks(content: string): string {
  let modified = content;

  // Fix markdown image links
  modified = modified.replace(
    /!\[([^\]]*)\]\(\/images\/([^)]+)\)/g,
    (_match: string, alt: string, path: string) => {
      incrementStat("image-link-fixed");
      return `![${alt}](https://bun.com/images/${path})`;
    }
  );

  // Fix HTML img tags with relative /images/ src
  modified = modified.replace(
    /(<img[^>]+src=")\/images\/([^"]+)(")/g,
    (_match: string, before: string, path: string, after: string) => {
      incrementStat("image-src-fixed");
      return `${before}https://bun.com/images/${path}${after}`;
    }
  );

  // Fix Image component src
  modified = modified.replace(
    /(<Image[^>]+src=")\/images\/([^"]+)(")/g,
    (_match: string, before: string, path: string, after: string) => {
      incrementStat("image-component-src-fixed");
      return `${before}https://bun.com/images/${path}${after}`;
    }
  );

  // Fix video source tags
  modified = modified.replace(
    /(<source[^>]+src=")\/images\/([^"]+)(")/g,
    (_match: string, before: string, path: string, after: string) => {
      incrementStat("video-src-fixed");
      return `${before}https://bun.com/images/${path}${after}`;
    }
  );

  return modified;
}

/**
 * Add /docs or /guides prefix to internal links
 */
function addDocsPrefix(content: string, filePath: string): string {
  let modified = content;

  // Determine if current file is in guides or docs
  const isInGuides = filePath.includes("/guides/");

  // First, fix /docs/guides/ to /guides/
  modified = modified.replace(
    /\[([^\]]+)\]\(\/docs\/guides\/([^)]+)\)/g,
    (_match: string, text: string, path: string) => {
      incrementStat("docs-guides-to-guides");
      return `[${text}](/guides/${path})`;
    }
  );

  // Then add prefixes to links without them
  modified = modified.replace(
    /\[([^\]]+)\]\(\/([^/)][^)]*)\)/g,
    (_match: string, text: string, path: string) => {
      // Skip if already has prefix or is external
      if (path.startsWith("docs/") || path.startsWith("guides/") || 
          path.startsWith("http") || path.startsWith("images/") || 
          path.startsWith("icons/")) {
        return _match;
      }
      
      // Docs-only directories (never in guides)
      const docsOnlyDirs = /^(bundler|runtime|pm|project)(\/|$)/;
      
      // If it's a docs-only directory, always use /docs/
      if (docsOnlyDirs.test(path)) {
        incrementStat("docs-prefix-added");
        return `[${text}](/docs/${path})`;
      }
      
      // Guide-only directories (never in docs)
      const guideOnlyDirs = /^(install|util|binary|websocket|streams|ecosystem|deployment|process|read-file|write-file|html-rewriter)(\/|$)/;
      
      // If it's a guide-only directory, always use /guides/
      if (guideOnlyDirs.test(path)) {
        incrementStat("guides-prefix-added");
        return `[${text}](/guides/${path})`;
      }
      
      // For ambiguous directories (test/), use the current file's location
      // If we're in a guides file, assume the link is also to guides
      // If we're in a docs file, assume the link is also to docs
      if (isInGuides) {
        incrementStat("guides-prefix-added");
        return `[${text}](/guides/${path})`;
      } else {
        incrementStat("docs-prefix-added");
        return `[${text}](/docs/${path})`;
      }
    }
  );

  return modified;
}

/**
 * Replace snippet components with <include> tags
 * Replace <ComponentName /> with <include>path/to/snippet.mdx</include>
 */
async function inlineSnippets(content: string, filePath: string): Promise<string> {
  let modified = content;
  
  // Map of component names to snippet file names and types
  const snippetMap: Record<string, { file: string; type: string }> = {
    'Add': { file: 'add', type: 'cli' },
    'Build': { file: 'build', type: 'cli' },
    'Feedback': { file: 'feedback', type: 'cli' },
    'Init': { file: 'init', type: 'cli' },
    'Install': { file: 'install', type: 'cli' },
    'Link': { file: 'link', type: 'cli' },
    'Outdated': { file: 'outdated', type: 'cli' },
    'Patch': { file: 'patch', type: 'cli' },
    'Publish': { file: 'publish', type: 'cli' },
    'Remove': { file: 'remove', type: 'cli' },
    'Run': { file: 'run', type: 'cli' },
    'Test': { file: 'test', type: 'cli' },
    'Update': { file: 'update', type: 'cli' },
    'InstallBun': { file: 'install-bun', type: 'blog' },
  };
  
  // Find all snippet components
  const snippetRegex = /<([A-Z][a-zA-Z]+)\s*\/>/g;
  const matches = Array.from(modified.matchAll(snippetRegex));
  
  for (const match of matches) {
    const componentName = match[1];
    const snippetInfo = snippetMap[componentName];
    
    if (snippetInfo) {
      // Calculate relative path from current file to snippet
      // Files are in content/docs/* or content/guides/* or content/blog/*
      // Snippets are in content/_snippets/cli/* or content/_snippets/blog/*
      
      // Count directory depth to determine relative path
      // content/docs/pm/cli/add.mdx -> ../../../_snippets/cli/add.mdx
      // content/guides/install/add.mdx -> ../../_snippets/cli/add.mdx
      // content/blog/post.mdx -> ../_snippets/blog/install-bun.mdx
      const relativePath = filePath.replace(process.cwd() + '/', '');
      const depth = relativePath.split('/').length - 2; // -2 for content/ and filename
      const upLevels = '../'.repeat(depth);
      
      const includePath = `${upLevels}_snippets/${snippetInfo.type}/${snippetInfo.file}.mdx`;
      
      // Replace the component with the include tag
      modified = modified.replace(match[0], `<include>${includePath}</include>`);
      incrementStat(`snippet-replaced-${snippetInfo.file}`);
    }
  }
  
  return modified;
}

/**
 * Clean excessive blank lines (3+ in a row)
 */
function cleanExcessiveBlankLines(content: string): string {
  let modified = content;
  
  // Replace 3 or more consecutive newlines with just 2 newlines (one blank line)
  modified = modified.replace(/\n{3,}/g, '\n\n');
  
  return modified;
}

/**
 * Replace Bun version numbers with $BUN_LATEST_VERSION
 */
function replaceBunVersion(content: string, version: string): string {
  let modified = content;
  
  // Don't replace versions in blog post filenames or titles
  if (content.includes('category: Changelog')) {
    return content;
  }
  
  // Replace version patterns like "bun-v1.3.1", "1.3.1", "v1.3.1"
  // Be careful to only replace in installation/version contexts
  
  // Pattern 1: bun-v1.3.1 (in install commands)
  const bunVPattern = new RegExp(`bun-v${version.replace(/\./g, '\\.')}`, 'g');
  modified = modified.replace(bunVPattern, (match) => {
    incrementStat("version-replaced-bun-v");
    return 'bun-v$BUN_LATEST_VERSION';
  });
  
  // Pattern 2: Version 1.3.1 or -Version 1.3.1 (PowerShell)
  const versionPattern = new RegExp(`(-Version\\s+|Version\\s+)${version.replace(/\./g, '\\.')}`, 'g');
  modified = modified.replace(versionPattern, (match, prefix) => {
    incrementStat("version-replaced-version");
    return `${prefix}$BUN_LATEST_VERSION`;
  });
  
  // Pattern 3: v1.3.1 (in output or text)
  const vPattern = new RegExp(`\\bv${version.replace(/\./g, '\\.')}\\b`, 'g');
  modified = modified.replace(vPattern, (match) => {
    incrementStat("version-replaced-v");
    return 'v$BUN_LATEST_VERSION';
  });
  
  // Pattern 4: "^1.3.1" or "~1.3.1" (version ranges in package.json)
  const rangePattern = new RegExp(`"([\\^~])${version.replace(/\./g, '\\.')}"`, 'g');
  modified = modified.replace(rangePattern, (match, prefix) => {
    incrementStat("version-replaced-range");
    return `"${prefix}$BUN_LATEST_VERSION"`;
  });
  
  // Pattern 5: @package@1.3.1 (package with version specifier)
  const packageAtPattern = new RegExp(`(@[\\w/-]+)@${version.replace(/\./g, '\\.')}\\b`, 'g');
  modified = modified.replace(packageAtPattern, (match, packageName) => {
    incrementStat("version-replaced-package-at");
    return `${packageName}@$BUN_LATEST_VERSION`;
  });
  
  return modified;
}

/**
 * Wrap HTML-like tags in inline code blocks
 * Wraps <tag> patterns that are not already in code blocks
 */
function wrapHtmlTagsInCode(content: string): string {
  let modified = content;
  
  // Split content by code fences and inline code to avoid processing them
  const parts: { text: string; isCode: boolean }[] = [];
  
  // First, split by code fences (```...```)
  const fenceParts = modified.split(/(```[\s\S]*?```)/g);
  
  for (const part of fenceParts) {
    if (part.startsWith('```')) {
      parts.push({ text: part, isCode: true });
    } else {
      // For non-fence parts, split by inline code (`...`)
      const inlineParts = part.split(/(`[^`]+`)/g);
      for (const inlinePart of inlineParts) {
        parts.push({ 
          text: inlinePart, 
          isCode: inlinePart.startsWith('`') && inlinePart.endsWith('`')
        });
      }
    }
  }
  
  // Process only non-code parts
  const processed = parts.map(part => {
    if (part.isCode) {
      return part.text;
    }
    
    // Check if this part contains actual HTML structures (opening + closing tags)
    // by looking for patterns like <tag ...> ... </tag>
    const hasHtmlStructures = /<([a-z][a-z0-9-]*?)[\s>][\s\S]*?<\/\1>/i.test(part.text);
    
    // If this part has actual HTML structures, don't wrap any tags
    if (hasHtmlStructures) {
      return part.text;
    }
    
    // Replace HTML-like tags with inline code
    // Match <tagname> or </tagname> but not React/MDX components
    return part.text.replace(
      /<\/?([a-z][a-z0-9-]*?)>/gi,
      (match, tagName, offset, fullText) => {
        const lowerTagName = tagName.toLowerCase();
        
        // Skip MDX/React components (include, Callout, Tab, etc.)
        const mdxComponents = ['include', 'callout', 'tab', 'tabs', 'accordion', 'accordions', 
                               'card', 'cards', 'step', 'steps', 'paramfield', 'codegroup', 'section'];
        if (mdxComponents.includes(lowerTagName)) {
          return match;
        }
        
        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(tagName)) {
          return match;
        }
        
        // Skip tags inside attributes (e.g., name="--dry-run=<val>")
        // Check if there's a quote before the tag without a closing quote between them
        const textBefore = fullText.slice(0, offset);
        const lastQuote = Math.max(textBefore.lastIndexOf('"'), textBefore.lastIndexOf("'"));
        if (lastQuote !== -1) {
          // Check if there's a closing quote after the last quote but before our tag
          const textBetween = fullText.slice(lastQuote + 1, offset);
          if (!/["']/.test(textBetween)) {
            // We're inside an attribute value, don't wrap
            return match;
          }
        }
        
        incrementStat("html-tag-wrapped");
        return `\`${match}\``;
      }
    );
  });
  
  return processed.join('');
}

/**
 * Fix Accordion wrapping - merge individual Accordions wrappers into one
 */
function fixAccordionWrapping(content: string): string {
  let modified = content;
  
  // Pattern: </Accordions> followed by <Accordions> with possible whitespace
  // This happens when each Accordion has its own wrapper
  modified = modified.replace(
    /<\/Accordions>\s*<Accordions>/g,
    () => {
      incrementStat("accordion-wrappers-merged");
      return '';
    }
  );
  
  return modified;
}

/**
 * Remove component imports (only at top of file, after frontmatter)
 */
function removeComponentImports(content: string): string {
  let modified = content;

  // Match frontmatter + imports section only (before first heading or content)
  const frontmatterMatch = modified.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!frontmatterMatch) return content;

  const frontmatterEnd = frontmatterMatch[0].length;
  const afterFrontmatter = modified.slice(frontmatterEnd);
  
  // Only match imports that appear before the first non-import content
  // Stop at first heading, paragraph, or code fence
  const beforeContent = afterFrontmatter.match(/^((?:import\s+.+?\r?\n|\s*\r?\n)*)/);
  if (!beforeContent) return modified;
  
  const importsSection = beforeContent[1];
  const cleanedImports = importsSection.replace(
    /^import\s+\w+\s+from\s+["'][^"']+["'];\s*\r?\n/gm,
    () => {
      incrementStat("import-removed");
      return "";
    }
  );

  // Reconstruct: frontmatter + cleaned imports + rest of content
  const restOfContent = afterFrontmatter.slice(importsSection.length);
  modified = frontmatterMatch[0] + cleanedImports + restOfContent;

  // Clean up extra newlines after frontmatter
  modified = modified.replace(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)(\s*\r?\n)+/, "$1\n");

  return modified;
}

/**
 * Process a single file
 */
async function processFile(filePath: string, bunVersion: string = ""): Promise<boolean> {
  try {
    const content = await readFile(filePath, "utf-8");
    let modified = content;

    // Normalize CRLF to LF at the very start to avoid line ending issues
    modified = modified.replace(/\r\n/g, '\n');

    const isGuide = filePath.includes("/guides/");

    // Apply transformations in specific order
    modified = await inlineSnippets(modified, filePath);
    modified = removeComponentImports(modified);
    modified = transformFrontmatter(modified, isGuide);
    modified = handleCodeGroups(modified); // MUST BE FIRST for code fences
    modified = transformHighlights(modified);
    modified = mergeTerminalWithOutput(modified); // MUST be before revertCodeFences
    modified = revertCodeFences(modified);
    modified = addTerminalPrompts(modified);
    modified = revertComponents(modified);
    // TODO: fixStepIndentation is adding blank lines everywhere - needs fixing
    // modified = fixStepIndentation(modified);
    modified = fixAccordionWrapping(modified);
    // TODO: unwrapTabs needs to handle indentation properly - disabled for now
    // modified = unwrapTabs(modified); // Remove Tabs/Tab wrappers, convert to tab= attributes
    modified = fixImageLinks(modified);
    modified = addDocsPrefix(modified, filePath);
    modified = wrapHtmlTagsInCode(modified);
    modified = cleanExcessiveBlankLines(modified);
    if (bunVersion) {
      modified = replaceBunVersion(modified, bunVersion);
    }

    if (modified !== content) {
      await writeFile(filePath, modified, "utf-8");
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Find all .mdx files
 */
async function findMdxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) {
          continue;
        }
        const subFiles = await findMdxFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting Comprehensive Bun Docs Migration v3\n");

  const startTime = Date.now();

  // Read Bun version from .repos/bun/LATEST
  let bunVersion = "";
  try {
    const latestPath = join(process.cwd(), ".repos", "bun", "LATEST");
    bunVersion = (await readFile(latestPath, "utf-8")).trim();
    console.log(`📦 Bun version: ${bunVersion}\n`);
  } catch (error) {
    console.warn("⚠️  Could not read Bun version from .repos/bun/LATEST, skipping version replacement\n");
  }

  const docsDir = join(process.cwd(), "content", "docs");
  const guidesDir = join(process.cwd(), "content", "guides");
  const snippetsDir = join(process.cwd(), "content", "_snippets");

  console.log("📁 Finding MDX files...");
  const docsFiles = await findMdxFiles(docsDir);
  const guidesFiles = await findMdxFiles(guidesDir);
  const snippetFiles = await findMdxFiles(snippetsDir);
  const allFiles = [...docsFiles, ...guidesFiles, ...snippetFiles];

  console.log(`Found ${allFiles.length} MDX files\n`);

  console.log("⚙️  Processing files...");
  let progressCount = 0;

  for (const file of allFiles) {
    stats.filesProcessed++;
    progressCount++;

    const wasModified = await processFile(file, bunVersion);
    if (wasModified) {
      stats.filesModified++;
    }

    if (progressCount % 50 === 0) {
      console.log(`  Processed ${progressCount}/${allFiles.length} files...`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n✅ Migration Complete!\n");
  console.log("📊 Summary:");
  console.log(`  Files processed: ${stats.filesProcessed}`);
  console.log(`  Files modified: ${stats.filesModified}`);
  console.log(`  Duration: ${duration}s\n`);

  console.log("🔧 Transformations Applied:");
  const sortedTransformations = Object.entries(stats.transformationsApplied)
    .sort((a, b) => b[1] - a[1]);

  for (const [name, count] of sortedTransformations) {
    console.log(`  ${name}: ${count}`);
  }

  if (stats.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const warning of stats.warnings.slice(0, 10)) {
      console.log(`  ${warning}`);
    }
    if (stats.warnings.length > 10) {
      console.log(`  ... and ${stats.warnings.length - 10} more`);
    }
  }

  console.log("\n✨ Done!");
}

main().catch(console.error);
