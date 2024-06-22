import { Card } from '~/design-system/layouts/card.cap.tsx';
import { H2, Text } from '~/design-system/typography.cap.tsx';

type Props = {
  title: string;
  tracks: Array<{ name: string; description: string | null }>;
};

export function TrackSection({ title, tracks }: Props) {
  if (tracks.length === 0) return null;

  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{title}</H2>
      <dl role="list" className="mt-4 space-y-8">
        {tracks.map((track) => (
          <div key={track.name}>
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
