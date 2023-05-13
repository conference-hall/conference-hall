import cn from 'classnames';
import { marked } from 'marked';
import React from 'react';
import xss from 'xss';

marked.use({ mangle: false, headerIds: false });

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
      className={cn('prose max-w-none text-gray-900', { 'prose-sm': size === 's' }, className)}
      dangerouslySetInnerHTML={{ __html: xss(html) }}
    />
  );
}
