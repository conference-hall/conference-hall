import cn from 'classnames';

type Props = {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  lineCamp?: boolean;
  truncate?: boolean;
  className?: string;
  iconClassName?: string;
  srOnly?: string;
};

export function IconLabel({
  children,
  icon: Icon,
  className,
  truncate,
  lineCamp = false,
  iconClassName,
  srOnly,
}: Props) {
  return (
    <div className={cn('flex items-center text-sm text-gray-500', className)}>
      <Icon className={cn('mr-1.5 h-5 w-5 flex-shrink-0 self-start ', iconClassName)} aria-hidden="true" />
      <span className={cn('text-gray-900', { truncate, 'line-clamp-2': lineCamp })}>{children}</span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </div>
  );
}
