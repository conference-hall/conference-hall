import { cx } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

const ROUNDED = {
  sm: 'rounded-xs',
  base: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const PADDING = {
  0: 'p-0',
  4: 'p-2 lg:p-4',
  8: 'p-4 lg:p-8',
  16: 'p-8 lg:p-16',
};

// <Card /> component

type CardProps = {
  as?: React.ElementType;
  rounded?: keyof typeof ROUNDED;
  p?: keyof typeof PADDING;
  className?: string;
  children: React.ReactNode;
  noBorder?: boolean;
} & HTMLAttributes<HTMLElement>;

export function Card({ as: Tag = 'div', rounded = 'lg', p = 0, noBorder = false, className, ...rest }: CardProps) {
  return (
    <Tag
      className={cx(
        'flex flex-col bg-white',
        { 'shadow-xs border border-gray-200': !noBorder },
        ROUNDED[rounded],
        PADDING[p],
        className,
      )}
      {...rest}
    />
  );
}

// <CardLink /> component

type CardLinkProps = LinkProps & CardProps;

export function CardLink({ as, rounded, p, className, children, ...rest }: CardLinkProps) {
  return (
    <Card
      as={as}
      p={p}
      rounded={rounded}
      className="focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:shadow-md"
    >
      <Link {...rest} className={cx('focus:outline-hidden', className)}>
        {children}
      </Link>
    </Card>
  );
}

// <Card.Title /> component

function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx('px-4 pt-4 lg:px-8 lg:pt-8', className)}>{children}</div>;
}

Card.Title = Title;

// <Card.Content /> component

function Content({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('p-4 lg:p-8', { 'flex grow flex-col gap-4 lg:gap-6': !className }, className)}>{children}</div>
  );
}

Card.Content = Content;

// <Card.Actions /> component

function Actions({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return (
    <div
      className={cx('flex items-center gap-4 border-t border-t-gray-200 p-4 lg:px-8', {
        'justify-end': align === 'right',
        'justify-start': align === 'left',
        'justify-center': align === 'center',
      })}
    >
      {children}
    </div>
  );
}

Card.Actions = Actions;
