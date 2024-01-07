import { Avatar } from '~/design-system/Avatar.tsx';
import { CardLink } from '~/design-system/layouts/Card.tsx';
import { Subtitle, Text } from '~/design-system/Typography.tsx';
import type { CfpState } from '~/types/events.types.ts';

import { CfpElapsedTime } from './cfp/CfpElapsedTime.tsx';

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

      <div className="flex flex-1 flex-col justify-between truncate py-2 px-4 lg:p-4">
        <div className="flex justify-between items-center gap-2 lg:flex-col lg:items-start lg:gap-0">
          <Text size="l" weight="semibold" mb={1} truncate>
            {name}
          </Text>
          <Subtitle weight="medium">{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</Subtitle>
        </div>
        <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
      </div>
    </CardLink>
  );
}
