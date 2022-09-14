import React from 'react';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import cn from 'classnames';

type ButtonProps = ButtonStylesProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant,
  size,
  block,
  disabled,
  loading,
  className,
  iconClassName,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, className });
  return (
    <button className={styles} disabled={disabled} aria-disabled={disabled} {...rest}>
      {IconLeft && <IconLeft className={getIconStyle({ size, dir: 'left', iconClassName })} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={getIconStyle({ size, dir: 'right', iconClassName })} aria-hidden="true" />}
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
  className,
  iconClassName,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonLinkProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, className });
  return (
    <Link className={styles} {...rest}>
      {IconLeft && <IconLeft className={getIconStyle({ size, dir: 'left', iconClassName })} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className={getIconStyle({ size, dir: 'right', iconClassName })} aria-hidden="true" />}
    </Link>
  );
}

export type ButtonStylesProps = {
  variant?: 'primary' | 'secondary';
  size?: 's' | 'm' | 'l';
  block?: boolean;
  loading?: boolean;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  iconLeft?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
};

export const getStyles = ({
  variant = 'primary',
  size = 'm',
  block,
  disabled,
  loading,
  className,
}: ButtonStylesProps) =>
  cn(
    [
      'relative inline-flex justify-center items-center whitespace-nowrap',
      'w-full sm:w-auto',
      'border rounded-md shadow-sm',
      'font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    ],
    {
      'text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent': variant === 'primary',
      'text-gray-700 bg-white hover:bg-gray-50 border-gray-300': variant === 'secondary',
      'opacity-50 cursor-not-allowed': disabled || loading,
      'px-2.5 py-1.5 text-xs': size === 's',
      'px-4 py-2 text-sm': size === 'm',
      'px-6 py-3 text-base': size === 'l',
      'sm:w-full': block,
    },
    className
  );

type IconStylesProps = {
  size?: 's' | 'm' | 'l';
  dir?: 'right' | 'left';
  iconClassName?: string;
};

const getIconStyle = ({ size = 'm', dir, iconClassName }: IconStylesProps) =>
  cn(
    {
      '-ml-0.5 mr-2 h-4 w-4': size === 's' && dir === 'left',
      '-ml-1 mr-2 h-5 w-5': size === 'm' && dir === 'left',
      '-ml-1 mr-3 h-5 w-5': size === 'l' && dir === 'left',
      'ml-2 -mr-0.5 h-4 w-4': size === 's' && dir === 'right',
      'ml-2 -mr-1 h-5 w-5': size === 'm' && dir === 'right',
      'ml-3 -mr-1 h-5 w-5': size === 'l' && dir === 'right',
    },
    iconClassName
  );
