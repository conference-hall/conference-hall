import { cx } from 'class-variance-authority';
import type { SelectHTMLAttributes } from 'react';
import { Label } from '../typography.tsx';

export type Option = { name: string; value: string };

type Props = {
  name: string;
  label: string;
  options: Array<Option>;
  placeholder?: string;
  inline?: boolean;
  srOnly?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectNative({ name, label, options, placeholder, inline, srOnly, className, ...rest }: Props) {
  return (
    <div className={cx({ 'space-y-1': !inline, 'flex items-center gap-2.5': inline })}>
      <Label htmlFor={name} className={cx({ 'sr-only': srOnly })}>
        {label}
      </Label>

      <select
        id={name}
        name={name}
        className={cx(
          'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-sm leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600',
          className,
        )}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
