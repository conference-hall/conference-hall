import cn from 'classnames';
import { Link, LinkProps } from 'remix';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...rest }: ButtonProps) {
  return (
    <button className={buttonStyles} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = LinkProps;

export function ButtonLink({ to, children, ...rest }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonStyles} {...rest}>
      {children}
    </Link>
  );
}

const baseStyles = cn([
  'inline-flex items-center px-4 py-2',
  'border rounded-md shadow-sm',
  'text-sm font-medium text-gray-700',
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
]);

const buttonStyles = cn(baseStyles, 'bg-white hover:bg-gray-50 border-gray-300')
