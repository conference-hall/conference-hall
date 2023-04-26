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

const BACKGROUND = {
  light: 'bg-white shadow-sm ring-1 ring-gray-900/5',
  dark: 'bg-gray-800',
};

// <Card /> component

type CardProps = {
  as?: React.ElementType;
  rounded?: keyof typeof ROUNDED;
  p?: keyof typeof PADDING;
  variant?: keyof typeof BACKGROUND;
  className?: string;
  children: React.ReactNode;
};

export function Card({ as: Tag = 'div', rounded = 'lg', p = 0, variant = 'light', className, ...rest }: CardProps) {
  return <Tag className={c(BACKGROUND[variant], ROUNDED[rounded], PADDING[p], className)} {...rest} />;
}

// <CardLink /> component

type CardLinkProps = LinkProps & CardProps;

export function CardLink({ as, rounded, p, variant, className, children, ...rest }: CardLinkProps) {
  return (
    <Card
      as={as}
      p={p}
      variant={variant}
      rounded={rounded}
      className="focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:shadow-md"
    >
      <Link {...rest} className={c('focus:outline-none', className)}>
        {children}
      </Link>
    </Card>
  );
}

// <Card.Title /> component

function Title({ children }: { children: React.ReactNode }) {
  return <div className="px-8 pt-8">{children}</div>;
}

Card.Title = Title;

// <Card.Content /> component

function Content({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 p-8">{children}</div>;
}

Card.Content = Content;

// <Card.Actions /> component

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-4 border-t border-t-gray-200 px-8 py-4">{children}</div>;
}

Card.Actions = Actions;
