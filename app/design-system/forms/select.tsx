import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';
import { menuItem, menuItems } from '../styles/menu.styles.ts';
import { SelectTransition } from '../transitions.tsx';

type Props = {
  name: string;
  label: string;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (name: string, value: string) => void;
  options: Array<{
    id?: string | null;
    name: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    hidden?: boolean;
    iconClassname?: string;
  }>;
  className?: string;
  srOnly?: boolean;
};

export default function Select({
  name,
  label,
  value,
  defaultValue,
  onChange,
  options,
  className,
  srOnly = false,
}: Props) {
  const [_value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (id: string) => {
      setValue(id);
      if (onChange) onChange(name, id);
    },
    [name, onChange],
  );

  const currentValue = value ?? _value;

  return (
    <Listbox name={name} value={currentValue || ''} onChange={handleChange}>
      {({ open }) => {
        const { name, icon: Icon, iconClassname } = options.find((o) => o.id === currentValue) || {};

        return (
          <Field className={className}>
            <Label className={cx('block text-sm font-medium leading-6 text-gray-900', { 'sr-only': srOnly })}>
              {label}
            </Label>
            <div className={cx('relative', { 'mt-1': !srOnly })}>
              <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-sm leading-6">
                <span className="flex justify-start items-center gap-2 truncate">
                  {Icon && <Icon className={cx('h-4 w-4 shrink-0', iconClassname)} aria-hidden="true" />}
                  {name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <SelectTransition show={open}>
                <ListboxOptions
                  anchor={{ to: 'bottom start', gap: '4px' }}
                  className={cx(menuItems(), 'w-[var(--button-width)]')}
                >
                  {options
                    .filter((o) => !o.hidden)
                    .map((option) => (
                      <ListboxOption
                        key={option.id}
                        value={option.id}
                        disabled={option.disabled}
                        className={({ focus, disabled }) =>
                          cx(menuItem(), {
                            'bg-gray-100': focus,
                            'text-gray-900 cursor-pointer': !disabled,
                            'text-gray-500 cursor-not-allowed': disabled,
                          })
                        }
                      >
                        {({ selected, disabled }) => (
                          <span
                            className={cx(
                              selected ? 'font-semibold' : 'font-normal',
                              'flex justify-start items-center gap-2 truncate',
                            )}
                          >
                            {option.icon && (
                              <option.icon
                                className={cx('h-4 w-4 shrink-0', { [option.iconClassname || '']: !disabled })}
                                aria-hidden="true"
                              />
                            )}
                            {option.name}
                          </span>
                        )}
                      </ListboxOption>
                    ))}
                </ListboxOptions>
              </SelectTransition>
            </div>
          </Field>
        );
      }}
    </Listbox>
  );
}
