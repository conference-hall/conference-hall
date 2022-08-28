import c from 'classnames';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

type CardProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function Card({ as: Tag = 'div', className, ...rest }: CardProps) {
  return <Tag className={c('rounded-lg border border-gray-300 bg-white shadow-sm', className)} {...rest} />;
}

type CardLinkProps = LinkProps & CardProps;

export function CardLink({ as, className, children, ...rest }: CardLinkProps) {
  return (
    <Card
      as={as}
      className={c(
        'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400',
        className
      )}
    >
      <Link {...rest} className="focus:outline-none">
        {children}
      </Link>
    </Card>
  );
}
