import type { CfpState } from '~/schemas/event';
import { CardLink } from '~/design-system/Card';
import { H3, Text } from '~/design-system/Typography';
import { CfpElapsedTime } from '~/shared-components/cfp/CfpElapsedTime';
import { Avatar } from '~/design-system/Avatar';

type Event = {
  slug: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  address: string | null;
  bannerUrl: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
};

type Props = {
  events: Array<Event>;
  forTalkId: string | null;
};

export function EventsList({ events, forTalkId }: Props) {
  return (
    <ul aria-label="Search results" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {events.map((event) => (
        <EventItem key={event.slug} {...event} forTalkId={forTalkId} />
      ))}
    </ul>
  );
}

type EventProps = Event & { forTalkId: string | null };

function EventItem({ name, slug, type, bannerUrl, cfpState, cfpStart, cfpEnd, forTalkId }: EventProps) {
  const path = forTalkId ? `/${slug}/submission/${forTalkId}` : `/${slug}`;
  return (
    <CardLink as="li" to={path} className="flex h-32 justify-between">
      <Avatar photoURL={bannerUrl} name={name} size="4xl" square className="rounded-r-none" />
      <div className="flex flex-1 flex-col justify-between truncate p-4">
        <div>
          <H3 truncate>{name}</H3>
          <Text size="s" strong>
            {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
          </Text>
        </div>
        <CfpElapsedTime cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
      </div>
    </CardLink>
  );
}
