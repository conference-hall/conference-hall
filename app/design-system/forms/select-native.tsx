import type { SelectHTMLAttributes } from 'react';

import { Label } from '../typography.tsx';

type Props = {
  name: string;
  label: string;
  options: Array<{ name: string; value: string }>;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectNative({ name, label, options, ...rest }: Props) {
  return (
    <div>
      <Label htmlFor={name} mb={1}>
        {label}
      </Label>

      <select
        id={name}
        name={name}
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
