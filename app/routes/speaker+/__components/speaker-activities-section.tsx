import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { FireIcon } from '@heroicons/react/24/outline';
import { Link as RemixLink } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { Avatar } from '~/design-system/avatar.tsx';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { ProposalStatusLabel } from '~/routes/__components/proposals/proposal-status-label.tsx';
import type { CfpState } from '~/types/events.types';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

interface Props {
  activities: Array<{
    slug: string;
    name: string;
    teamName: string;
    logoUrl: string | null;
    cfpState: CfpState;
    submissions: Array<{
      id: string;
      title: string;
      status: SpeakerProposalStatus;
      speakers: Array<{ name: string | null; picture: string | null }>;
    }>;
  }>;
  nextPage: number;
  hasNextPage: boolean;
  className?: string;
}

const DISPLAYED_PROPOSAL_STATUSES = [
  SpeakerProposalStatus.Draft,
  SpeakerProposalStatus.Submitted,
  SpeakerProposalStatus.DeliberationPending,
  SpeakerProposalStatus.AcceptedByOrganizers,
  SpeakerProposalStatus.ConfirmedBySpeaker,
];

export function SpeakerActivitiesSection({ activities, nextPage, hasNextPage, className }: Props) {
  if (activities.length === 0) {
    return <EmptyState icon={FireIcon} className={className} label="Welcome to Conference Hall!" />;
  }

  return (
    <section className={cx('space-y-4', className)}>
      <ul aria-label="Activities list" className="space-y-4 lg:space-y-6">
        {activities.map((event) => (
          <Card key={event.slug} as="li" className="flex flex-col">
            <div className="flex items-center justify-between border-b border-b-gray-200 p-4">
              <div className="flex items-center gap-4">
                <Avatar picture={event.logoUrl} name={event.name} square size="l" />
                <div className="truncate">
                  <H2 truncate>{event.name}</H2>
                  <Subtitle size="xs">by {event.teamName}</Subtitle>
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
              {event.submissions
                .filter((proposal) => DISPLAYED_PROPOSAL_STATUSES.includes(proposal.status))
                .map((submission) => (
                  <li key={submission.id}>
                    <RemixLink
                      to={`/${event.slug}/proposals/${submission.id}`}
                      className="flex justify-between items-center gap-4 p-4 hover:bg-gray-50 focus-visible:-outline-offset-1"
                    >
                      <div className="overflow-hidden">
                        <H3 weight="medium" size="s" truncate>
                          {submission.title}
                        </H3>
                        <Text size="xs" variant="secondary">
                          {submission.speakers.length
                            ? `by ${submission.speakers.map((s) => s.name).join(', ')}`
                            : null}
                        </Text>
                      </div>
                      <div className="flex items-center gap-4">
                        <ProposalStatusLabel status={submission.status} />
                        <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                      </div>
                    </RemixLink>
                  </li>
                ))}
              <li className="flex gap-1 px-4 py-3">
                <Subtitle size="xs">{`${event.submissions.length} proposal(s) applied · `}</Subtitle>
                <Link to={`/${event.slug}/proposals`} variant="secondary" size="xs">
                  See all proposals
                </Link>
              </li>
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
