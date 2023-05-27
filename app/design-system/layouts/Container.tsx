import { cx } from 'class-variance-authority';
import React from 'react';

type Props = { as?: React.ElementType; children: React.ReactNode; className?: string };

export function Container({ as: Tag = 'div', children, className }: Props) {
  return <Tag className={cx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</Tag>;
}
