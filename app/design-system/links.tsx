import type { LinkProps as RemixLinkProps } from '@remix-run/react';
import { Link as RemixLink } from '@remix-run/react';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type React from 'react';

import type { TypographyVariantProps } from './typography.tsx';
import { typography } from './typography.tsx';

export const link = cva('inline-flex items-center hover:underline', {
  variants: {
    variant: {
      primary: 'text-indigo-600',
      secondary: 'text-gray-900',
      'secondary-light': 'text-gray-300',
    },
  },
  defaultVariants: { variant: 'primary' },
});

type LinkVariants = VariantProps<typeof link> & Omit<TypographyVariantProps, 'variant'>;

type Icon = React.ComponentType<{ className?: string }>;

type LinkIcons = { iconLeft?: Icon; iconRight?: Icon };

type LinkProps = LinkVariants & LinkIcons & RemixLinkProps;

export function Link({
  to,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
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
      {IconLeft && <IconLeft className="mr-1.5 h-5 w-5" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="ml-1.5 h-5 w-5" aria-hidden="true" />}
    </RemixLink>
  );
}

type ExternalLinkProps = LinkVariants & LinkIcons & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink({
  href,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
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
      {IconLeft && <IconLeft className="mr-1.5 h-5 w-5" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="ml-1.5 h-5 w-5" aria-hidden="true" />}
    </a>
  );
}
