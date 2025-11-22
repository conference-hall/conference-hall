import { cx } from 'class-variance-authority';
import type React from 'react';

import { MarkdownParser } from '~/shared/markdown/markdown-parser.ts';

type Props = { as?: React.ElementType; children: string | null; className?: string };

export function Markdown({ as: Tag = 'div', children, className }: Props) {
  const html = MarkdownParser.parse(children, { withAppRenderer: true });

  return (
    <Tag
      className={cx('max-w-full min-w-0 wrap-break-word prose prose-sm', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
