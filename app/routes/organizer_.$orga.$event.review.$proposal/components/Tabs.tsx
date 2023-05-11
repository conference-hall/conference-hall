import { useParams, useSearchParams } from '@remix-run/react';
import { useMemo } from 'react';
import { Card } from '~/design-system/layouts/Card';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = { speakersCount: number; reviewsCount: number; messagesCount: number; displayReviews: boolean };

export function ReviewTabs({ speakersCount, reviewsCount, messagesCount, displayReviews }: Props) {
  const { orga, event, proposal } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  const tabs = useMemo(
    () => [
      { to: `/organizer/${orga}/${event}/review/${proposal}?${search}`, label: 'Proposal', enabled: true, end: true },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/speakers?${search}`,
        label: 'Speakers',
        count: speakersCount,
        enabled: speakersCount !== 0,
      },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/reviews?${search}`,
        label: 'Reviews',
        count: reviewsCount,
        enabled: displayReviews,
      },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/messages?${search}`,
        label: 'Discussions',
        count: messagesCount,
        enabled: true,
      },
    ],
    [orga, event, proposal, search, speakersCount, reviewsCount, messagesCount, displayReviews]
  );

  return (
    <Card className="p-2">
      <NavTabs tabs={tabs} />
    </Card>
  );
}
