import { cx } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import { Label, Text } from '../typography.tsx';

type CheckboxGroupProps = {
  label: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
  error?: SubmissionError;
};

export function CheckboxGroup({ label, description, inline, className, children, error }: CheckboxGroupProps) {
  const layoutStyle = cx('space-y-2', { 'sm:flex sm:flex-wrap sm:items-center sm:space-y-0 sm:space-x-10': inline });

  return (
    <div className={className}>
      <Label aria-invalid={Boolean(error)}>{label}</Label>
      {description && <p className="text-sm leading-5 text-gray-500">{description}</p>}
      {error && <p className="text-sm leading-5 text-red-600">{error}</p>}
      <fieldset className="mt-2">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

type CheckboxProps = { description?: string | null; className?: string } & Omit<React.ComponentProps<'input'>, 'id'>;

export function Checkbox({ name, description, className, children, ref, ...rest }: CheckboxProps) {
  const id = useId();

  return (
    <div className={cx('relative flex ', { 'items-start': description, 'items-center': !description }, className)}>
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          id={id}
          aria-describedby={description ? `${id}-describe` : undefined}
          name={name}
          type="checkbox"
          className={cx('h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500', {
            'cursor-not-allowed opacity-50': rest?.disabled,
            'mt-1.5': description,
          })}
          {...rest}
        />
      </div>
      {children && (
        <div>
          <Label htmlFor={id} weight="normal" className="pl-3">
            {children}
          </Label>

          {description && (
            <Text id={`${id}-describe`} variant="secondary" className="pl-3">
              {description}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
