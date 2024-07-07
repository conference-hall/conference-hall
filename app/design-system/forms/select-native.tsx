import { cx } from 'class-variance-authority';
import type { SelectHTMLAttributes } from 'react';

import { Label } from '../typography.tsx';

type Props = {
  name: string;
  label: string;
  options: Array<{ name: string; value: string }>;
  inline?: boolean;
  srOnly?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectNative({ name, label, options, inline, srOnly, ...rest }: Props) {
  return (
    <div className={cx({ 'flex items-center gap-2': inline })}>
      <Label htmlFor={name} className={cx({ 'sr-only': srOnly })}>
        {label}
      </Label>

      <select
        id={name}
        name={name}
        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
