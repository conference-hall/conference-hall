import cn from 'classnames';
import React from 'react';

type Icon = React.ComponentType<{ className?: string }>;
type Props = {
  children: React.ReactNode;
  icon: Icon;
  className?: string;
  iconClassName?: string;
};

export function IconLabel({ children, icon: Icon, className, iconClassName }: Props) {
  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Icon className={cn('mr-1.5 h-5 w-5 flex-shrink-0 self-start', iconClassName)} aria-hidden="true" />
      {children}
    </div>
  );
}
