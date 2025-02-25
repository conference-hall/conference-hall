import { cva } from 'class-variance-authority';

export const menuItems = () => 'z-30 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden';

export const menuItem = cva(['flex items-center w-full gap-3 px-4 py-2 text-sm cursor-pointer'], {
  variants: {
    variant: {
      primary:
        'text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed',
      important: 'font-semibold text-red-700 data-[focus]:bg-red-100 data-[disabled]:text-red-400',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export const menuItemIcon = cva(['size-4'], {
  variants: { variant: { primary: 'text-gray-500', important: 'text-red-700' } },
  defaultVariants: { variant: 'primary' },
});
