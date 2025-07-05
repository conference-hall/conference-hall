import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { EventSpeakers, parseUrlFilters } from '~/.server/event-speakers/event-speakers.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Avatar } from '~/shared/design-system/avatar.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { H1, Text } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/speakers.ts';
import { Filters } from './components/speakers-page/filters.tsx';
import { FiltersTags } from './components/speakers-page/filters-tags.tsx';
import { SpeakersEmptyState } from './components/speakers-page/speakers-empty-state.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
  return eventSpeakers.search(filters, page);
};

export default function SpeakersRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  const { speakers, filters, pagination, statistics } = loaderData;

  return (
    <Page>
      <div className="space-y-4">
        <H1 srOnly>{t('event-management.speakers.heading')}</H1>

        <div className="space-y-4">
          <Filters />
          <FiltersTags filters={filters} />
        </div>

        {speakers.length === 0 ? (
          <SpeakersEmptyState query={filters.query} />
        ) : (
          <List>
            <List.Header>
              <Text>{t('event-management.speakers.list.items', { count: statistics.total })}</Text>
            </List.Header>

            <List.Content aria-label={t('event-management.speakers.heading')}>
              {speakers.map((speaker) => {
                const totalProposals = speaker.proposals.length;
                const acceptedProposals = speaker.proposals.filter((p) => p.deliberationStatus === 'ACCEPTED').length;
                const confirmedProposals = speaker.proposals.filter((p) => p.confirmationStatus === 'CONFIRMED').length;
                const declinedProposals = speaker.proposals.filter((p) => p.confirmationStatus === 'DECLINED').length;

                return (
                  <List.RowLink key={speaker.id} to={{ pathname: speaker.id, search }} className="p-4">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <Avatar picture={speaker.picture} name={speaker.name} size="m" />
                        <div className="flex-1 min-w-0">
                          <Text size="s" weight="medium" truncate>
                            {speaker.name}
                          </Text>
                          {speaker.company && (
                            <Text size="xs" variant="secondary" truncate>
                              {speaker.company}
                            </Text>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1 ml-4">
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{totalProposals}</div>
                            <div className="text-xs text-gray-500">{t('common.proposals')}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{acceptedProposals}</div>
                            <div className="text-xs text-gray-500">{t('event-management.speakers.stats.accepted')}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{confirmedProposals}</div>
                            <div className="text-xs text-gray-500">
                              {t('event-management.speakers.stats.confirmed')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{declinedProposals}</div>
                            <div className="text-xs text-gray-500">{t('event-management.speakers.stats.declined')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.RowLink>
                );
              })}
            </List.Content>

            <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
          </List>
        )}
      </div>
    </Page>
  );
}
