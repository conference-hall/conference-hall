import { cva, cx } from 'class-variance-authority';

export const menuSection = () => 'flex flex-col';

export const menuItems = (width?: string) =>
  cx('z-40 flex min-w-56 flex-col rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-hidden', width);

export const menuItem = cva(
  ['mx-2 flex grow cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-sm'],
  {
    variants: {
      variant: {
        primary:
          'text-gray-700 data-disabled:cursor-not-allowed data-focus:bg-gray-100 data-disabled:text-gray-400 data-focus:text-gray-900',
        important: 'font-semibold text-red-700 data-focus:bg-red-100 data-disabled:text-red-400',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export const menuItemIcon = cva(['size-4 shrink-0'], {
  variants: { variant: { primary: 'text-gray-600', important: 'text-red-700' } },
  defaultVariants: { variant: 'primary' },
});

export const menuSeparator = () => 'h-px bg-gray-200 my-2';
