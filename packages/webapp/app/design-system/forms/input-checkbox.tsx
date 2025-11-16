import { cx } from 'class-variance-authority';
import { useId } from 'react';
import { Label, Text } from '../typography.tsx';

type CheckboxProps = { description?: string | null; className?: string } & Omit<React.ComponentProps<'input'>, 'id'>;

export function Checkbox({ name, description, className, children, ref, ...rest }: CheckboxProps) {
  const id = useId();

  return (
    <div className={cx('relative flex ', { 'items-start': description, 'items-center': !description }, className)}>
      <div className="flex h-5 items-center mt-0.5">
        <input
          id={id}
          ref={ref}
          name={name}
          type="checkbox"
          className={cx('h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500', {
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
            <Text id={`${id}-describe`} variant="secondary" className="pl-3">
              {description}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
