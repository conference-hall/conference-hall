import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { SwatchIcon } from '@heroicons/react/16/solid';
import { CheckIcon, NoSymbolIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useEffect, useRef } from 'react';
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
};

export function ColorInput({ label, value, onChange, name, nullable = false }: ColorInputProps) {
  const { t } = useTranslation();

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
  const valueLabel = preset ? t(`common.color.name.${preset.name}`) : (value ?? t('common.color.none'));

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    picker.value = value ?? '#000000';
    picker.showPicker();
  };

  return (
    <>
      {name && value !== null ? <input type="hidden" name={name} value={value} /> : null}
      <input ref={pickerRef} type="color" tabIndex={-1} aria-hidden className="sr-only" defaultValue="#000000" />

      <Menu>
        <MenuButton
          aria-label={t('common.color.button-label', {
            label,
            value: valueLabel,
            interpolation: { escapeValue: false },
          })}
          title={valueLabel}
          className={cx(
            'size-8 shrink-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
            value ? 'ring-1 ring-black/10 ring-inset' : 'border border-dashed border-gray-400 bg-white',
          )}
          style={value ? { backgroundColor: value } : undefined}
        />

        <MenuTransition>
          <MenuItems anchor={{ to: 'bottom start', gap: '4px' }} className={cx(menuItems(), 'z-50')}>
            <div className="flex gap-1.5 px-3 py-1.5">
              {COLORS.map((color) => (
                <MenuItem
                  key={color.hex}
                  as="button"
                  type="button"
                  aria-label={t(`common.color.name.${color.name}`)}
                  title={t(`common.color.name.${color.name}`)}
                  onClick={() => onChange(color.hex)}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-sm data-focus:ring-2 data-focus:ring-gray-900 data-focus:ring-offset-1"
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
    </>
  );
}
