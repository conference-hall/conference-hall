import { cva } from 'class-variance-authority';
import type { InputHTMLAttributes, Ref } from 'react';
import { forwardRef } from 'react';

import { Label } from '../typography.cap.tsx';

export type InputProps = {
  label?: string;
  addon?: string;
  error?: string | string[];
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'm' | 'l';
  color?: 'light' | 'dark';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

function InputField(
  { name, label, type = 'text', icon: Icon, addon, error, description, color, size, className, ...rest }: InputProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={name} mb={1}>
          {label}
        </Label>
      )}
      <div className={containerStyle({ color, error: !!error })}>
        {Icon && (
          <div className={iconStyle({ color })}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        {addon && <span className={addonStyle({ color })}>{addon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={inputStyle({ color, size, error: !!error, icon: !!Icon, addon: !!addon })}
          autoComplete="off"
          {...rest}
          aria-invalid={Boolean(error)}
          aria-describedby={error || description ? `${name}-describe` : undefined}
        />
      </div>
      {(error || description) && (
        <p id={`${name}-describe`} className={descriptionStyle({ color, error: !!error })}>
          {error || description}
        </p>
      )}
    </div>
  );
}

const containerStyle = cva(
  'flex w-full rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset border-0',
  {
    variants: {
      color: {
        light: 'bg-white ring-gray-300 focus-within:ring-indigo-600',
        dark: 'bg-gray-700 ring-gray-700 focus-within:ring-indigo-500',
      },
      error: {
        true: 'ring-red-300 focus:ring-red-500 focus:border-red-500',
      },
    },
    defaultVariants: { color: 'light', error: false },
  },
);

const inputStyle = cva('block flex-1 border-0 bg-transparent focus:ring-0', {
  variants: {
    color: {
      light: 'text-gray-900 placeholder:text-gray-400',
      dark: 'text-gray-300 placeholder:text-gray-400',
    },
    size: {
      m: 'py-1.5 text-sm leading-6',
      l: 'py-3 px-5 text-sm leading-6',
    },
    error: { true: 'text-red-700 placeholder-red-300' },
    icon: { true: 'pl-2' },
    addon: { true: 'md:pl-0' },
  },
  defaultVariants: { color: 'light', size: 'm', error: false, icon: false, addon: false },
});

const iconStyle = cva('pointer-events-none flex items-center pl-3', {
  variants: {
    color: {
      light: 'text-gray-400',
      dark: 'text-gray-400',
    },
  },
  defaultVariants: { color: 'light' },
});

const addonStyle = cva('hidden md:flex select-none items-center pl-3 text-sm', {
  variants: {
    color: {
      light: 'text-gray-500',
      dark: 'text-gray-400',
    },
  },
  defaultVariants: { color: 'light' },
});

const descriptionStyle = cva('mt-2 text-sm', {
  variants: {
    color: {
      light: 'text-gray-500',
      dark: 'text-gray-400',
    },
    error: { true: 'text-red-500' },
  },
  defaultVariants: { color: 'light', error: false },
});

export const Input = forwardRef(InputField);
