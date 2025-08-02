import { Text } from '~/design-system/typography.tsx';

type Props = { title: string; count: number; children: React.ReactNode };

export function CommandPaletteSection({ title, count, children }: Props) {
  if (count === 0) return null;

  return (
    <div className="p-3 space-y-3">
      <Text size="xs" variant="secondary" weight="semibold" className="px-3 uppercase tracking-wide">
        {title}
      </Text>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
