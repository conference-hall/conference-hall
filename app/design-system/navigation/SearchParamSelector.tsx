import { Link, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useCallback } from 'react';

type Selector = { label: string; value: string };
type SearchParamSelectorProps = { param: string; defaultValue?: string; selectors: Array<Selector> };

export function SearchParamSelector({ param, defaultValue, selectors }: SearchParamSelectorProps) {
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
    <div className="flex gap-1  w-fit rounded-lg bg-slate-100 p-1 ring-1 ring-inset ring-gray-200">
      {selectors.map((selector) => (
        <Link
          key={selector.value}
          to={{ search: paramsFor(selector.value) }}
          className={cx('flex items-center rounded-md py-1 px-3 text-sm font-semibold', {
            'bg-white shadow': current === selector.value,
          })}
        >
          {selector.label}
        </Link>
      ))}
    </div>
  );
}
