import { cx } from 'class-variance-authority';
import { useHydrated } from './utils/use-hydrated.ts';

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

const PLATFORMS_KBD = {
  MAC: { meta: '⌘', alt: '⌥' },
  OTHERS: { meta: 'Ctrl', alt: 'Alt' },
};

export function usePlatformKbd() {
  const hydrated = useHydrated();
  if (!hydrated) return PLATFORMS_KBD.OTHERS;

  // @ts-expect-error userAgentData is experimental API not in types
  const useAgentData = navigator.userAgentData;

  const isMac = useAgentData
    ? useAgentData.platform.toUpperCase().includes('MAC')
    : navigator.platform.toUpperCase().includes('MAC');

  return isMac ? PLATFORMS_KBD.MAC : PLATFORMS_KBD.OTHERS;
}
