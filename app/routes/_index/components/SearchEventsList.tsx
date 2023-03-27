import type { CfpState } from '~/schemas/event';
import { CardLink } from '~/design-system/Card';
import { H3, Text } from '~/design-system/Typography';
import { CfpElapsedTime } from '~/shared-components/cfp/CfpElapsedTime';

type Props = {
  events: Array<{
    slug: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpState: CfpState;
    cfpStart?: string;
    cfpEnd?: string;
  }>;
  forTalkId: string | null;
};

export function SearchEventsList({ events, forTalkId }: Props) {
  return (
    <ul aria-label="Search results" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {events.map((event) => (
        <EventItem key={event.slug} {...event} forTalkId={forTalkId} />
      ))}
    </ul>
  );
}

type EventProps = {
  slug: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
  forTalkId: string | null;
};

function EventItem({ name, slug, type, cfpState, cfpStart, cfpEnd, forTalkId }: EventProps) {
  const path = forTalkId ? `/${slug}/submission/${forTalkId}` : `/${slug}`;
  return (
    <CardLink as="li" to={path} className="flex h-32 justify-between">
      <img src="https://placehold.co/128" className="h-32 w-32 rounded-l-md" aria-hidden alt="" />
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
