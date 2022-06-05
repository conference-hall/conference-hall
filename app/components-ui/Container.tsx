import React from 'react';
import cn from 'classnames';

type Props = { children: React.ReactNode; className?: string };

export function Container({ children, className }: Props) {
  return <div className={cn('max-w-7xl mx-auto sm:px-6 lg:px-8', className)}>{children}</div>;
}
