import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

type Props = {
  as?: React.ElementType;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ as: Tag = 'header', className, children }: Props) {
  return <Tag className={cx('bg-white shadow', className)}>{children}</Tag>;
}
