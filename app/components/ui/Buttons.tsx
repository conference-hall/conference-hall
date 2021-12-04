import cn from 'classnames';
import { Link, LinkProps } from 'remix';

type ButtonProps = ButtonStylesProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant, block, className, ...rest }: ButtonProps) {
  const styles = getStyles({ variant, block, className });
  return (
    <button className={styles} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ButtonStylesProps & LinkProps;

export function ButtonLink({ to, children, variant, block, className, ...rest }: ButtonLinkProps) {
  const styles = getStyles({ variant, block, className });
  return (
    <Link to={to} className={styles} {...rest}>
      {children}
    </Link>
  );
}

type ButtonStylesProps = { variant?: 'primary' | 'secondary' | 'text'; block?: boolean; className?: string };

const getStyles = ({ variant = 'primary', block, className }: ButtonStylesProps) =>
  cn(
    [
      'relative inline-flex items-center px-4 py-2',
      'border rounded-md shadow-sm',
      'text-sm font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    ],
    {
      ['text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent']: variant === 'primary',
      ['text-gray-700 bg-white hover:bg-gray-50 border-gray-300']: variant === 'secondary',
      ['w-full justify-center']: block,
    },
    className
  );
