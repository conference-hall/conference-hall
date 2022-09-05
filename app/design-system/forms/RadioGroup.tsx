import type { ReactNode } from 'react';
import cn from 'classnames';

type RadioGroupProps = {
  label?: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

export function RadioGroup({ label, description, inline, className, children }: RadioGroupProps) {
  const layoutStyle = cn('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {description && <p className="text-sm leading-5 text-gray-500">{description}</p>}
      <fieldset className="mt-2">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

type RadioProps = {
  description?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Radio({ id, name, description, children, ...rest }: RadioProps) {
  return (
    <div className="relative flex items-start">
      <div className="flex h-5 items-center">
        <input
          id={id}
          name={name}
          type="radio"
          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
          {...rest}
        />
      </div>
      <label htmlFor={id} className="block pl-3 text-sm text-gray-700">
        {children}
        {description && (
          <p id={`${id}-description`} className="text-gray-500">
            {description}
          </p>
        )}
      </label>
    </div>
  );
}
