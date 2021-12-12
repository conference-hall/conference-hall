import React from 'react';
import cn from 'classnames';
import xss from 'xss';
import { marked } from 'marked';

type MarkdownProps = {
  source: string | null;
  component?: React.ElementType;
  className?: string;
};

export function Markdown({ component: Component = 'div', source, className }: MarkdownProps) {
  const html = marked.parse(source || '');
  return <Component className={cn('prose prose-sm max-w-none', className)} dangerouslySetInnerHTML={{ __html: xss(html) }} />;
}
