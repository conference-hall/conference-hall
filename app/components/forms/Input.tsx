import cn from 'classnames';

type InputProps = { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ id, label, className, error, ...rest }: InputProps) {
  const styles = cn(baseStyles, {
    [defaultStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input id={id} className={styles} {...rest} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}

const baseStyles = cn(['block w-full', 'sm:text-sm', 'shadow-sm rounded-md']);

const defaultStyles = cn(['border-gray-300', 'focus:ring-indigo-500 focus:border-indigo-500']);

const errorStyles = cn([
  'border-red-300 text-red-900 placeholder-red-300',
  'focus:outline-none focus:ring-red-500 focus:border-red-500',
]);
