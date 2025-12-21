import { cx } from 'class-variance-authority';
import { useId } from 'react';
import { Label, Text } from '../typography.tsx';

type RadioProps = {
  description?: string | null;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>;

export function Radio({ name, description, className, children, ...rest }: RadioProps) {
  const id = useId();
  return (
    <div className={cx('relative flex', { 'items-start': description, 'items-center': !description }, className)}>
      <div className="mt-0.5 flex h-5 items-center">
        <input
          id={id}
          name={name}
          type="radio"
          className={cx('h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500', {
            'cursor-not-allowed opacity-50': rest?.disabled,
            'mt-1.5': description,
          })}
          aria-describedby={description ? `${id}-describe` : undefined}
          {...rest}
        />
      </div>
      {children && (
        <div>
          <Label htmlFor={id} weight="normal" className="pl-3">
            {children}
          </Label>

          {description && (
            <Text id={`${id}-desccribe`} variant="secondary" className="pl-3">
              {description}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
