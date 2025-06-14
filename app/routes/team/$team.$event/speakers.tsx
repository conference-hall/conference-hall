import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { useTranslation } from 'react-i18next';
import { data } from 'react-router';
import { Form, useSearchParams } from 'react-router';
import { Pagination, parseUrlPage } from '~/.server/shared/pagination.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import type { Route } from './+types/speakers.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireUserSession(request);

  const speakersPageEnabled = await flags.get('speakersPage');
  if (!speakersPageEnabled) {
    throw data(null, { status: 404 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query')?.trim() || '';
  const page = parseUrlPage(request.url);

  const whereClause: Prisma.EventSpeakerWhereInput = {
    event: { slug: params.event },
    name: query ? { contains: query, mode: 'insensitive' } : undefined,
  };

  const total = await db.eventSpeaker.count({ where: whereClause });

  const pagination = new Pagination({ page, total });

  const speakers = await db.eventSpeaker.findMany({
    where: whereClause,
    include: { proposals: true },
    orderBy: { name: 'asc' },
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
  });

  return {
    speakers: speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
      company: speaker.company,
      proposals: speaker.proposals
        .filter((proposal) => !proposal.isDraft)
        .map((proposal) => ({
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
        })),
    })),
    query,
    pagination: {
      current: pagination.page,
      total: pagination.pageCount,
    },
    statistics: { total },
  };
};

function SearchInput() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { query, ...filters } = Object.fromEntries(params.entries());

  return (
    <Form method="GET" className="w-full max-w-md">
      {Object.keys(filters).map((key) => (
        <input key={key} type="hidden" name={key} value={filters[key]} />
      ))}
      <Input
        name="query"
        icon={MagnifyingGlassIcon}
        type="search"
        defaultValue={query}
        placeholder={t('event-management.speakers.search')}
        aria-label={t('event-management.speakers.search')}
      />
    </Form>
  );
}

export default function SpeakersRoute({
  loaderData: { speakers, query, pagination, statistics },
}: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <Page>
      <div className="space-y-4">
        <H1 srOnly>{t('event-management.speakers.heading')}</H1>

        <SearchInput />

        {speakers.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            label={
              query ? t('event-management.speakers.empty.search.title') : t('event-management.speakers.empty.title')
            }
          >
            <Subtitle>
              {query
                ? t('event-management.speakers.empty.search.description', { query })
                : t('event-management.speakers.empty.description')}
            </Subtitle>
          </EmptyState>
        ) : (
          <List>
            <List.Header>
              <Text weight="semibold">{t('event-management.speakers.list.items', { count: statistics.total })}</Text>
            </List.Header>
            <List.Content aria-label={t('event-management.speakers.heading')}>
              {speakers.map((speaker) => {
                const totalProposals = speaker.proposals.length;
                const acceptedProposals = speaker.proposals.filter((p) => p.deliberationStatus === 'ACCEPTED').length;
                const confirmedProposals = speaker.proposals.filter((p) => p.confirmationStatus === 'CONFIRMED').length;
                const declinedProposals = speaker.proposals.filter((p) => p.confirmationStatus === 'DECLINED').length;
                const hasConfirmedProposal = speaker.proposals.some((p) => p.confirmationStatus === 'CONFIRMED');
                const hasDeclinedAllAccepted = acceptedProposals > 0 && acceptedProposals === declinedProposals;

                return (
                  <List.Row key={speaker.id} className="p-4">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <Avatar picture={speaker.picture} name={speaker.name} size="m" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Text size="s" weight="medium" truncate>
                              {speaker.name}
                            </Text>

                            {hasConfirmedProposal && (
                              <Badge color="green" compact pill>
                                {t('event-management.speakers.badge.confirmed')}
                              </Badge>
                            )}

                            {hasDeclinedAllAccepted && (
                              <Badge color="red" compact pill>
                                {t('event-management.speakers.badge.declined')}
                              </Badge>
                            )}
                          </div>
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
                            <div className="text-xs text-gray-500">
                              {t('event-management.speakers.stats.submitted')}
                            </div>
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
                  </List.Row>
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
