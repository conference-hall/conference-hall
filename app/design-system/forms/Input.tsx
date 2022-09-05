import cn from 'classnames';
import type { Ref } from 'react';
import { forwardRef } from 'react';

type Props = {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>;

function InputField(
  { id, label, type = 'text', className, icon: Icon, error, ...rest }: Props,
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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
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
          id={id}
          type={type}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-description` : undefined}
          className={styles}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-description`}>
          {error}
        </p>
      )}
    </div>
  );
}

const baseStyles = cn(['block w-full', 'sm:text-sm', 'rounded-md']);

const defaultStyles = cn(['border-gray-300', 'focus:ring-indigo-500 focus:border-indigo-500']);

const errorStyles = cn([
  'border-red-300 text-red-900 placeholder-red-300',
  'focus:outline-none focus:ring-red-500 focus:border-red-500',
]);

export const Input = forwardRef(InputField);
