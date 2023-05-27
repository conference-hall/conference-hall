import type { TypographyVariantProps } from './Typography';
import { Text } from './Typography';

type Props = {
  children: React.ReactNode;
  alt?: string;
  icon: React.ComponentType<{ className?: string }>;
} & TypographyVariantProps;

export function IconLabel({ children, icon: Icon, size = 's', alt, ...rest }: Props) {
  return (
    <div className="flex items-center truncate">
      <Icon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
      <Text size={size} truncate {...rest}>
        {children}
      </Text>
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}
