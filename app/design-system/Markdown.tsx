import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { marked } from 'marked';
import React from 'react';
import xss from 'xss';

// Disable headings and tables in Markdown
marked.use({ tokenizer: { heading: () => undefined, table: () => undefined } });

const markdown = cva('max-w-full min-w-0 break-words text-gray-700', {
  variants: { size: { s: 'prose prose-sm', m: 'prose' } },
  defaultVariants: { size: 's' },
});

type Props = { as?: React.ElementType; children: string | null; className?: string } & VariantProps<typeof markdown>;

export function Markdown({ as: Tag = 'div', children, size, className }: Props) {
  const html = marked.parse(children || '', { async: false }) as string;

  return <Tag className={markdown({ size, className })} dangerouslySetInnerHTML={{ __html: xss(html) }} />;
}
