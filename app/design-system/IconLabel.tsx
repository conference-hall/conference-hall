import cn from 'classnames';

type Icon = React.ComponentType<{ className?: string }>;
type Props = {
  children: React.ReactNode;
  icon: Icon;
  lineCamp?: boolean;
  truncate?: boolean;
  className?: string;
  iconClassName?: string;
};

export function IconLabel({ children, icon: Icon, className, truncate, lineCamp = false, iconClassName }: Props) {
  return (
    <div className={cn('flex items-center text-sm', className)}>
      <Icon className={cn('mr-1.5 h-5 w-5 flex-shrink-0 self-start', iconClassName)} aria-hidden="true" />
      <span className={cn({ truncate, 'line-clamp-2': lineCamp })}>{children}</span>
    </div>
  );
}
