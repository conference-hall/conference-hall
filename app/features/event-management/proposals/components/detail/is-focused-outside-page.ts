import type React from 'react';

export function isFocusedOutsidePage(pageRef: React.RefObject<HTMLElement | null>): boolean {
  const active = document.activeElement;
  return !!active && active !== document.body && !pageRef.current?.contains(active);
}
