import { Radio, RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

const options = [
  { name: 'Gray', value: 'gray', color: 'text-gray-500' },
  { name: 'Pink', value: 'pink', color: 'text-pink-500' },
  { name: 'Purple', value: 'purple', color: 'text-purple-500' },
  { name: 'Blue', value: 'blue', color: 'text-blue-500' },
  { name: 'Green', value: 'green', color: 'text-green-500' },
  { name: 'Yellow', value: 'yellow', color: 'text-yellow-500' },
];

type Props = {
  label: string;
  srOnly?: boolean;
  className?: string;
};

export default function ColorPicker({ label, srOnly, className }: Props) {
  const [selectedColor, setSelectedColor] = useState(options[0].value);

  return (
    <fieldset className={className}>
      <legend
        className={cx('block text-sm font-semibold leading-6 text-gray-900', { 'sr-only': srOnly, 'mb-6': !srOnly })}
      >
        {label}
      </legend>
      <RadioGroup value={selectedColor} onChange={setSelectedColor} className="flex items-center space-x-3">
        {options.map((option) => (
          <Radio
            key={option.name}
            value={option.value}
            aria-label={option.name}
            className={cx(
              option.color,
              'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 ring-current focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1',
            )}
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-black border-opacity-10 bg-current"
            />
          </Radio>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
