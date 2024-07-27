import { cx } from 'class-variance-authority';

import type { TypographyVariantProps } from './typography.tsx';
import { Text } from './typography.tsx';

type Props = {
  children: React.ReactNode;
  alt?: string;
  gap?: 'base' | 'm' | 'l';
  icon: React.ComponentType<{ className?: string }>;
} & TypographyVariantProps;

const GAP = {
  base: 'gap-2',
  m: 'gap-4',
  l: 'gap-4',
};

export function IconLabel({ children, icon: Icon, size = 's', gap = 'base', alt, ...rest }: Props) {
  return (
    <div className={cx('flex items-center', GAP[gap])}>
      <Icon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
      <Text size={size} {...rest}>
        {children}
      </Text>
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}
