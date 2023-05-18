import c from 'classnames';

import type { ButtonStylesProps } from '../Buttons';
import { button } from '../Buttons';
import { Label } from '../Typography';
import type { InputProps } from './Input';
import { Input } from './Input';

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
      <Label htmlFor={name} role="button" tabIndex={0} className={c(styles, 'cursor-pointer')}>
        <Input id={name} name={name} type="file" className="sr-only" {...rest} />
        {children}
      </Label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  );
}
