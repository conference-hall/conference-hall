import cn from 'classnames';
import React from 'react';

type Icon = React.ComponentType<{ className?: string }>;
type IconLabelProps = { children: React.ReactNode, icon: Icon, className?: string };

export function IconLabel({ children, icon: Icon, className }: IconLabelProps) {
  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Icon className="flex-shrink-0 self-start mr-1.5 h-5 w-5" aria-hidden="true" />
      {children}
    </div>
  );
}
