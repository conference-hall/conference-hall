import { Checkbox } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { SelectAllState } from '~/design-system/list/use-list-selection.tsx';
import { Text } from '~/design-system/typography.tsx';

export type SelectAllProps = {
  state: SelectAllState;
  disabled?: boolean;
  onChange: VoidFunction;
};

type SelectAllCheckboxProps = SelectAllProps & {
  children?: ReactNode;
  'aria-label': string;
};

export function SelectAllCheckbox({ state, disabled, onChange, children, ...rest }: SelectAllCheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        {state === 'all' && (
          <span aria-hidden="true" className="absolute -top-1 -right-1 h-4 w-4 rounded-sm border border-indigo-300" />
        )}
        <Checkbox
          checked={state === 'page' || state === 'all'}
          indeterminate={state === 'partial'}
          disabled={disabled}
          onChange={onChange}
          aria-label={rest['aria-label']}
          className={cx(
            'relative flex h-4 w-4 items-center justify-center rounded-sm border transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-hidden',
            state === 'none' ? 'border-gray-300 bg-white' : 'border-indigo-600 bg-indigo-600',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <CheckboxIcon state={state} />
        </Checkbox>
      </div>
      {children && <Text>{children}</Text>}
    </div>
  );
}

function CheckboxIcon({ state }: { state: SelectAllState }) {
  if (state === 'none') return null;

  if (state === 'partial') {
    return (
      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden="true">
        <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden="true">
      <path
        d="M2.5 8.2L6 11.6L13.5 3.6"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
