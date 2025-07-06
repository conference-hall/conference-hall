import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Text } from '~/design-system/typography.tsx';
import { SpeakerProposals } from '~/features/event-participation/speaker-proposals/services/speaker-proposals.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/speaker-proposals.ts';
import { ProposalStatusLabel } from './components/proposal-status-label.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return SpeakerProposals.for(userId, params.event).list();
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
