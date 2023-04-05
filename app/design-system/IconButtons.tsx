import React from 'react';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import cn from 'classnames';

type DefaultIconButtonProps = { icon: React.ComponentType<{ className?: string }> } & IconButtonStylesProps;

type IconButtonProps = DefaultIconButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function IconButton({ icon: Icon, variant, size, disabled, className, ...rest }: IconButtonProps) {
  const styles = getStyles({ variant, size, disabled, className });
  const iconStyles = getIconStyles({ size });
  return (
    <button className={styles} disabled={disabled} aria-disabled={disabled} {...rest}>
      <Icon className={iconStyles} aria-hidden="true" />
    </button>
  );
}

type IconButtonLinkProps = DefaultIconButtonProps & Omit<LinkProps, 'children'>;

export function IconButtonLink({ icon: Icon, variant, size, disabled, className, ...rest }: IconButtonLinkProps) {
  const styles = getStyles({ variant, size, disabled, className });
  const iconStyles = getIconStyles({ size });
  return (
    <Link className={styles} {...rest}>
      <Icon className={iconStyles} aria-hidden="true" />
    </Link>
  );
}

type IconButtonStylesProps = {
  variant?: 'primary' | 'secondary';
  size?: 'xs' | 's' | 'm' | 'l';
  className?: string;
  disabled?: boolean;
};

const getStyles = ({ variant = 'primary', size = 'm', disabled, className }: IconButtonStylesProps) =>
  cn(
    [
      'inline-flex items-center rounded-full flex-shrink-0',
      'border border-transparent',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    ],
    {
      'text-white shadow-sm bg-indigo-600 hover:bg-indigo-700 border border-transparent': variant === 'primary',
      'text-gray-700 bg-transparent hover:bg-gray-200': variant === 'secondary',
      'opacity-50 cursor-not-allowed': disabled,
      'p-0.5': size === 'xs',
      'p-1': size === 's',
      'p-1.5': size === 'm',
      'p-2': size === 'l',
    },
    className
  );

const getIconStyles = ({ size = 'm' }: IconButtonStylesProps) =>
  cn({
    'h-4 w-4': size === 'xs',
    'h-5 w-5': size === 's' || size === 'm',
    'h-6 w-6': size === 'l',
  });
