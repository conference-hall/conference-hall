import { Avatar } from '~/design-system/avatar.tsx';
import { Card, CardLink } from '~/design-system/layouts/card.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { CfpState } from '~/types/events.types.ts';

import { CfpElapsedTime } from '../cfp/cfp-elapsed-time.tsx';

type CardContentProps = {
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  logo: string | null;
  cfpState: CfpState;
  cfpStart?: string | null;
  cfpEnd?: string | null;
};

type EventCardLinkProps = { to: string } & CardContentProps;

export function EventCardLink({ to, ...rest }: EventCardLinkProps) {
  return (
    <CardLink as="li" to={to}>
      <CardContent {...rest} />
    </CardLink>
  );
}

export function EventCard(props: CardContentProps) {
  return (
    <Card>
      <CardContent {...props} />
    </Card>
  );
}

function CardContent({ name, type, logo, cfpState, cfpStart, cfpEnd }: CardContentProps) {
  return (
    <span className="flex h-20 lg:h-32 justify-between">
      {/* Desktop */}
      <Avatar picture={logo} name={name} size="4xl" square className="hidden lg:flex rounded-r-none" />
      {/* Mobile */}
      <Avatar picture={logo} name={name} size="2xl" square className="lg:hidden rounded-r-none" />

      <div className="flex flex-1 flex-col justify-between overflow-hidden py-2 px-4 lg:p-4">
        <Text size="l" weight="semibold" truncate>
          {name}
        </Text>
        <div className="flex flex-row-reverse items-center lg:flex-col lg:items-start flex-1 justify-between">
          <Subtitle weight="medium">{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</Subtitle>
          <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
        </div>
      </div>
    </span>
  );
}
