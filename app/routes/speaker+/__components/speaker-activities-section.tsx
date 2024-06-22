import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { FireIcon } from '@heroicons/react/24/outline';

import { Avatar, AvatarGroup } from '~/design-system/avatar.cap.tsx';
import { ButtonLink } from '~/design-system/buttons.cap.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.cap.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Link } from '~/design-system/links.cap.tsx';
import { Subtitle, Text } from '~/design-system/typography.cap.tsx';
import { ProposalStatusLabel } from '~/routes/__components/proposals/proposal-status-label.tsx';
import type { CfpState } from '~/types/events.types';
import type { SpeakerProposalStatus } from '~/types/speaker.types';

interface Props {
  activities: Array<{
    slug: string;
    name: string;
    logo: string | null;
    cfpState: CfpState;
    submissions: Array<{
      id: string;
      title: string;
      updatedAt: string;
      status: SpeakerProposalStatus;
      speakers: Array<{ name: string | null; picture: string | null }>;
    }>;
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
      <ul aria-label="Activities list" className="space-y-4 lg:space-y-6">
        {activities.map((event) => (
          <Card key={event.slug} as="li" className="flex flex-col">
            <div className="flex items-center justify-between border-b border-b-gray-200 p-4">
              <div className="flex items-center gap-4">
                <Avatar picture={event.logo} name={event.name} square size="l" />
                <div className="truncate">
                  <Text size="l" weight="bold" truncate>
                    {event.name}
                  </Text>
                  <Subtitle size="xs">{`${event.submissions.length} proposals`}</Subtitle>
                </div>
              </div>
              <IconLink
                label={`Open ${event.name} page`}
                to={`/${event.slug}`}
                icon={ArrowTopRightOnSquareIcon}
                variant="secondary"
                target="_blank"
              />
            </div>
            <ul aria-label={`${event.name} activities`} className="divide-y">
              {event.submissions.map((submission) => (
                <li key={submission.id} className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/${event.slug}/proposals/${submission.id}`} size="s" weight="semibold" truncate>
                      {submission.title}
                    </Link>
                    <AvatarGroup avatars={submission.speakers} />
                  </div>
                  <ProposalStatusLabel status={submission.status} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </ul>
      {hasNextPage && (
        <ButtonLink to={{ pathname: '/speaker', search: `page=${nextPage}` }} variant="secondary" preventScrollReset>
          More...
        </ButtonLink>
      )}
    </section>
  );
}
