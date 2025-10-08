import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

type ActivityFeedProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

export function ActivityFeed({ label, className, children }: ActivityFeedProps) {
  return (
    <ul aria-label={label} className={className}>
      {children}
    </ul>
  );
}

type EntryProps = {
  marker?: ReactNode;
  withLine?: boolean;
  className?: string;
  children?: ReactNode;
};

function Entry({ marker, children, withLine, className, ...rest }: EntryProps) {
  return (
    <li {...rest} className="relative flex gap-x-4">
      <div className="flex flex-col items-center w-8 shrink-0">
        {marker}
        {withLine ? <Line /> : null}
      </div>
      <div className={cx('flex-1 pb-6', className)}>{children}</div>
    </li>
  );
}

ActivityFeed.Entry = Entry;

function Line({ className }: { className?: string }) {
  return (
    <div className={cx('relative my-0.5 flex h-full w-full justify-center self-center overflow-hidden', className)}>
      <div className="absolute top-0 bottom-0 w-0.5 bg-gray-200" />
    </div>
  );
}
