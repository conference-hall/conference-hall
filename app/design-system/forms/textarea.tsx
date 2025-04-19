import { cx } from 'class-variance-authority';
import type { SubmissionError } from '~/types/errors.types.ts';
import { Label } from '../typography.tsx';

type Props = {
  name: string;
  label?: string;
  description?: string;
  error?: SubmissionError;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300';
const errorStyles =
  'border-red-300 text-red-900 placeholder-red-300 focus:outline-hidden focus:ring-red-500 focus:border-red-500';

export function TextArea({ name, label, description, className, error, ...rest }: Props) {
  const styles = cx('block w-full text-gray-900 text-sm rounded-md', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={name} mb={1}>
          {label}
        </Label>
      )}
      <textarea
        id={name}
        name={name}
        className={styles}
        autoComplete="off"
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={description || error ? `${name}-describe` : undefined}
      />
      <div id={`${name}-describe`}>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
