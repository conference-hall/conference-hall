import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import React from 'react';

const button = cva(
  ['flex items-center rounded-full shrink-0', 'focus:outline-none focus:ring-2 focus:ring-indigo-500'],
  {
    variants: {
      variant: {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-2',
        secondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
      },
      disabled: { true: 'opacity-25 cursor-not-allowed hover:bg-transparent' },
      size: { s: 'p-1', m: 'p-1.5' },
    },
    defaultVariants: { variant: 'primary', size: 'm' },
  },
);

const icon = cva('', {
  variants: { size: { s: 'h-4 w-4', m: 'h-5 w-5' }, disabled: { true: 'opacity-50 cursor-not-allowed' } },
  defaultVariants: { size: 'm' },
});

type IconButtonBaseProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} & VariantProps<typeof button>;

type IconButtonProps = IconButtonBaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function IconButton({ icon: Icon, label, variant, size, disabled, ...rest }: IconButtonProps) {
  return (
    <button
      className={button({ variant, size, disabled })}
      aria-label={label}
      title={label}
      disabled={disabled}
      {...rest}
    >
      <Icon className={icon({ size })} aria-hidden="true" />
    </button>
  );
}

type IconLinkProps = IconButtonBaseProps & Omit<LinkProps, 'children'>;

export function IconLink({ icon: Icon, label, variant, size, disabled, ...rest }: IconLinkProps) {
  if (disabled) {
    return (
      <div className={button({ variant, size, disabled })} aria-disabled="true">
        <Icon className={icon({ size })} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Link className={button({ variant, size, disabled })} aria-label={label} title={label} {...rest}>
      <Icon className={icon({ size })} aria-hidden="true" />
    </Link>
  );
}

type IconExternalLinkProps = IconButtonBaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;

export function IconExternalLink({ icon: Icon, label, variant, size, ...rest }: IconExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={button({ variant, size })}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon className={icon({ size })} aria-hidden="true" />
    </a>
  );
}
