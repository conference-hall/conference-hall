import { ReactNode } from 'react';

type CheckboxGroupProps = { label: string; className?: string; children: ReactNode };

export function CheckboxGroup({ label, className, children }: CheckboxGroupProps) {
  return (
    <div className={className}>
      <fieldset className="space-y-5">
        <legend className="sr-only">{label}</legend>
        {children}
      </fieldset>
    </div>
  );
}

type CheckboxProps = { label: string; description?: string | null } & React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ id, name, label, description, ...rest }: CheckboxProps) {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          aria-describedby={`${id}-description`}
          name={name}
          type="checkbox"
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          {...rest}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {label}
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
