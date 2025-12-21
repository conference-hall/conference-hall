import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { FireIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Link as RouterLink } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { ProposalStatusLabel } from '~/features/event-participation/speaker-proposals/components/proposal-status-label.tsx';
import type { CfpState } from '~/shared/types/events.types.ts';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';

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
  const { t } = useTranslation();

  if (activities.length === 0) {
    return <EmptyState icon={FireIcon} className={className} label={t('speaker.activity.empty')} />;
  }

  return (
    <section className={cx('space-y-4', className)}>
      <ul aria-label={t('speaker.activity.list')} className="space-y-4 lg:space-y-6">
        {activities.map((event) => (
          <Card key={event.slug} as="li" className="flex flex-col">
            <div className="flex items-center justify-between border-b border-b-gray-200 p-4">
              <div className="flex items-center gap-4">
                <Avatar picture={event.logoUrl} name={event.name} square size="l" />
                <div className="truncate">
                  <H2 truncate>{event.name}</H2>
                  <Subtitle size="xs">{t('common.by', { names: [event.teamName] })}</Subtitle>
                </div>
              </div>
              <Button
                to={href('/:event', { event: event.slug })}
                label={t('speaker.activity.open-event', { eventName: event.name })}
                icon={ArrowTopRightOnSquareIcon}
                variant="secondary"
                target="_blank"
              />
            </div>

            <ul
              aria-label={t('speaker.activity.event-activities-list', { eventName: event.name })}
              className="divide-y"
            >
              {event.submissions
                .filter((proposal) => DISPLAYED_PROPOSAL_STATUSES.includes(proposal.status))
                .map((submission) => (
                  <li key={submission.id}>
                    <RouterLink
                      to={href('/:event/proposals/:proposal', { event: event.slug, proposal: submission.id })}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50 focus-visible:-outline-offset-1"
                    >
                      <div className="overflow-hidden">
                        <H3 weight="medium" size="s" truncate>
                          {submission.title}
                        </H3>
                        <Text size="xs" variant="secondary">
                          {t('common.by', { names: submission.speakers.map((s) => s.name) })}
                        </Text>
                      </div>
                      <div className="flex items-center gap-4">
                        <ProposalStatusLabel status={submission.status} />
                        <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                      </div>
                    </RouterLink>
                  </li>
                ))}
              <li className="flex gap-1 px-4 py-3">
                <Subtitle size="xs">
                  {t('speaker.activity.proposals-applied', { count: event.submissions.length })} ·{' '}
                </Subtitle>
                <Link to={href('/:event/proposals', { event: event.slug })} variant="secondary" size="xs">
                  {t('speaker.activity.see-all-proposals')}
                </Link>
              </li>
            </ul>
          </Card>
        ))}
      </ul>

      {hasNextPage && (
        <Button to={{ pathname: '/speaker', search: `page=${nextPage}` }} variant="secondary" preventScrollReset>
          {t('common.more')}
        </Button>
      )}
    </section>
  );
}
