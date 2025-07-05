import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Submissions } from '~/.server/cfp-submissions/submissions.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { Text } from '~/shared/design-system/typography.tsx';
import { ProposalStatusLabel } from '../components/proposals/proposal-status-label.tsx';
import type { Route } from './+types/proposals.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return Submissions.for(userId, params.event).list();
};

export default function EventSpeakerProposalsRoute({ loaderData: proposals }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <Page>
      <h1 className="sr-only">{t('event.proposals.heading')}</h1>

      <List>
        <List.Header>
          <Text weight="semibold">{t('event.proposals.list.header', { count: proposals.length })}</Text>
        </List.Header>

        <List.Content aria-label={t('event.proposals.list')}>
          {proposals.length === 0 ? (
            <EmptyState icon={InboxIcon} label={t('event.proposals.list.empty')} noBorder />
          ) : null}

          {proposals.map((proposal) => (
            <List.RowLink key={proposal.id} to={proposal.id} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {proposal.title}
                </Text>
                <Text size="xs" variant="secondary">
                  {t('common.by', { names: proposal.speakers.map((a) => a.name) })}
                </Text>
              </div>
              <div className="flex items-center gap-4">
                <ProposalStatusLabel status={proposal.status} />
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </List.RowLink>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
