import React from 'react';
import cn from 'classnames';
import xss from 'xss';
import { marked } from 'marked';

type Props = {
  source: string | null;
  size?: 'm' | 's';
  component?: React.ElementType;
  className?: string;
};

export function Markdown({ component: Component = 'div', source, size = 's', className }: Props) {
  const html = marked.parse(source || '');
  return (
    <Component
      className={cn('prose max-w-none', { 'prose-sm': size === 's' }, className)}
      dangerouslySetInnerHTML={{ __html: xss(html) }}
    />
  );
}
