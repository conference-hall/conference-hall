import React from 'react';
import cn from 'classnames';

type Props = { children: React.ReactNode; className?: string };

export function Container({ children, className }: Props) {
  return <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}
