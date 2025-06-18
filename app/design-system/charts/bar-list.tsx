// Tremor Raw BarList [v0.1.0]

import { cx } from 'class-variance-authority';
import React from 'react';
import { Link } from 'react-router';

type Bar<T> = T & {
  id?: string;
  to?: string;
  value: number;
  name: string;
};

interface BarListProps<T = unknown> extends React.ComponentProps<'div'> {
  data: Bar<T>[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  onValueChange?: (payload: Bar<T>) => void;
  sortOrder?: 'ascending' | 'descending' | 'none';
}

function BarListInner<T>({
  data = [],
  valueFormatter = (value) => value.toString(),
  showAnimation = false,
  sortOrder = 'descending',
  className,
  ref,
  ...props
}: BarListProps<T>) {
  const sortedData = React.useMemo(() => {
    if (sortOrder === 'none') {
      return data;
    }
    return [...data].sort((a, b) => {
      return sortOrder === 'ascending' ? a.value - b.value : b.value - a.value;
    });
  }, [data, sortOrder]);

  const widths = React.useMemo(() => {
    const maxValue = Math.max(...sortedData.map((item) => item.value), 0);
    return sortedData.map((item) => (item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2)));
  }, [sortedData]);

  const rowHeight = 'h-8';

  return (
    <div ref={ref} className={cx('flex justify-between space-x-6', className)} {...props}>
      <div className="relative w-full space-y-1.5">
        {sortedData.map((item, index) => (
          <div key={item.id ?? item.name} className="group w-full rounded-sm">
            <div
              className={cx(
                // base
                'flex items-center rounded-sm transition-all',
                rowHeight,
                // background color
                'bg-indigo-200',
                // margin and duration
                {
                  'mb-0': index === sortedData.length - 1,
                  'duration-800': showAnimation,
                },
              )}
              style={{ width: `${widths[index]}%` }}
            >
              <div className={cx('absolute left-2 flex max-w-full pr-2')}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className={cx(
                      // base
                      'truncate whitespace-nowrap rounded-sm text-sm',
                      // text color
                      'text-gray-900',
                      // hover
                      'hover:underline hover:underline-offset-2',
                    )}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p
                    className={cx(
                      // base
                      'truncate whitespace-nowrap text-sm',
                      // text color
                      'text-gray-900',
                    )}
                  >
                    {item.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        {sortedData.map((item, index) => (
          <div
            key={item.id ?? item.name}
            className={cx(
              'flex items-center justify-end',
              rowHeight,
              index === sortedData.length - 1 ? 'mb-0' : 'mb-1.5',
            )}
          >
            <p
              className={cx(
                // base
                'truncate whitespace-nowrap text-sm leading-none',
                // text color
                'text-gray-900',
              )}
            >
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

BarListInner.displayName = 'BarList';

const BarList = BarListInner as <T>(p: BarListProps<T>) => ReturnType<typeof BarListInner>;

export { BarList, type BarListProps };
