import React from 'react';
import cn from 'classnames';
import { Link as RemixLink, LinkProps as RemixLinkProps } from '@remix-run/react';

const linkStyle = 'flex text-sm text-indigo-600 hover:text-indigo-500';

type Icon = React.ComponentType<{ className?: string }>;
type LinkProps = { icon?: Icon } & RemixLinkProps;

export function Link({ to, children, icon: Icon, className, ...rest }: LinkProps) {
  return (
    <RemixLink to={to} className={cn(linkStyle, className)} {...rest}>
      {Icon && <Icon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
    </RemixLink>
  );
}

type ExternalLinkProps = { icon?: Icon } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink({ href, children, icon: Icon, className, ...rest }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" className={cn(linkStyle, className)} {...rest}>
      {Icon && <Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
    </a>
  );
}
