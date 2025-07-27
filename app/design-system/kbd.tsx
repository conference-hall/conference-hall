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
        'px-1 py-1.5 inline-flex text-center min-w-2.5 text-gray-500 bg-white rounded border border-gray-300 leading-1 font-mono',
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

  // @ts-expect-error
  const useAgentData = navigator.userAgentData;

  const isMac = useAgentData
    ? useAgentData.platform.toUpperCase().includes('MAC')
    : navigator.platform.toUpperCase().includes('MAC');

  return isMac ? PLATFORMS_KBD.MAC : PLATFORMS_KBD.OTHERS;
}
