import { cx } from 'class-variance-authority';

import type { ChartType } from './proposals-by-days-chart.tsx';

type Props = { selected: ChartType; onSelect: (value: ChartType) => void };

export function ChartSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-1  w-fit rounded-lg bg-slate-100 p-1 ring-1 ring-inset ring-gray-200">
      <button
        type="button"
        onClick={() => onSelect('count')}
        className={cx(
          'flex items-center rounded-md py-1 px-3 text-sm font-semibold outline-hidden focus-within:ring-2 focus-within:ring-indigo-500',
          {
            'bg-white shadow-sm': selected === 'count',
          },
        )}
      >
        Count
      </button>
      <button
        type="button"
        onClick={() => onSelect('cumulative')}
        className={cx(
          'flex items-center rounded-md py-1 px-3 text-sm font-semibold outline-hidden focus-within:ring-2 focus-within:ring-indigo-500',
          {
            'bg-white shadow-sm': selected === 'cumulative',
          },
        )}
      >
        Cumulative
      </button>
    </div>
  );
}
