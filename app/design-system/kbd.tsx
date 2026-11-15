import { cva, cx } from 'class-variance-authority';

const kbdStyles = cva('inline-flex min-w-2.5 rounded border px-1 text-center font-mono leading-1', {
  variants: {
    variant: {
      light: 'border-gray-300 bg-white py-1.5 text-gray-500',
      dark: 'border-gray-600 bg-gray-700 py-1 text-[10px] text-gray-200',
    },
  },
  defaultVariants: { variant: 'light' },
});

type KbdProps = {
  children: string;
  variant?: 'light' | 'dark';
  className?: string;
};

const SMALL_KBD = ['⌘', '↵', '↑↓'];

export function Kbd({ children, variant = 'light', className }: KbdProps) {
  return (
    <kbd
      className={cx(
        kbdStyles({ variant }),
        { 'text-s': variant === 'light' && SMALL_KBD.includes(children) },
        { 'text-xs': variant === 'light' && !SMALL_KBD.includes(children) },
        className,
      )}
    >
      {children}
    </kbd>
  );
}
