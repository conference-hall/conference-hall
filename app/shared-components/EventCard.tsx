import { Avatar } from '~/design-system/Avatar';
import { CardLink } from '~/design-system/layouts/Card';
import { H3, Text } from '~/design-system/Typography';
import type { CfpState } from '~/schemas/event';
import { CfpElapsedTime } from './cfp/CfpElapsedTime';

type Props = {
  slug: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  address: string | null;
  bannerUrl: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
  forTalkId: string | null;
};

export function EventCard({ name, slug, type, bannerUrl, cfpState, cfpStart, cfpEnd, forTalkId }: Props) {
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
