import cn from 'classnames';
import React, { ReactNode } from 'react';

type Icon = React.ComponentType<{ className?: string }>;
type IconLabelProps = { children: ReactNode, icon: Icon, className?: string };

export function IconLabel({ children, icon: Icon, className }: IconLabelProps) {
  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Icon className="flex-shrink-0 mr-1.5 h-5 w-5" aria-hidden="true" />
      {children}
    </div>
  );
}
