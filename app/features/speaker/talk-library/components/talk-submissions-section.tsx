import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { ProposalStatusLabel } from '~/features/event-participation/speaker-proposals/components/proposal-status-label.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';

type Props = {
  submissions: Array<{
    slug: string;
    name: string;
    logoUrl: string | null;
    proposalStatus: SpeakerProposalStatus;
    createdAt: Date;
  }>;
};

export function TalkSubmissionsSection({ submissions }: Props) {
  const { t, i18n } = useTranslation();
  return (
    <Card as="section" className="divide-y divide-gray-200">
      <div className="px-4 py-4">
        <H3>{t('talk.page.submissions.heading')}</H3>
      </div>

      <ul aria-label={t('talk.page.submissions.list')} className="flex flex-col divide-y divide-gray-200">
        {submissions.map((submission) => (
          <li key={submission.slug}>
            <Link
              to={href('/:event/proposals', { event: submission.slug })}
              aria-label={t('common.go-to', { name: submission.name })}
              className="flex items-center gap-4 justify-between hover:bg-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <Avatar picture={submission.logoUrl} name={submission.name} square size="s" aria-hidden />
                <div className="overflow-hidden">
                  <Text weight="medium" truncate>
                    {submission.name}
                  </Text>
                  <Subtitle size="xs">
                    <ClientOnly>{() => formatDistance(submission.createdAt, i18n.language)}</ClientOnly>
                  </Subtitle>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProposalStatusLabel status={submission.proposalStatus} />
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
        <li className="flex justify-between items-center px-4 py-3">
          <Subtitle size="xs">{t('talk.page.submissions.count', { count: submissions.length })}</Subtitle>
        </li>
      </ul>
    </Card>
  );
}
