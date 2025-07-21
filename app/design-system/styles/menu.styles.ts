import { cva } from 'class-variance-authority';

export const menuSection = () => 'flex flex-col';

export const menuItems = (width = 'w-56') =>
  `flex flex-col z-30 ${width} rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden py-2`;

export const menuItem = cva(
  ['flex items-center rounded-lg gap-2 mx-2 px-2 py-1.5 text-sm font-medium grow cursor-pointer'],
  {
    variants: {
      variant: {
        primary:
          'text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed',
        important: 'font-semibold text-red-700 data-[focus]:bg-red-100 data-[disabled]:text-red-400',
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
