import cn from 'classnames';
import React from 'react';

type Icon = React.ComponentType<{ className?: string }>;
type IconLabelProps = { children: React.ReactNode; icon: Icon; className?: string; iconClassName?: string };

export function IconLabel({ children, icon: Icon, className, iconClassName }: IconLabelProps) {
  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Icon className={cn('flex-shrink-0 self-start mr-1.5 h-5 w-5', iconClassName)} aria-hidden="true" />
      {children}
    </div>
  );
}
