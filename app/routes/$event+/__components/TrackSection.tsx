import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle, Text } from '~/design-system/Typography.tsx';

type Props = {
  title: string;
  subtitle: string;
  tracks: Array<{ name: string; description: string | null }>;
};

export function TrackSection({ title, subtitle, tracks }: Props) {
  if (tracks.length === 0) return null;

  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{title}</H2>
      <Subtitle mb={6}>{subtitle}</Subtitle>
      <dl role="list" className="mt-4 space-y-8">
        {tracks.map((track) => (
          <div key={track.name}>
            <Text as="dt" mb={1} strong>
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
