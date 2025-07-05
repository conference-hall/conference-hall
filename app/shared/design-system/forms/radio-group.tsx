import { cx } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';
import type { SubmissionError } from '~/types/errors.types.ts';
import { Label, Text } from '../typography.tsx';

type RadioGroupProps = {
  label?: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
  error?: SubmissionError;
};

export function RadioGroup({ label, description, inline, className, children, error }: RadioGroupProps) {
  const layoutStyle = cx('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      {label && <Label aria-invalid={Boolean(error)}>{label}</Label>}
      {description && <p className="text-sm leading-5 text-gray-500">{description}</p>}
      {error && <p className="text-sm leading-5 text-red-600">{error}</p>}
      <fieldset className="mt-2">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

type RadioProps = {
  description?: string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>;

export function Radio({ name, description, children, ...rest }: RadioProps) {
  const id = useId();
  return (
    <div className="relative flex items-start">
      <div className="flex h-5 items-center mt-0.5">
        <input
          id={id}
          name={name}
          type="radio"
          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
          aria-describedby={description ? `${id}-describe` : undefined}
          {...rest}
        />
      </div>
      <div>
        <Label htmlFor={id} weight="normal" className="pl-3">
          {children}
        </Label>

        {description && (
          <Text id={`${id}-desccribe`} variant="secondary">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
}
