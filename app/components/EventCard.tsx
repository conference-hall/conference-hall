import { Avatar } from '~/design-system/Avatar';
import { CardLink } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import type { CfpState } from '~/schemas/event';

import { CfpElapsedTime } from './cfp/CfpElapsedTime';

type Props = {
  to: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  logo: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
};

function EventCardDesktop({ to, name, type, logo, cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <CardLink to={to} className="hidden h-32 lg:flex lg:justify-between">
      <Avatar picture={logo} name={name} size="4xl" square className="rounded-r-none" />

      <div className="flex flex-1 flex-col justify-between truncate p-4">
        <div>
          <Text size="l" heading strong mb={1} truncate>
            {name}
          </Text>
          <Text strong>{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</Text>
        </div>
        <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
      </div>
    </CardLink>
  );
}

function EventCardMobile({ to, name, type, logo, cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <CardLink to={to} className="flex h-20 justify-between lg:hidden">
      <Avatar picture={logo} name={name} size="2xl" square className="rounded-r-none" />

      <div className="flex flex-1 flex-col justify-between truncate p-2">
        <div>
          <Text size="base" heading strong mb={1} truncate>
            {name}
          </Text>
          <Text size="xs">{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</Text>
        </div>
        <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
      </div>
    </CardLink>
  );
}

export function EventCard(props: Props) {
  return (
    <li>
      <EventCardDesktop {...props} />
      <EventCardMobile {...props} />
    </li>
  );
}
