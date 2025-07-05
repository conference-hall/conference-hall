import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Text } from '~/shared/design-system/typography.tsx';

type Props = {
  title: string;
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

export function TrackSection({ title, tracks }: Props) {
  if (tracks.length === 0) return null;

  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{title}</H2>
      <dl className="mt-4 space-y-8">
        {tracks.map((track) => (
          <div key={track.id}>
            <Text as="dt" mb={1} weight="medium">
              {track.name}
            </Text>
            <Text as="dd" variant="secondary">
              {track.description}
            </Text>
          </div>
        ))}
      </dl>
    </Card>
  );
}
