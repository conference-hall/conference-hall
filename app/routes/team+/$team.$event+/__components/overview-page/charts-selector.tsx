import { cx } from 'class-variance-authority';

export type ChartSelectorValue = 'cumulative' | 'count';

type Props = { selected: ChartSelectorValue; onSelect: (value: ChartSelectorValue) => void };

export function ChartSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-1  w-fit rounded-lg bg-slate-100 p-1 ring-1 ring-inset ring-gray-200">
      <button
        onClick={() => onSelect('count')}
        className={cx(
          'flex items-center rounded-md py-1 px-3 text-sm font-semibold outline-none focus-within:ring-2 focus-within:ring-indigo-500',
          {
            'bg-white shadow': selected === 'count',
          },
        )}
      >
        Count
      </button>
      <button
        onClick={() => onSelect('cumulative')}
        className={cx(
          'flex items-center rounded-md py-1 px-3 text-sm font-semibold outline-none focus-within:ring-2 focus-within:ring-indigo-500',
          {
            'bg-white shadow': selected === 'cumulative',
          },
        )}
      >
        Cumulative
      </button>
    </div>
  );
}
