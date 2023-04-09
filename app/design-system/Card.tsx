import c from 'classnames';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

const ROUNDED = {
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const PADDING = {
  0: 'p-0',
  4: 'p-4',
  8: 'p-8',
  10: 'p-10',
  16: 'p-16',
  24: 'p-24',
};

type CardProps = {
  as?: React.ElementType;
  rounded?: keyof typeof ROUNDED;
  p?: keyof typeof PADDING;
  className?: string;
  children: React.ReactNode;
};

export function Card({ as: Tag = 'div', rounded = 'base', p = 0, className, ...rest }: CardProps) {
  return <Tag className={c('bg-white shadow', ROUNDED[rounded], PADDING[p], className)} {...rest} />;
}

type CardLinkProps = LinkProps & CardProps;

export function CardLink({ as, rounded, p, className, children, ...rest }: CardLinkProps) {
  return (
    <Card
      as={as}
      p={p}
      rounded={rounded}
      className="focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:shadow-md"
    >
      <Link {...rest} className={c('focus:outline-none', className)}>
        {children}
      </Link>
    </Card>
  );
}
