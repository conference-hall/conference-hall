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

type BaseMarkerGroupProps = {
  name?: string;
  options: MarkerOption[];
  withTooltip?: boolean;
} & Pick<VariantProps<typeof markerButtonStyles>, 'size' | 'variant'>;

type SingleSelectMarkerGroupProps = BaseMarkerGroupProps & {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
};

type MultiSelectMarkerGroupProps = BaseMarkerGroupProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type MarkerGroupProps = SingleSelectMarkerGroupProps | MultiSelectMarkerGroupProps;

export function MarkerGroup(props: MarkerGroupProps) {
  const { name, options, size, variant, withTooltip = false } = props;

  const handleClick = (markerValue: string) => {
    if (props.multiple) {
      const next = props.value.includes(markerValue)
        ? props.value.filter((v) => v !== markerValue)
        : [...props.value, markerValue];
      props.onChange(next);
    } else {
      props.onChange(props.value === markerValue ? null : markerValue);
    }
  };

  const isActive = (option: MarkerOption, index: number): boolean => {
    if (props.multiple) {
      return props.value.includes(option.value);
    }
    if (!props.value) return false;
    const selectedIndex = options.findIndex((o) => o.value === props.value);
    if (selectedIndex === -1) return false;

    if (option.cumulative && options[selectedIndex]?.cumulative) {
      return index <= selectedIndex;
    }
    if (option.cumulative && props.value === 'positive') {
      return true;
    }
    return props.value === option.value;
  };

  return (
    <div className="inline-flex">
      {name && !props.multiple && <input type="hidden" name={name} value={props.value ?? ''} />}
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
