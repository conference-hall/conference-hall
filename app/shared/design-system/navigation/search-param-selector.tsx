import { cx } from 'class-variance-authority';
import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

type Selector = { label: string; value: string };

type SearchParamSelectorProps = {
  param: string;
  defaultValue?: string;
  className?: string;
  selectors: Array<Selector>;
};

export function SearchParamSelector({ param, defaultValue, className, selectors }: SearchParamSelectorProps) {
  const [searchParams] = useSearchParams();
  const current = searchParams.get(param) ?? defaultValue;

  const paramsFor = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(param, value);
      return params.toString();
    },
    [searchParams, param],
  );

  return (
    <div className={cx('flex gap-1  w-fit rounded-lg bg-slate-100 p-1 ring-1 ring-inset ring-gray-200', className)}>
      {selectors.map((selector) => (
        <Link
          key={selector.value}
          to={{ search: paramsFor(selector.value) }}
          className={cx(
            'flex items-center rounded-md py-1 px-3 text-sm font-semibold outline-hidden focus-within:ring-2 focus-within:ring-indigo-500',
            {
              'bg-white shadow-sm': current === selector.value,
            },
          )}
        >
          {selector.label}
        </Link>
      ))}
    </div>
  );
}
