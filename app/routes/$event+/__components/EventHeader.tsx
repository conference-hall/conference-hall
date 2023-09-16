import { cx } from 'class-variance-authority';

import { Avatar } from '~/design-system/Avatar';
import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly';
import { formatConferenceDates } from '~/utils/event';

type Props = {
  name: string;
  slug: string;
  type: 'CONFERENCE' | 'MEETUP';
  teamName: string;
  logo: string | null;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
  className?: string;
};

export function EventHeader({
  name,
  slug,
  type,
  teamName,
  logo,
  address,
  conferenceStart,
  conferenceEnd,
  className,
}: Props) {
  return (
    <header className={cx('bg-gray-800', className)}>
      <Container className="flex flex-col items-center justify-between py-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Avatar picture={logo} name={name} size="l" square />
          <div className="flex-shrink-0">
            <H1 size="2xl" variant="light">
              {name}
            </H1>
            <Text variant="secondary-light" heading>
              {`by ${teamName}`}
            </Text>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 truncate sm:items-end">
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
