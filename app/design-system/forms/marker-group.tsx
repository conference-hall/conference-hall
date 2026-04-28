import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Tooltip } from '~/design-system/tooltip.tsx';

export type MarkerOption = {
  value: string;
  icon: ComponentType<{ className?: string }>;
  fill: string;
  label: string;
  cumulative?: boolean;
};

const markerButtonStyles = cva('flex cursor-pointer items-center justify-center transition-colors duration-150', {
  variants: {
    variant: {
      outline: 'shadow-xs ring-1 ring-inset',
      ghost: 'rounded-lg',
    },
    size: {
      sm: 'h-7 px-1.5',
      md: 'h-9 px-1.5',
    },
    active: { true: '', false: '' },
    first: { true: '', false: '' },
    last: { true: '', false: '' },
  },
  compoundVariants: [
    { variant: 'outline', first: true, className: 'rounded-l-md' },
    { variant: 'outline', last: true, className: 'rounded-r-md' },
    { variant: 'outline', first: false, className: '-ml-px' },
    { variant: 'outline', active: true, className: 'bg-indigo-100 ring-indigo-200 hover:bg-indigo-200' },
    { variant: 'outline', active: false, className: 'bg-white ring-gray-300 hover:bg-gray-50' },
    { variant: 'ghost', active: true, className: 'hover:bg-gray-100' },
    { variant: 'ghost', active: false, className: 'hover:bg-gray-100' },
  ],
  defaultVariants: { variant: 'outline', size: 'sm', active: false, first: false, last: false },
});

const markerIconStyles = cva('', {
  variants: {
    size: { sm: 'h-4 w-4', md: 'h-7 w-7' },
  },
  defaultVariants: { size: 'sm' },
});

type MarkerGroupProps = {
  name?: string;
  options: MarkerOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  withTooltip?: boolean;
} & Pick<VariantProps<typeof markerButtonStyles>, 'size' | 'variant'>;

export function MarkerGroup({ name, options, value, onChange, size, variant, withTooltip = false }: MarkerGroupProps) {
  const handleClick = (markerValue: string) => {
    onChange(value === markerValue ? null : markerValue);
  };

  const isActive = (option: MarkerOption, index: number): boolean => {
    if (!value) return false;
    const selectedIndex = options.findIndex((o) => o.value === value);
    if (selectedIndex === -1) return false;

    if (option.cumulative && options[selectedIndex]?.cumulative) {
      return index <= selectedIndex;
    }
    if (option.cumulative && value === 'positive') {
      return true;
    }
    return value === option.value;
  };

  return (
    <div className="inline-flex">
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      {options.map((option, index) => {
        const active = isActive(option, index);
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        const Icon = option.icon;

        const button = (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            title={withTooltip ? undefined : option.label}
            onClick={() => handleClick(option.value)}
            className={markerButtonStyles({ variant, size, active, first: isFirst, last: isLast })}
          >
            <Icon className={cx(markerIconStyles({ size }), active ? option.fill : 'stroke-gray-600')} />
          </button>
        );

        if (withTooltip) {
          return (
            <Tooltip key={option.value} text={option.label}>
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
}
