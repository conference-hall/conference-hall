import type { ReactNode, Ref } from 'react';
import { forwardRef } from 'react';
import cn from 'classnames';

type CheckboxGroupProps = {
  label: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

export function CheckboxGroup({ label, description, inline, className, children }: CheckboxGroupProps) {
  const layoutStyle = cn('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {description && <p className="text-sm leading-5 text-gray-500">{description}</p>}
      <fieldset className="mt-2">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

export function CheckboxHeadingGroup({ label, description, inline, className, children }: CheckboxGroupProps) {
  const layoutStyle = cn('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <fieldset className="mt-4">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

type CheckboxProps = {
  description?: string | null;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function CheckboxField(
  { id, name, description, className, children, ...rest }: CheckboxProps,
  ref: Ref<HTMLInputElement>
) {
  return (
    <div className={cn('relative flex items-start', className)}>
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          id={id}
          aria-describedby={`${id}-description`}
          name={name}
          type="checkbox"
          className={cn('h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500', {
            'cursor-not-allowed opacity-50': rest?.disabled,
          })}
          {...rest}
        />
      </div>
      {children && (
        <label htmlFor={id} className="pl-3 text-sm text-gray-900">
          {children}
          {description && (
            <p id={`${id}-description`} className="text-gray-500">
              {description}
            </p>
          )}
        </label>
      )}
    </div>
  );
}

export const Checkbox = forwardRef(CheckboxField);
