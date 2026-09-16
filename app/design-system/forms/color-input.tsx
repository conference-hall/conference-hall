import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { getContrastColor, getRandomColor } from '~/shared/colors/colors.ts';
import { Tooltip } from '../tooltip.tsx';
import { Checkbox } from './input-checkbox.tsx';

type ColorInputProps = {
  label: string;
  value: string | null;
  onChange: (color: string | null) => void;
  name?: string;
  // When set, the color becomes optional: unchecking the box clears it and hides the swatch.
  toggleLabel?: string;
  className?: string;
};

export function ColorInput({ label, value, onChange, name, toggleLabel, className }: ColorInputProps) {
  const swatch =
    value === null ? null : (
      <Tooltip text={label} placement="bottom">
        <div className="relative h-9 w-12 shrink-0">
          <input
            type="color"
            name={name}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-12 cursor-pointer bg-white [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
          />
          <PaintBrushIcon
            className="pointer-events-none absolute top-1.5 left-3 size-6"
            style={{ color: getContrastColor(value) }}
          />
        </div>
      </Tooltip>
    );

  if (!toggleLabel) return swatch;

  return (
    <div className={cx('flex items-center gap-3', className)}>
      <Checkbox checked={value !== null} onChange={(event) => onChange(event.target.checked ? getRandomColor() : null)}>
        {toggleLabel}
      </Checkbox>
      {swatch}
    </div>
  );
}
