import { Avatar } from '~/design-system/Avatar.tsx';
import { CardLink } from '~/design-system/layouts/Card.tsx';
import { Subtitle, Text } from '~/design-system/Typography.tsx';
import type { CfpState } from '~/routes/__types/event.ts';

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
    <CardLink as="li" to={to} className="flex h-32 justify-between">
      <Avatar picture={logo} name={name} size="4xl" square className="rounded-r-none" />
      <div className="flex flex-1 flex-col justify-between truncate p-4">
        <div>
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
