import type { LinkProps as RemixLinkProps } from '@remix-run/react';
import { Link as RemixLink } from '@remix-run/react';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import React from 'react';

import type { TypographyVariantProps } from './Typography.tsx';
import { typography } from './Typography.tsx';

const link = cva('inline-flex items-center hover:underline', {
  variants: {
    variant: {
      primary: 'text-indigo-600',
      secondary: 'text-gray-900',
    },
  },
  defaultVariants: { variant: 'primary' },
});

type LinkVariants = VariantProps<typeof link> & Omit<TypographyVariantProps, 'variant'>;

type Icon = React.ComponentType<{ className?: string }>;

type LinkProps = { icon?: Icon } & LinkVariants & RemixLinkProps;

export function Link({
  to,
  children,
  icon: Icon,
  variant,
  size,
  mb,
  align,
  weight,
  truncate,
  className,
  ...rest
}: LinkProps) {
  const defaultStyle = typography({ size, mb, align, weight, truncate, className });
  const linkStyle = link({ variant });

  return (
    <RemixLink to={to} className={cx(defaultStyle, linkStyle)} {...rest}>
      {Icon && <Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
    </RemixLink>
  );
}

type ExternalLinkProps = { icon?: Icon } & LinkVariants & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink({
  href,
  children,
  icon: Icon,
  variant,
  size,
  mb,
  align,
  weight,
  truncate,
  className,
  ...rest
}: ExternalLinkProps) {
  const defaultStyle = typography({ size, mb, align, weight, truncate, className });
  const linkStyle = link({ variant });

  return (
    <a href={href} target="_blank" rel="noreferrer" className={cx(defaultStyle, linkStyle)} {...rest}>
      {Icon && <Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
    </a>
  );
}
