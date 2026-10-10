import { Field, Label, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { SwatchIcon } from '@heroicons/react/16/solid';
import { CheckIcon, ChevronUpDownIcon, NoSymbolIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS, getContrastColor } from '~/shared/colors/colors.ts';
import { menuItem, menuItemIcon, menuItems, menuSeparator } from '../styles/menu.styles.ts';
import { MenuTransition } from '../transitions.tsx';

type ColorInputProps = {
  label: string;
  value: string | null;
  onChange: (color: string | null) => void;
  name?: string;
  nullable?: boolean;
  srOnly?: boolean;
};

export function ColorInput({ label, value, onChange, name, nullable = false, srOnly = false }: ColorInputProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const buttonId = useId();

  const pickerRef = useRef<HTMLInputElement>(null);

  // Native `change` fires once when the picker closes, React's onChange on every drag move.
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;
    const commit = () => onChange(picker.value);
    picker.addEventListener('change', commit);
    return () => picker.removeEventListener('change', commit);
  }, [onChange]);

  const preset = COLORS.find((color) => color.hex.toLowerCase() === value?.toLowerCase());
  const custom = value !== null && !preset;

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    picker.value = value ?? '#000000';
    picker.showPicker();
  };

  return (
    <Field>
      <Label id={labelId} className={cx('block text-sm leading-6 font-medium text-gray-900', { 'sr-only': srOnly })}>
        {label}
      </Label>

      {name && value !== null ? <input type="hidden" name={name} value={value} /> : null}
      <input ref={pickerRef} type="color" tabIndex={-1} aria-hidden className="sr-only" defaultValue="#000000" />

      <Menu>
        <MenuButton
          id={buttonId}
          aria-labelledby={`${labelId} ${buttonId}`}
          className={cx(
            'relative flex h-9 w-full min-w-48 items-center gap-2 rounded-md bg-white py-1.5 pr-10 pl-3 text-left text-sm leading-6 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:outline-hidden',
            { 'mt-1': !srOnly },
          )}
        >
          <span
            className={cx(
              'size-4 shrink-0 rounded-sm',
              value ? 'ring-1 ring-black/10 ring-inset' : 'border border-dashed border-gray-400',
            )}
            style={value ? { backgroundColor: value } : undefined}
          />
          {preset ? (
            <span className="truncate">{t(`common.color.name.${preset.name}`)}</span>
          ) : value ? (
            <span className="truncate font-mono uppercase">{value}</span>
          ) : (
            <span className="truncate text-gray-500">{t('common.color.none')}</span>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="size-5 text-gray-400" aria-hidden="true" />
          </span>
        </MenuButton>

        <MenuTransition>
          <MenuItems anchor={{ to: 'bottom start', gap: '4px' }} className={cx(menuItems(), 'z-50')}>
            <div className="grid grid-cols-5 gap-2 px-4 py-1">
              {COLORS.map((color) => (
                <MenuItem
                  key={color.hex}
                  as="button"
                  type="button"
                  aria-label={t(`common.color.name.${color.name}`)}
                  onClick={() => onChange(color.hex)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md data-focus:ring-2 data-focus:ring-gray-900 data-focus:ring-offset-1"
                  style={{ backgroundColor: color.hex }}
                >
                  {color === preset ? (
                    <CheckIcon className="size-4" style={{ color: getContrastColor(color.hex) }} aria-hidden="true" />
                  ) : null}
                </MenuItem>
              ))}
            </div>

            <div className={menuSeparator()} />

            <MenuItem as="button" type="button" onClick={openPicker} className={menuItem()}>
              {custom ? (
                <span
                  className="size-4 shrink-0 rounded-sm ring-1 ring-black/10 ring-inset"
                  style={{ backgroundColor: value }}
                />
              ) : (
                <SwatchIcon className={menuItemIcon()} aria-hidden="true" />
              )}
              {t('common.color.custom')}
              {custom ? <CheckIcon className={cx(menuItemIcon(), 'ml-auto')} aria-hidden="true" /> : null}
            </MenuItem>

            {nullable ? (
              <MenuItem as="button" type="button" onClick={() => onChange(null)} className={menuItem()}>
                <NoSymbolIcon className={menuItemIcon()} aria-hidden="true" />
                {t('common.color.none')}
                {value === null ? <CheckIcon className={cx(menuItemIcon(), 'ml-auto')} aria-hidden="true" /> : null}
              </MenuItem>
            ) : null}
          </MenuItems>
        </MenuTransition>
      </Menu>
    </Field>
  );
}
