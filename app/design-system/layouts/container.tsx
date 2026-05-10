import { cx } from 'class-variance-authority';
import type React from 'react';

type Props = { as?: React.ElementType; children: React.ReactNode; className?: string; ref?: React.Ref<HTMLElement> };

export function Container({ as: Tag = 'div', children, className, ref }: Props) {
  return (
    <Tag ref={ref} className={cx('mx-auto max-w-7xl px-4 lg:px-8', className)}>
      {children}
    </Tag>
  );
}
