import React from 'react';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import c from 'classnames';

const DEFAULT_STYLE =
  'flex items-center rounded-full flex-shrink-0 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const ICON_SIZES = { xs: 'h-4 w-4', s: 'h-5 w-5', m: 'h-5 w-5', l: 'h-6 w-6' };

const PADDINGS = { xs: 'p-1', s: 'p-1.5', m: 'p-1.5', l: 'p-2' };

const VARIANTS = {
  primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-2',
  secondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
};

type IconButtonBaseProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof ICON_SIZES;
  className?: string;
};

type IconButtonProps = IconButtonBaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function IconButton({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'm',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button className={c(DEFAULT_STYLE, VARIANTS[variant], PADDINGS[size])} aria-label={label} title={label} {...rest}>
      <Icon className={ICON_SIZES[size]} aria-hidden="true" />
    </button>
  );
}

type IconButtonLinkProps = IconButtonBaseProps & Omit<LinkProps, 'children'>;

export function IconButtonLink({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'm',
  className,
  ...rest
}: IconButtonLinkProps) {
  return (
    <Link className={c(DEFAULT_STYLE, VARIANTS[variant], PADDINGS[size])} aria-label={label} title={label} {...rest}>
      <Icon className={ICON_SIZES[size]} aria-hidden="true" />
    </Link>
  );
}
