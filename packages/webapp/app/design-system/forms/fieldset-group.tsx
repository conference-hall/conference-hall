import type { SubmissionError } from '@conference-hall/shared/types/errors.types.ts';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Text } from '../typography.tsx';

type FieldsetGroupProps = {
  legend?: string;
  hint?: string;
  inline?: boolean;
  className?: string;
  children: ReactNode;
  error?: SubmissionError;
};

export function FieldsetGroup({ legend, hint, inline, className, children, error }: FieldsetGroupProps) {
  const layoutStyle = cx('space-y-2 mt-3', {
    'sm:flex sm:flex-wrap sm:items-center sm:space-y-0 sm:space-x-10': inline,
  });

  return (
    <fieldset className={className}>
      {legend && (
        <Text as="legend" size="s" weight="medium" aria-invalid={Boolean(error)}>
          {legend}

          {hint && (
            <Text as="span" size="s" weight="normal" variant="secondary" className="ml-1">
              – {hint}
            </Text>
          )}
        </Text>
      )}
      {error && (
        <Text size="s" variant="error">
          {error}
        </Text>
      )}
      <div className={layoutStyle}>{children}</div>
    </fieldset>
  );
}
