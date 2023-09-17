import { cx } from 'class-variance-authority';

import type { ButtonStylesProps } from '../Buttons.tsx';
import { button } from '../Buttons.tsx';
import { Label } from '../Typography.tsx';
import type { InputProps } from './Input.tsx';
import { Input } from './Input.tsx';

type ButtonFileUploadProps = ButtonStylesProps & InputProps;

export function ButtonFileUpload({
  name,
  children,
  error,
  variant,
  size,
  block,
  disabled,
  loading,
  className,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonFileUploadProps) {
  const styles = button({ variant, size, block, disabled, loading, className });
  return (
    <>
      <Label htmlFor={name} role="button" tabIndex={0} className={cx(styles, 'cursor-pointer')}>
        <Input id={name} name={name} type="file" className="sr-only" {...rest} />
        {children}
      </Label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  );
}
