import c from 'classnames';

import type { ButtonStylesProps } from '../Buttons';
import { getStyles } from '../Buttons';
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
  iconClassName,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}: ButtonFileUploadProps) {
  const styles = getStyles({ variant, size, block, disabled, loading, className });
  return (
    <>
      <label htmlFor={name} role="button" tabIndex={0} className={c(styles, 'cursor-pointer')}>
        <Input id={name} name={name} type="file" className="sr-only" {...rest} />
        {children}
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  );
}
