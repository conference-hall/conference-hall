import { cx } from 'class-variance-authority';
import type { ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import { Label, Text } from '../typography.tsx';

type CheckboxGroupProps = {
  label: string;
  description?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

export function CheckboxGroup({ label, description, inline, className, children }: CheckboxGroupProps) {
  const layoutStyle = cx('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      <Label>{label}</Label>
      {description && <p className="text-sm leading-5 text-gray-500">{description}</p>}
      <fieldset className="mt-2">
        <legend className="sr-only">{label}</legend>
        <div className={layoutStyle}>{children}</div>
      </fieldset>
    </div>
  );
}

export function CheckboxHeadingGroup({ label, description, inline, className, children }: CheckboxGroupProps) {
  const layoutStyle = cx('space-y-4', {
    'sm:flex sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <div className={className}>
      <Label>{label}</Label>
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
  ref: Ref<HTMLInputElement>,
) {
  return (
    <div className={cx('relative flex ', { 'items-start': description, 'items-center': !description }, className)}>
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          id={id}
          aria-describedby={description ? `${id}-describe` : undefined}
          name={name}
          type="checkbox"
          className={cx('h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500', {
            'cursor-not-allowed opacity-50': rest?.disabled,
            'mt-1.5': description,
          })}
          {...rest}
        />
      </div>
      {children && (
        <div className="pl-3">
          <Label htmlFor={id}>{children}</Label>

          {description && (
            <Text id={`${id}-describe`} variant="secondary">
              {description}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export const Checkbox = forwardRef(CheckboxField);
