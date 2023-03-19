import { ClientOnly } from 'remix-utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { Container } from '~/design-system/Container';
import { H1 } from '~/design-system/Typography';
import { IconLabel } from '../../../design-system/IconLabel';
import { formatConferenceDates } from '../../../utils/event';

type Props = {
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export function EventHeader({ name, type, address, conferenceStart, conferenceEnd }: Props) {
  return (
    <Container as="header" className="bg-white py-4 sm:pt-8 sm:pb-4">
      <H1>{name}</H1>
      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
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
  );
}
