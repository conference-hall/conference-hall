import React from 'react';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import cn from 'classnames';

export type ButtonStylesProps = {
  variant?: 'primary' | 'secondary';
  size?: 's' | 'm' | 'l';
  block?: boolean;
  loading?: boolean;
  rounded?: boolean;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
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
  rounded,
  className,
  iconClassName,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, rounded, className });
  return (
    <button className={styles} disabled={disabled} aria-disabled={disabled} {...rest}>
      {IconLeft && (
        <IconLeft className={getIconStyle({ size, variant, dir: 'left', iconClassName })} aria-hidden="true" />
      )}
      {children}
      {IconRight && (
        <IconRight className={getIconStyle({ size, variant, dir: 'right', iconClassName })} aria-hidden="true" />
      )}
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
  rounded,
  className,
  iconClassName,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonLinkProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, rounded, className });
  return (
    <Link className={styles} {...rest}>
      {IconLeft && (
        <IconLeft className={getIconStyle({ size, dir: 'left', variant, iconClassName })} aria-hidden="true" />
      )}
      {children}
      {IconRight && (
        <IconRight className={getIconStyle({ size, dir: 'right', variant, iconClassName })} aria-hidden="true" />
      )}
    </Link>
  );
}

export const getStyles = ({
  variant = 'primary',
  size = 'm',
  block,
  disabled,
  loading,
  rounded,
  className,
}: ButtonStylesProps) =>
  cn(
    [
      'relative inline-flex justify-center items-center whitespace-nowrap',
      'w-full sm:w-auto',
      'border shadow-sm',
      'group font-medium',
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
      'rounded-md': !rounded,
      'rounded-full': rounded,
    },
    className
  );

type IconStylesProps = {
  size?: 's' | 'm' | 'l';
  variant?: 'primary' | 'secondary';
  dir?: 'right' | 'left';
  iconClassName?: string;
};

const getIconStyle = ({ size = 'm', variant, dir, iconClassName }: IconStylesProps) =>
  cn(
    {
      '-ml-0.5 mr-2 h-4 w-4': size === 's' && dir === 'left',
      '-ml-1 mr-2 h-5 w-5': size === 'm' && dir === 'left',
      '-ml-1 mr-3 h-5 w-5': size === 'l' && dir === 'left',
      'ml-2 -mr-0.5 h-4 w-4': size === 's' && dir === 'right',
      'ml-2 -mr-1 h-5 w-5': size === 'm' && dir === 'right',
      'ml-3 -mr-1 h-5 w-5': size === 'l' && dir === 'right',
      'text-gray-400 group-hover:text-gray-500': variant === 'secondary',
    },
    iconClassName
  );
