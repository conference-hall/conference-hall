import cn from 'classnames';

type Props = {
  name: string;
  label?: string;
  description?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300';
const errorStyles =
  'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';

export function TextArea({ name, label, description, className, error, ...rest }: Props) {
  const styles = cn('shadow-sm block w-full text-gray-900 sm:text-sm rounded-md', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className={styles}
        autoComplete="off"
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={description || error ? `${name}-description` : undefined}
      />
      <div id={`${name}-description`}>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
