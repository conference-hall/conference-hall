import { intlFormatDistance } from 'date-fns';
import { ClientOnly } from 'remix-utils';
import { FireIcon } from '@heroicons/react/24/outline';
import type { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';
import { Card } from '~/design-system/Card';
import { Text } from '~/design-system/Typography';
import { AvatarGroup } from '~/design-system/Avatar';
import { ProposalStatusLabel } from '~/shared-components/proposals/ProposalStatusLabel';
import { EmptyState } from '~/design-system/EmptyState';
import { Link } from '~/design-system/Links';
import { ButtonLink } from '~/design-system/Buttons';

interface Props {
  activities: Array<{
    id: string;
    title: string;
    updatedAt: string;
    status: SpeakerProposalStatus;
    speakers: Array<{ name: string | null; photoURL: string | null }>;
    event: { slug: string; name: string };
  }>;
  nextPage: number;
  hasNextPage: boolean;
  className?: string;
}

export function SpeakerActivitiesSection({ activities, nextPage, hasNextPage, className }: Props) {
  if (activities.length === 0) {
    return <EmptyState icon={FireIcon} className={className} label="Welcome to Conference Hall!" />;
  }

  return (
    <section className={className}>
      <ul aria-label="Activities list" className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} as="li" rounded="lg">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link to={`/${activity.event.slug}/proposals/${activity.id}`}>
                  <Text size="base" strong heading truncate>
                    {activity.title}
                  </Text>
                </Link>
                <AvatarGroup avatars={activity.speakers} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ProposalStatusLabel status={activity.status} />
                  <Text size="s" variant="secondary">
                    —
                  </Text>
                  <Link to={`/${activity.event.slug}`}>
                    <Text size="s" variant="link" strong truncate>
                      {activity.event.name}
                    </Text>
                  </Link>
                </div>
                <ClientOnly>
                  {() => (
                    <Text variant="secondary" size="xs">
                      {intlFormatDistance(new Date(activity.updatedAt), new Date(), { locale: navigator.language })}
                    </Text>
                  )}
                </ClientOnly>
              </div>
            </div>
          </Card>
        ))}
      </ul>
      {hasNextPage && (
        <ButtonLink to={{ pathname: '/speaker', search: `page=${nextPage}` }} variant="secondary">
          More...
        </ButtonLink>
      )}
    </section>
  );
}
