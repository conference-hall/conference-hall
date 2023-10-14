import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { Label } from '../Typography.tsx';

const SIZES = {
  m: { container: 'max-w-lg lg:max-w-xs', icon: 'h-5 w-5', input: 'py-1.5 pl-10 text-sm' },
  l: { container: 'max-w-lg lg:max-w-2xl', icon: 'h-5 w-5', input: 'py-3 pl-10 text-sm' },
};

const VARIANTS = {
  primary:
    'border-0 bg-gray-700 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0',
  secondary:
    'border-0 bg-gray-700 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0',
};

type InputSearchProps = {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export function InputSearch({ name, label = 'Search', placeholder, defaultValue, variant, size }: InputSearchProps) {
  const variantStyles = VARIANTS[variant || 'primary'];
  const sizeStyles = SIZES[size || 'm'];

  return (
    <div className={cx('w-full', sizeStyles.container)}>
      <Label htmlFor="search" srOnly>
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className={cx('text-gray-400', sizeStyles.icon)} aria-hidden="true" />
        </div>
        <input
          id="search"
          type="search"
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete="off"
          className={cx('block w-full rounded-md', sizeStyles.input, variantStyles)}
        />
      </div>
    </div>
  );
}
