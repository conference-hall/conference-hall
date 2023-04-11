import { Card } from '~/design-system/Card';
import { H2, H4, Subtitle, Text } from '~/design-system/Typography';

type Props = {
  title: string;
  subtitle: string;
  tracks: Array<{ name: string; description: string | null }>;
};

export function TrackSection({ title, subtitle, tracks }: Props) {
  if (tracks.length === 0) return null;

  return (
    <Card as="section" p={8}>
      <H2 size="xl" mb={0}>
        {title}
      </H2>
      <Subtitle mb={6}>{subtitle}</Subtitle>
      <dl role="list" className="mt-4 space-y-8">
        {tracks.map((track) => (
          <div key={track.name}>
            <H4 as="dt" mb={1} strong>
              {track.name}
            </H4>
            <Text as="dd" size="s">
              {track.description}
            </Text>
          </div>
        ))}
      </dl>
    </Card>
  );
}
