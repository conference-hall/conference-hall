import React from 'react';
import { Link, LinkProps } from '@remix-run/react';
import cn from 'classnames';

type ButtonProps = ButtonStylesProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant,
  size,
  block,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const styles = getStyles({ variant, size, block, disabled, className });
  return (
    <button className={styles} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ButtonStylesProps & LinkProps;

export function ButtonLink({
  to,
  children,
  variant,
  size,
  block,
  disabled,
  className,
  ...rest
}: ButtonLinkProps) {
  const styles = getStyles({ variant, size, block, disabled, className });
  return (
    <Link to={to} className={styles} {...rest}>
      {children}
    </Link>
  );
}

type ButtonStylesProps = {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'regular' | 'large';
  block?: boolean;
  className?: string;
  disabled?: boolean;
};

const getStyles = ({
  variant = 'primary',
  size = 'regular',
  block,
  disabled,
  className,
}: ButtonStylesProps) =>
  cn(
    [
      'relative inline-flex items-center px-4 py-2',
      'border rounded-md shadow-sm',
      'text-sm font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    ],
    {
      ['text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent']:
        variant === 'primary',
      ['text-gray-700 bg-white hover:bg-gray-50 border-gray-300']:
        variant === 'secondary',
      ['text-gray-400 bg-gray-100 hover:bg-gray-100 border-gray-300 cursor-not-allowed']:
        disabled,
      ['px-2.5 py-1.5 text-xs']: size === 'small',
      ['px-6 py-3 text-base']: size === 'large',
      ['w-full justify-center']: block,
    },
    className
  );
