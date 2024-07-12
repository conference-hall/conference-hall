import { Avatar } from '~/design-system/avatar.tsx';
import { CardLink } from '~/design-system/layouts/card.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { CfpState } from '~/types/events.types.ts';

import { CfpElapsedTime } from '../cfp/cfp-elapsed-time.tsx';

type Props = {
  to: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  logo: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
};

export function EventCard({ to, name, type, logo, cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <CardLink as="li" to={to} className="flex h-20 lg:h-32 justify-between">
      {/* Desktop */}
      <Avatar picture={logo} name={name} size="4xl" square className="hidden lg:flex rounded-r-none" />
      {/* Mobile */}
      <Avatar picture={logo} name={name} size="2xl" square className="lg:hidden rounded-r-none" />

      <div className="flex flex-1 flex-col justify-between overflow-hidden py-2 px-4 lg:p-4">
        <Text size="l" weight="semibold" truncate>
          {name}
        </Text>
        <div className="flex flex-row-reverse items-center sm:flex-col sm:items-start flex-1 justify-between">
          <Subtitle weight="medium">{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</Subtitle>
          <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
        </div>
      </div>
    </CardLink>
  );
}
