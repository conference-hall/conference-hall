import { cx } from 'class-variance-authority';

import { Avatar } from '~/design-system/Avatar.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { H1, Text } from '~/design-system/Typography.tsx';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly.tsx';
import { formatConferenceDates } from '~/utils/event.ts';

type Props = {
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  teamName: string;
  logo: string | null;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
  className?: string;
};

export function EventHeader({ name, type, teamName, logo, address, conferenceStart, conferenceEnd, className }: Props) {
  return (
    <header className={cx('bg-gray-800', className)}>
      <Container className="flex flex-col lg:items-center justify-between py-2 lg:py-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Avatar picture={logo} name={name} size="l" square />
          <div className="flex-shrink-0">
            <H1 size="2xl" variant="light">
              {name}
            </H1>
            <Text variant="secondary-light" weight="medium">{`by ${teamName}`}</Text>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col md:items-end md:gap-1 truncate">
          <Text variant="light" size="base" weight="semibold" truncate>
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
