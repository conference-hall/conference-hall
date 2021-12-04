import React from 'react';
import cn from 'classnames';

type ContainerProps = { children: React.ReactNode; className?: string };

export function Container({ children, className }: ContainerProps) {
  return <div className={cn('max-w-7xl mx-auto sm:px-6 lg:px-8', className)}>{children}</div>;
}
