import { ClientOnly } from 'remix-utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { Container } from '~/design-system/Container';
import { H2 } from '~/design-system/Typography';
import { IconLabel } from '../../../design-system/IconLabel';
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
    <header className="bg-gray-800 sm:pb-4">
      <Container className="flex justify-between py-4">
        <div className="flex flex-1 flex-shrink-0 items-center gap-4">
          <Avatar photoURL={bannerUrl} name={name} size="l" square />
          <div>
            <H2 type="light" as="h1" mb={0}>
              {name}
            </H2>
            <p className="font-heading text-sm text-white">by GDG Nantes</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <IconLabel icon={CalendarIcon} className="mt-2 text-gray-500" truncate>
            <ClientOnly>{() => formatConferenceDates(type, conferenceStart, conferenceEnd)}</ClientOnly>
          </IconLabel>
          {address && (
            <IconLabel icon={MapPinIcon} className="mt-2 text-gray-500" truncate>
              {address}
            </IconLabel>
          )}
        </div>
      </Container>
    </header>
  );
}
