import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Text } from '~/design-system/typography.tsx';
import { SpeakerProposals } from '~/features/event-participation/speaker-proposals/services/speaker-proposals.server.ts';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import { useCurrentEvent } from '../event-page-context.tsx';
import type { Route } from './+types/speaker-proposals.ts';
import { ProposalStatusLabel } from './components/proposal-status-label.tsx';

export const middleware = [requireAuth];

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  return SpeakerProposals.for(authUser.id, params.event).list();
};

export default function EventSpeakerProposalsRoute({ loaderData: proposals }: Route.ComponentProps) {
  const { t } = useTranslation();
  const event = useCurrentEvent();

  return (
    <Page>
      <Page.Heading title={t('event.proposals.heading')}>
        {event.cfpState === 'OPENED' && proposals.length > 0 ? (
          <Button to={href('/:event/submission', { event: event.slug })}>{t('event.nav.submit-proposal')}</Button>
        ) : null}
      </Page.Heading>

      {proposals.length === 0 ? (
        <EmptyState icon={InboxIcon} label={t('event.proposals.list.empty')}>
          {event.cfpState === 'OPENED' ? (
            <Button to={href('/:event/submission', { event: event.slug })}>{t('event.nav.submit-proposal')}</Button>
          ) : null}
        </EmptyState>
      ) : (
        <List>
          <List.Content aria-label={t('event.proposals.list')}>
            {proposals.map((proposal) => (
              <List.RowLink key={proposal.id} to={proposal.id} className="flex items-center justify-between gap-4">
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
      )}
    </Page>
  );
}
