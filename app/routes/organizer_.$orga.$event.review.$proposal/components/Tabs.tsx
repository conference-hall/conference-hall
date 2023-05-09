import { useParams } from '@remix-run/react';
import { useMemo } from 'react';
import { Card } from '~/design-system/layouts/Card';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = { speakersCount: number; reviewsCount: number; messagesCount: number; displayReviews: boolean };

export function ReviewTabs({ speakersCount, reviewsCount, messagesCount, displayReviews }: Props) {
  const { orga, event, proposal } = useParams();

  const tabs = useMemo(
    () => [
      { to: `/organizer/${orga}/${event}/review/${proposal}`, label: 'Proposal', enabled: true, end: true },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/speakers`,
        label: 'Speakers',
        count: speakersCount,
        enabled: speakersCount !== 0,
      },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/reviews`,
        label: 'Reviews',
        count: reviewsCount,
        enabled: displayReviews,
      },
      {
        to: `/organizer/${orga}/${event}/review/${proposal}/messages`,
        label: 'Messages',
        count: messagesCount,
        enabled: true,
      },
    ],
    [orga, event, proposal, speakersCount, reviewsCount, messagesCount, displayReviews]
  );

  return (
    <Card className="p-2">
      <NavTabs tabs={tabs} />
    </Card>
  );
}
