import { ClientOnly } from 'remix-utils';
import { Container } from '~/design-system/Container';
import { H1, Text } from '~/design-system/Typography';
import { formatConferenceDates } from '../../../utils/event';
import { Avatar } from '~/design-system/Avatar';

type Props = {
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  bannerUrl: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export function EventHeader({ name, type, bannerUrl, address, conferenceStart, conferenceEnd }: Props) {
  return (
    <header className="bg-gray-800">
      <Container className="flex flex-col items-center justify-between py-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Avatar photoURL={bannerUrl} name={name} size="l" square />
          <div className="flex-shrink-0">
            <H1 variant="light" mb={0}>
              {name}
            </H1>
            <Text variant="secondary-light" size="s" heading>
              by GDG Nantes
            </Text>
          </div>
        </div>

        <div className="mb-4 mt-6 flex flex-col items-center gap-1 truncate sm:items-end">
          <Text variant="light" size="base" heading strong truncate>
            <ClientOnly>{() => formatConferenceDates(type, conferenceStart, conferenceEnd)}</ClientOnly>
          </Text>
          {address && (
            <Text variant="secondary-light" size="xs" truncate>
              {address}
            </Text>
          )}
        </div>
      </Container>
    </header>
  );
}
