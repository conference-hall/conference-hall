import type { ReactNode } from 'react';
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
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
      <label className="text-lg font-medium leading-6 text-gray-900">{label}</label>
      {description && <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>}
      <fieldset className="mt-6">
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

export function Checkbox({ id, name, description, className, children, ...rest }: CheckboxProps) {
  return (
    <div className={cn('relative flex items-start', className)}>
      <div className="flex h-5 items-center">
        <input
          id={id}
          aria-describedby={`${id}-description`}
          name={name}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          {...rest}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="text-gray-700">
          {children}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}