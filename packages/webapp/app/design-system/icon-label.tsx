import type { TypographyProps } from './typography.tsx';
import { Text } from './typography.tsx';

type Props = {
  children: React.ReactNode;
  alt?: string;
  icon: React.ComponentType<{ className?: string }>;
} & TypographyProps;

export function IconLabel({ children, icon: Icon, size = 's', alt, ...rest }: Props) {
  return (
    <div className="flex items-center">
      <Icon className="mr-2 size-4 shrink-0 opacity-75" aria-hidden="true" />
      <Text size={size} {...rest}>
        {children}
      </Text>
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}
