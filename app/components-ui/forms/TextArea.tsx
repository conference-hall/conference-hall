import cn from 'classnames';

type Props = {
  id: string;
  label: string;
  description?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300';
const errorStyles =
  'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';

export function TextArea({ id, label, description, className, error, ...rest }: Props) {
  const styles = cn('shadow-sm block w-full sm:text-sm rounded-md', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <textarea id={id} className={styles} {...rest} aria-describedby={`${id}-description`} />
      </div>
      {description && (
        <p id={`${id}-description`} className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}
