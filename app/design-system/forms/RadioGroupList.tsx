import { RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';

type Props = {
  name: string;
  label: string;
  options: { value: string; title: string; description: string }[];
  value?: string;
  onChange?: (value: string) => void;
};

export function RadioGroupList({ name, label, options, value, onChange }: Props) {
  return (
    <RadioGroup name={name} value={value} onChange={onChange}>
      <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
      <div className="-space-y-px rounded-md bg-white">
        {options.map((option, optionIdx) => (
          <RadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ checked }) =>
              cx(
                optionIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                optionIdx === options.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                'relative flex cursor-pointer border p-4 focus:outline-none',
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className={cx(
                    checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                    active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
                    'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center',
                  )}
                  aria-hidden="true"
                >
                  <span className="rounded-full bg-white w-1.5 h-1.5" />
                </span>
                <span className="ml-3 flex flex-col">
                  <RadioGroup.Label
                    as="span"
                    className={cx(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}
                  >
                    {option.title}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="span"
                    className={cx(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}
                  >
                    {option.description}
                  </RadioGroup.Description>
                </span>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
