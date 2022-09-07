import React from 'react';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import cn from 'classnames';

type ButtonProps = ButtonStylesProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant, size, block, disabled, loading, className, ...rest }: ButtonProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, className });
  return (
    <button className={styles} disabled={disabled} aria-disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ButtonStylesProps & LinkProps;

export function ButtonLink({ children, variant, size, block, disabled, loading, className, ...rest }: ButtonLinkProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, className });
  return (
    <Link className={styles} {...rest}>
      {children}
    </Link>
  );
}

type ButtonStylesProps = {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'regular' | 'large';
  block?: boolean;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
};

const getStyles = ({ variant = 'primary', size = 'regular', block, disabled, loading, className }: ButtonStylesProps) =>
  cn(
    [
      'relative inline-flex justify-center items-center px-4 py-2 whitespace-nowrap',
      'w-full sm:w-auto',
      'border rounded-md shadow-sm',
      'text-sm font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    ],
    {
      'text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent': variant === 'primary',
      'text-gray-700 bg-white hover:bg-gray-50 border-gray-300': variant === 'secondary',
      'opacity-50 cursor-not-allowed': disabled || loading,
      'px-2.5 py-1.5 text-xs': size === 'small',
      'px-6 py-3 text-base': size === 'large',
      'sm:w-full': block,
    },
    className
  );
