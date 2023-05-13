import cn from 'classnames';
import React from 'react';

type Props = { as?: React.ElementType; children: React.ReactNode; className?: string };

export function Container({ as: Tag = 'div', children, className }: Props) {
  return <Tag className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</Tag>;
}
