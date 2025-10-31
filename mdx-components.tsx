import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import * as AccordionComponents from 'fumadocs-ui/components/accordion';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { ParamField } from './components/ui/param-field';
import { Tweet } from 'react-tweet'
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/cn';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...AccordionComponents,
    Step,
    Steps,
    ParamField,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ReactTweet: Tweet,
    Badge: (props) => <span className={cn("bg-fd-accent text-fd-accent-foreground rounded-md px-2 py-1 text-xs", props.className)}>{props.children}</span>,
    Image: (props) => <img {...props} />,
    ...components,
  };
}

