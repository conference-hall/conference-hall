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
    <div className={cx('relative flex h-full w-full justify-center self-center overflow-hidden', className)}>
      <div className="absolute top-0 bottom-0 w-0.5 bg-gray-200" />
    </div>
  );
}

function Loading({ className }: { className?: string }) {
  return (
    <ActivityFeed label="Loading activities" className={className}>
      <Entry className="h-6" withLine aria-hidden />
      <Entry
        marker={<div className="h-8 w-8 bg-gray-200 shrink-0 rounded-full animate-pulse" />}
        className="animate-pulse"
        aria-hidden
      >
        <div className="w-full space-y-2 shrink-0 rounded-lg bg-white border border-gray-200 p-4">
          <div className="h-2.5 w-2/3 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
        </div>
      </Entry>
    </ActivityFeed>
  );
}

ActivityFeed.Loading = Loading;
