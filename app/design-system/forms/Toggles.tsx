import { Switch } from '@headlessui/react';
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
    [onChange]
  );

  return (
    <Switch
      name={name}
      aria-label={label}
      checked={enabled}
      onChange={handleChange}
      className={cx(
        enabled ? 'bg-indigo-600' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
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
  onChange?: (checked: boolean) => void;
};

export function ToggleGroup({ name, label, value, description, onChange }: ToggleGroupProps) {
  return (
    <Switch.Group as="div" className="flex items-center justify-between">
      <span className="flex flex-grow flex-col">
        <Switch.Label as="span" className="text-sm font-medium leading-6 text-gray-900" passive>
          {label}
        </Switch.Label>
        {description && (
          <Switch.Description as="span" className="text-sm text-gray-500">
            {description}
          </Switch.Description>
        )}
      </span>

      <Toggle name={name} value={value} onChange={onChange} />
    </Switch.Group>
  );
}
