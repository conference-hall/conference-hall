import cn from 'classnames';
import type { Ref } from 'react';
import { forwardRef } from 'react';

export type InputProps = {
  label?: string;
  description?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>;

function InputField(
  { name, label, description, type = 'text', className, icon: Icon, error, ...rest }: InputProps,
  ref: Ref<HTMLInputElement>
) {
  const styles = cn(baseStyles, {
    [defaultStyles]: !error,
    [errorStyles]: !!error,
    'pl-10': Boolean(Icon),
  });

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="mb-2 block text-sm font-medium leading-6 text-gray-900">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={styles}
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

const baseStyles = cn(['block w-full', 'text-gray-900 sm:text-sm', 'rounded-md', 'shadow-sm']);

const defaultStyles = cn(['border-gray-300', 'focus:ring-indigo-500 focus:border-indigo-500']);

const errorStyles = cn([
  'border-red-300 text-red-900 placeholder-red-300',
  'focus:outline-none focus:ring-red-500 focus:border-red-500',
]);

export const Input = forwardRef(InputField);
