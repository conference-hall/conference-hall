import { PlusIcon } from '@heroicons/react/20/solid';
import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { EventCardLink } from '~/features/event-search/components/event-card.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { AuthorizedTeamContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/event-list.ts';
import { TeamEventsStatusSchema } from './services/team-events.schema.server.ts';
import { TeamEvents } from './services/team-events.server.ts';

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const status = TeamEventsStatusSchema.parse(url.searchParams.get('status'));

  const authorizedTeam = context.get(AuthorizedTeamContext);
  return TeamEvents.for(authorizedTeam).list(status);
};

export default function TeamEventsRoute({ loaderData: { events, counts } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const permissions = useUserTeamPermissions();
  const [searchParams] = useSearchParams();
  const archived = searchParams.get('status') === 'archived';
  const hasEvent = events.length > 0;

  return (
    <Page>
      <Page.Heading title={t('team.events-list.heading')} subtitle={t('team.events-list.description')}>
        <SearchParamSelector
          param="status"
          defaultValue="active"
          selectors={[
            { value: 'active', label: t('common.active'), count: counts.active },
            { value: 'archived', label: t('common.archived'), count: counts.archived },
            { value: 'all', label: t('common.all'), count: counts.all },
          ]}
        />
        {permissions.canCreateEvent ? (
          <Button to={href('/team/:team/new', { team: currentTeam.slug })} iconLeft={PlusIcon}>
            {t('team.events-list.new-event-button')}
          </Button>
        ) : null}
      </Page.Heading>

      {hasEvent ? (
        <ul aria-label={t('team.events-list.list')} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
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
              archived={event.archived}
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
