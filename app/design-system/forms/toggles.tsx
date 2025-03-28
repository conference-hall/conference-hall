import { Description, Field, Label, Switch } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';

type ToggleProps = {
  name?: string;
  label?: string;
  value: boolean;
  onChange?: (checked: boolean) => void;
};

export function Toggle({ name, label, value, onChange }: ToggleProps) {
  const [enabled, setEnabled] = useState<boolean>(value);

  const handleChange = useCallback(
    (checked: boolean) => {
      setEnabled(checked);
      if (onChange) onChange(checked);
    },
    [onChange],
  );

  return (
    <Switch
      name={name}
      aria-label={label}
      checked={enabled}
      onChange={handleChange}
      className={cx(
        enabled ? 'bg-indigo-600' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
        )}
      />
    </Switch>
  );
}

type ToggleGroupProps = {
  name?: string;
  label: string;
  value: boolean;
  description?: string;
  reverse?: boolean;
  onChange?: (checked: boolean) => void;
};

export function ToggleGroup({ name, label, value, description, reverse, onChange }: ToggleGroupProps) {
  return (
    <Field className={cx('flex items-center', { 'flex-row-reverse gap-4': reverse })}>
      <span className="flex grow flex-col mr-4">
        <Label className="text-sm font-medium leading-6 text-gray-900" passive>
          {label}
        </Label>
        {description && <Description className="text-sm text-gray-500">{description}</Description>}
      </span>

      <Toggle name={name} value={value} onChange={onChange} />
    </Field>
  );
}
