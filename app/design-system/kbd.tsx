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
        'px-1 py-1.5 text-center min-w-2.5 text-gray-500 bg-white rounded border border-gray-300 leading-1 font-mono',
        { 'text-s': SMALL_KBD.includes(children) },
        { 'text-xs': !SMALL_KBD.includes(children) },
        className,
      )}
    >
      {children}
    </kbd>
  );
}
