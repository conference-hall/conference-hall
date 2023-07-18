import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import React from 'react';

export const button = cva(
  [
    'inline-flex justify-center items-center w-full sm:w-auto',
    'font-medium whitespace-nowrap border rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  ],
  {
    variants: {
      variant: {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-700 border-transparent',
        secondary: 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300',
      },
      size: {
        s: 'px-2.5 py-1.5 text-xs',
        m: 'px-4 py-2 text-sm',
      },
      disabled: { true: 'opacity-50 cursor-not-allowed' },
      loading: { true: 'opacity-50 cursor-not-allowed' },
      block: { true: 'sm:w-full' },
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
    { size: 's', dir: 'left', className: '-ml-0.5 mr-2' },
    { size: 's', dir: 'right', className: 'ml-2 -mr-0.5' },
    { size: 'm', dir: 'left', className: '-ml-1 mr-2' },
    { size: 'm', dir: 'right', className: 'ml-2 -mr-1' },
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
