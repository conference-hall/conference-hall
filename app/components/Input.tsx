import cn from 'classnames';

type InputProps = { error?: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ id, className, error, ...rest }: InputProps) {
  const styles = cn(baseStyles, {
    [defaultStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <input id={id} className={styles} {...rest} />
  );
}

const baseStyles = cn(['block w-full', 'sm:text-sm', 'shadow-sm rounded-md']);

const defaultStyles = cn(['border-gray-300', 'focus:ring-indigo-500 focus:border-indigo-500']);

const errorStyles = cn([
  'border-red-300 text-red-900 placeholder-red-300',
  'focus:outline-none focus:ring-red-500 focus:border-red-500',
]);
