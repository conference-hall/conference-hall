import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';

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
  12: 'p-12',
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
  return <Tag className={cx(BACKGROUND[variant], ROUNDED[rounded], PADDING[p], className)} {...rest} />;
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
      <Link {...rest} className={cx('focus:outline-none', className)}>
        {children}
      </Link>
    </Card>
  );
}

// <Card.Title /> component

function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx('px-4 pt-4 md:px-8 md:pt-8', className)}>{children}</div>;
}

Card.Title = Title;

// <Card.Content /> component

function Content({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 p-4 md:p-8">{children}</div>;
}

Card.Content = Content;

// <Card.Actions /> component

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-4 border-t border-t-gray-200 px-4 md:px-8 py-4">{children}</div>;
}

Card.Actions = Actions;
