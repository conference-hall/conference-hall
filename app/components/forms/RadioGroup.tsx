import { ReactNode } from 'react';
import cn from 'classnames';

type RadioGroupProps = {
  label: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

export function RadioGroup({ label, description, inline, className, children }: RadioGroupProps) {
  const layoutStyle = cn('space-y-4', { 'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline });

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

type RadioProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Radio({ id, name, children, ...rest }: RadioProps) {
  return (
    <div key={id} className="flex items-center">
      <input
        id={id}
        name={name}
        type="radio"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
        {...rest}
      />
      <label htmlFor={id} className="ml-3 block text-sm text-gray-700">
        {children}
      </label>
    </div>
  );
}
