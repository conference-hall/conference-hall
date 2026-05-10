import { cx } from 'class-variance-authority';

type KbdProps = {
  children: string;
  className?: string;
};

const SMALL_KBD = ['⌘', '↵', '↑↓'];

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cx(
        'inline-flex min-w-2.5 rounded border border-gray-300 bg-white px-1 py-1.5 text-center font-mono leading-1 text-gray-500',
        { 'text-s': SMALL_KBD.includes(children) },
        { 'text-xs': !SMALL_KBD.includes(children) },
        className,
      )}
    >
      {children}
    </kbd>
  );
}
