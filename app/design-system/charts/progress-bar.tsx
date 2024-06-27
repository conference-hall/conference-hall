// Tremor Raw ProgressBar [v0.0.1]

import { cx } from 'class-variance-authority';
import React from 'react';

interface ProgressBarProps extends React.HTMLProps<HTMLDivElement> {
  value?: number;
  max?: number;
  showAnimation?: boolean;
  label?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, max = 100, label, showAnimation = false, className, ...props }: ProgressBarProps, forwardedRef) => {
    const safeValue = Math.min(max, Math.max(value, 0));

    const background = 'bg-gray-200';
    const bar = 'bg-gray-500';

    return (
      <div ref={forwardedRef} className={cx('flex w-full items-center', className)} {...props}>
        <div
          className={cx('relative flex h-1.5 w-full items-center rounded-full', background)}
          aria-label="progress bar"
          aria-valuenow={value}
          aria-valuemax={max}
        >
          <div
            className={cx(
              'h-full flex-col rounded-full',
              bar,
              showAnimation && 'transform-gpu transition-all duration-300 ease-in-out',
            )}
            style={{
              width: max ? `${(safeValue / max) * 100}%` : `${safeValue}%`,
            }}
          />
        </div>
        {label ? (
          <span
            className={cx(
              // base
              'ml-2 whitespace-nowrap text-sm font-medium leading-none',
              // text color
              'text-gray-900',
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar, type ProgressBarProps };
