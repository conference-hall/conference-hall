import c from 'classnames';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const SIZES = {
  m: { container: 'max-w-lg lg:max-w-xs', icon: 'h-5 w-5', input: 'py-1.5 pl-10 text-sm' },
  l: { container: 'max-w-lg lg:max-w-2xl', icon: 'h-5 w-5', input: 'py-3 pl-10' },
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
    <div className={c('w-full', sizeStyles.container)}>
      <label htmlFor="search" className="sr-only">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className={c('text-gray-400', sizeStyles.icon)} aria-hidden="true" />
        </div>
        <input
          id="search"
          type="search"
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete="off"
          className={c('block w-full rounded-md', sizeStyles.input, variantStyles)}
        />
      </div>
    </div>
  );
}
