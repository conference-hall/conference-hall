// Tremor CategoryBar [v0.0.1]

'use client';

import { cx } from 'class-variance-authority';
import React from 'react';

const sumNumericArray = (arr: number[]) => arr.reduce((prefixSum, num) => prefixSum + num, 0);

interface CategoryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  values: number[];
  colors: string[];
}

const CategoryBar = React.forwardRef<HTMLDivElement, CategoryBarProps>(
  ({ values = [], colors = [], className, ...props }, forwardedRef) => {
    const maxValue = React.useMemo(() => sumNumericArray(values), [values]);

    return (
      <div ref={forwardedRef} className={cx(className)} aria-label="category bar" {...props}>
        <div className="relative flex h-2 w-full items-center">
          <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
            {values.map((value, index) => {
              const barColor = colors[index] ?? 'gray';
              const percentage = (value / maxValue) * 100;
              return (
                <div
                  key={`item-${index}`}
                  className={cx('h-full', barColor, percentage === 0 && 'hidden')}
                  style={{ width: `${percentage}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

CategoryBar.displayName = 'CategoryBar';

export { CategoryBar };
