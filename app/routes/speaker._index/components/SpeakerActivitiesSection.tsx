import { FireIcon } from '@heroicons/react/24/outline';
import type { CfpState } from '~/schemas/event';
import type { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';
import { Card } from '~/design-system/Card';
import { Text } from '~/design-system/Typography';
import { Avatar, AvatarGroup } from '~/design-system/Avatar';
import { ProposalStatusLabel } from '~/shared-components/proposals/ProposalStatusLabel';
import { EmptyState } from '~/design-system/EmptyState';
import { Link } from '~/design-system/Links';
import { ButtonLink } from '~/design-system/Buttons';
import { IconButtonLink } from '~/design-system/IconButtons';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { CfpIcon } from '~/shared-components/cfp/CfpIcon';

interface Props {
  activities: Array<{
    slug: string;
    name: string;
    bannerUrl: string | null;
    cfpState: CfpState;
    submissions: Array<{
      id: string;
      title: string;
      updatedAt: string;
      status: SpeakerProposalStatus;
      speakers: Array<{ name: string | null; photoURL: string | null }>;
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
      <ul aria-label="Activities list" className="space-y-8">
        {activities.map((event) => (
          <Card key={event.slug} as="li" rounded="lg" className="flex flex-col">
            <div className="flex items-center justify-between border-b border-b-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar photoURL={event.bannerUrl} name={event.name} square />
                <Text size="l" strong heading truncate>
                  {event.name}
                </Text>
                <CfpIcon cfpState={event.cfpState} />
              </div>
              <IconButtonLink
                to={`/${event.slug}`}
                icon={ArrowTopRightOnSquareIcon}
                variant="secondary"
                target="_blank"
              />
            </div>
            <div className="divide-y">
              {event.submissions.map((submission) => (
                <div key={submission.id} className="flex flex-col gap-1 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/${event.slug}/proposals/${submission.id}`}>
                      <Text variant="link" strong heading truncate>
                        {submission.title}
                      </Text>
                    </Link>
                    <AvatarGroup avatars={submission.speakers} />
                  </div>
                  <ProposalStatusLabel status={submission.status} />
                </div>
              ))}
            </div>
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
