import { Fieldset, Legend, Radio, RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';

type Props = {
  label: string;
  value?: string | null;
  onChange?: (value: string) => void;
  srOnly?: boolean;
  options: Array<{ name: string; value: string; color: string }>;
  className?: string;
};

export default function ColorPicker({ label, value, onChange, srOnly, options, className }: Props) {
  return (
    <Fieldset className={className}>
      <Legend
        className={cx('block font-semibold text-gray-900 text-sm leading-6', { 'sr-only': srOnly, 'mb-6': !srOnly })}
      >
        {label}
      </Legend>
      <RadioGroup value={value || options[0]?.value} onChange={onChange} className="flex items-center gap-3">
        {options.map((option) => (
          <Radio
            key={option.name}
            value={option.value}
            aria-label={option.name}
            className={cx(
              option.color,
              'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 ring-current focus:outline-hidden data-focus:data-checked:ring-3 data-focus:data-checked:ring-offset-1 data-checked:ring-2',
            )}
          >
            <span aria-hidden="true" className="h-5 w-5 rounded-full border border-black/10 bg-current" />
          </Radio>
        ))}
      </RadioGroup>
    </Fieldset>
  );
}
