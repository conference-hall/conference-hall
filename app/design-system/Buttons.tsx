import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import React from 'react';

export const button = cva(
  [
    'inline-flex items-center justify-center gap-x-2',
    'font-medium whitespace-nowrap rounded-md shadow-sm',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  ],
  {
    variants: {
      variant: {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-500',
        secondary: 'text-gray-700 bg-white hover:bg-gray-50 ring-1 ring-inset ring-gray-300',
      },
      size: {
        s: 'px-2.5 py-1.5 text-xs font-semibold',
        m: 'px-3 py-2 text-sm font-semibold',
      },
      disabled: { true: 'opacity-50 cursor-not-allowed' },
      loading: { true: 'opacity-50 cursor-not-allowed' },
      block: { true: 'sm:w-full justify-center' },
    },
    defaultVariants: { variant: 'primary', size: 'm' },
  },
);

const icon = cva('', {
  variants: {
    variant: { primary: '', secondary: 'text-gray-400 group-hover:text-gray-500' },
    size: { s: 'h-4 w-4', m: 'h-5 w-5' },
    dir: { left: '', right: '' },
  },
  compoundVariants: [
    { size: 's', dir: 'left', className: '-ml-0.5' },
    { size: 's', dir: 'right', className: '-mr-0.5' },
    { size: 'm', dir: 'left', className: '-ml-1' },
    { size: 'm', dir: 'right', className: '-mr-1' },
  ],
  defaultVariants: { size: 'm' },
});

type ButtonVariants = VariantProps<typeof button>;

export type ButtonStylesProps = ButtonVariants & {
  iconLeft?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
};

export type ButtonProps = ButtonStylesProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

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
  const styles = button({ variant, size, block, disabled, loading, className });

  return (
    <button className={styles} disabled={disabled} aria-disabled={disabled} {...rest}>
      {IconLeft && <IconLeft className={icon({ variant, size, dir: 'left' })} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={icon({ variant, size, dir: 'right' })} aria-hidden="true" />}
    </button>
  );
}

export type ButtonLinkProps = ButtonStylesProps & LinkProps;

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
      {IconLeft && <IconLeft className={icon({ variant, size, dir: 'left' })} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={icon({ variant, size, dir: 'right' })} aria-hidden="true" />}
    </Link>
  );
}
