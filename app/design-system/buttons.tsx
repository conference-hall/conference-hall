import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type React from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import { LoadingIcon } from './icons/loading-icon.tsx';

export const button = cva(
  [
    'inline-flex items-center justify-center gap-x-2 relative',
    'whitespace-nowrap rounded-md shadow-xs cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  ],
  {
    variants: {
      variant: {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-500',
        secondary: 'text-gray-700 bg-white hover:bg-gray-50 ring-1 ring-inset ring-gray-300',
        important: 'text-red-600 bg-white hover:bg-red-50 ring-1 ring-inset ring-gray-300',
      },
      size: {
        s: 'h-7 px-2.5 py-1.5 text-xs font-semibold',
        m: 'h-9 px-3 py-2 text-sm font-semibold',
        'square-s': 'size-7 text-xs font-semibold',
        'square-m': 'size-9 text-sm font-semibold',
      },
      disabled: { true: 'opacity-50 disabled:cursor-not-allowed' },
      loading: { true: 'cursor-not-allowed' },
      block: { true: 'sm:w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'm' },
  },
);

const icon = cva('shrink-0', {
  variants: {
    variant: {
      primary: '',
      secondary: 'text-gray-400 group-hover:text-gray-500',
      important: 'text-red-500 group-hover:text-red-600',
    },
    size: {
      s: 'size-5',
      m: 'size-5',
      'square-s': 'size-5',
      'square-m': 'size-5',
    },
    loading: { true: 'invisible' },
  },
  defaultVariants: { size: 'm' },
});

type ButtonVariants = VariantProps<typeof button>;

export type ButtonStylesProps = ButtonVariants & {
  iconLeft?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
};

type ButtonProps = ButtonStylesProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant,
  size,
  block,
  disabled,
  loading,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className,
  ...rest
}: ButtonProps) {
  const buttonDisabled = Boolean(disabled || loading);
  const styles = button({ variant, size, block, disabled, loading, className });

  return (
    <button className={styles} disabled={buttonDisabled} aria-disabled={buttonDisabled} {...rest}>
      {IconLeft && <IconLeft className={icon({ variant, size, loading })} aria-hidden="true" />}
      {loading && <LoadingIcon className={icon({ variant, size, className: 'absolute' })} />}
      <span className={cx({ invisible: loading })}>{children}</span>
      {IconRight && <IconRight className={icon({ variant, size, loading })} aria-hidden="true" />}
    </button>
  );
}

type ButtonLinkProps = ButtonStylesProps & LinkProps;

export function ButtonLink({
  children,
  variant,
  size,
  block,
  disabled,
  loading,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className,
  ...rest
}: ButtonLinkProps) {
  const styles = button({ variant, size, block, disabled, loading, className });

  return (
    <Link className={styles} {...rest}>
      {IconLeft && <IconLeft className={icon({ variant, size, loading })} aria-hidden="true" />}
      {loading && <LoadingIcon className={icon({ variant, size, className: 'absolute' })} />}
      <span className={cx({ invisible: loading })}>{children}</span>
      {IconRight && <IconRight className={icon({ variant, size, loading })} aria-hidden="true" />}
    </Link>
  );
}
