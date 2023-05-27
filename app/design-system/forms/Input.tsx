import { cx } from 'class-variance-authority';
import type { Ref } from 'react';
import { forwardRef } from 'react';

import { Label } from '../Typography';

export type InputProps = {
  label?: string;
  description?: string;
  addon?: string;
  error?: string | string[];
  icon?: React.ComponentType<{ className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>;

function InputField(
  { name, label, description, type = 'text', addon, className, icon: Icon, error, ...rest }: InputProps,
  ref: Ref<HTMLInputElement>
) {
  const wrapperStyles = cx(baseStyles, {
    [defaultStyles]: !error,
    [errorStyles]: !!error,
  });

  const inputStyles = cx('block flex-1 border-0 bg-transparent py-1.5 focus:ring-0 sm:text-sm sm:leading-6', {
    'text-gray-900 placeholder:text-gray-400': !error,
    'text-red-900 placeholder-red-300': Boolean(error),
    'pl-2': Boolean(Icon),
    'pl-0.5': Boolean(addon),
  });

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={name} mb={1}>
          {label}
        </Label>
      )}
      <div className={wrapperStyles}>
        {Icon && (
          <div className="pointer-events-none flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        {addon && <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">{addon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={inputStyles}
          autoComplete="off"
          {...rest}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-description` : undefined}
        />
      </div>
      <div id={`${name}-description`}>
        {description && <p className="mt-3 text-sm text-gray-600">{description}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

const baseStyles =
  'flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ';

const defaultStyles = 'ring-gray-300 focus:ring-indigo-500 focus:border-indigo-500';

const errorStyles = 'ring-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';

export const Input = forwardRef(InputField);
