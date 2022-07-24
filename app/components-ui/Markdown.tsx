import React from 'react';
import cn from 'classnames';
import xss from 'xss';
import { marked } from 'marked';

type Props = {
  source: string | null;
  size?: 'base' | 'sm';
  component?: React.ElementType;
  className?: string;
};

export function Markdown({
  component: Component = 'div',
  source,
  size = 'sm',
  className,
}: Props) {
  const html = marked.parse(source || '');
  return (
    <Component
      className={cn(
        'prose max-w-none text-gray-900',
        { 'prose-sm': size === 'sm' },
        className
      )}
      dangerouslySetInnerHTML={{ __html: xss(html) }}
    />
  );
}
