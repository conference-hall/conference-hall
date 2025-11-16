import { PlusIcon } from '@heroicons/react/20/solid';
import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { EventCardLink } from '~/features/event-search/components/event-card.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/event-list.ts';
import { TeamEvents } from './services/team-events.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const url = new URL(request.url);
  const archived = url.searchParams.get('archived') === 'true';
  return TeamEvents.for(userId, params.team).list(archived);
};

export default function TeamEventsRoute({ loaderData: events }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const [searchParams] = useSearchParams();
  const archived = searchParams.get('archived') === 'true';
  const hasEvent = events.length > 0;

  return (
    <Page>
      <Page.Heading title={t('team.events-list.heading')} subtitle={t('team.events-list.description')}>
        <SearchParamSelector
          param="archived"
          defaultValue="false"
          selectors={[
            { value: 'true', label: t('common.archived') },
            { value: 'false', label: t('common.active') },
          ]}
        />
        {currentTeam.userPermissions.canCreateEvent ? (
          <Button to={href('/team/:team/new', { team: currentTeam.slug })} iconLeft={PlusIcon}>
            {t('team.events-list.new-event-button')}
          </Button>
        ) : null}
      </Page.Heading>

      {hasEvent ? (
        <ul aria-label={t('team.events-list.list')} className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <EventCardLink
              key={event.slug}
              to={href('/team/:team/:event', { team: currentTeam.slug, event: event.slug })}
              name={event.name}
              type={event.type}
              logoUrl={event.logoUrl}
              cfpState={event.cfpState}
              cfpStart={event.cfpStart}
              cfpEnd={event.cfpEnd}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Square3Stack3DIcon}
          label={
            archived ? t('team.events-list.empty.archived') : t('team.events-list.empty', { team: currentTeam.name })
          }
          className="flex flex-col items-center gap-2"
        />
      )}
    </Page>
  );
}
