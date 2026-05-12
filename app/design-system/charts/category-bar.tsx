// Tremor CategoryBar [v0.0.1]

'use client';

import { cx } from 'class-variance-authority';
import React from 'react';

const getPositionLeft = (value: number | undefined, maxValue: number): number => (value ? (value / maxValue) * 100 : 0);

const sumNumericArray = (arr: number[]) => arr.reduce((prefixSum, num) => prefixSum + num, 0);

const BarLabels = ({ values }: { values: number[] }) => {
  const sumValues = React.useMemo(() => sumNumericArray(values), [values]);
  let prefixSum = 0;
  let sumConsecutiveHiddenLabels = 0;

  return (
    <div className={cx('relative mb-2 flex h-5 w-full text-sm font-medium', 'text-gray-700 dark:text-gray-300')}>
      {values.map((widthPercentage, index) => {
        prefixSum += widthPercentage;

        const showLabel =
          (widthPercentage >= 0.1 * sumValues || sumConsecutiveHiddenLabels >= 0.09 * sumValues) &&
          sumValues - prefixSum >= 0.1 * sumValues &&
          prefixSum >= 0.1 * sumValues &&
          prefixSum < 0.9 * sumValues;

        sumConsecutiveHiddenLabels = showLabel ? 0 : (sumConsecutiveHiddenLabels += widthPercentage);

        const widthPositionLeft = getPositionLeft(widthPercentage, sumValues);

        return (
          <div
            key={`item-${index}`}
            className="flex items-center justify-end pr-0.5"
            style={{ width: `${widthPositionLeft}%` }}
          >
            <span className={cx(showLabel ? 'block' : 'hidden', 'translate-x-1/2 text-sm tabular-nums')}>
              {prefixSum}
            </span>
          </div>
        );
      })}
      <div className="absolute bottom-0 left-0 flex items-center">0</div>
      <div className="absolute right-0 bottom-0 flex items-center">{sumValues}</div>
    </div>
  );
};

interface CategoryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  values: number[];
  colors: string[];
  showLabels?: boolean;
}

const CategoryBar = React.forwardRef<HTMLDivElement, CategoryBarProps>(
  ({ values = [], colors = [], showLabels = true, className, ...props }, forwardedRef) => {
    const maxValue = React.useMemo(() => sumNumericArray(values), [values]);

    return (
      <div ref={forwardedRef} className={cx(className)} aria-label="category bar" {...props}>
        {showLabels ? <BarLabels values={values} /> : null}
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

export { CategoryBar, type CategoryBarProps };
