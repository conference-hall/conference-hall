import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { NavbarEvent } from '~/app-platform/components/navbar/navbar-event.tsx';
import { BG_COLOR } from '~/design-system/colors.ts';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { Pagination } from '~/design-system/list/pagination.tsx';
import { H1, H2 } from '~/design-system/typography.tsx';
import { parseUrlFilters } from '~/features/event-search/services/event-search.schema.server.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { SponsorLink } from '../../app-platform/components/sponsor-link.tsx';
import { useUser } from '../../app-platform/components/user-context.tsx';
import type { Route } from './+types/event-search.ts';
import { EventCardLink } from './components/event-card.tsx';
import { SearchEventsFilters } from './components/search-events-filters.tsx';
import { SearchEventsInput } from './components/search-events-input.tsx';
import { EventsSearch } from './services/event-search.server.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  return EventsSearch.with(filters, page).search();
};

export default function IndexRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const user = useUser();
  const { filters, results, pagination } = loaderData;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <>
      <NavbarEvent />

      <div className={cx(BG_COLOR, 'shadow-sm p-4 pt-0 lg:pb-16 lg:pt-10')}>
        <div className="hidden lg:mb-8 lg:block">
          <H1 size="2xl" weight="bold" variant="light" align="center">
            {t('home.title')}
          </H1>
        </div>
        <div className="flex flex-col w-full items-center">
          <div className="flex flex-col gap-2 w-full lg:w-6/12 lg:max-w-5xl items-end">
            <SearchEventsInput filters={filters} />

            {!user?.hasTeamAccess ? (
              <Link to={href('/team/request')} variant="secondary-light" weight="semibold">
                {t('home.become-organizer')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <Page>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <H2 size="xl">{t('home.incoming-call-for-papers')}</H2>
          <SearchEventsFilters />
        </div>

        {results?.length === 0 ? (
          <EmptyState icon={FaceFrownIcon} label={t('common.no-results')} />
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <ul aria-label={t('home.results')} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 w-full">
              {results.map((event) => (
                <EventCardLink
                  key={event.slug}
                  to={
                    talkId
                      ? href('/:event/submission/:talk', { event: event.slug, talk: talkId })
                      : href('/:event', { event: event.slug })
                  }
                  name={event.name}
                  type={event.type}
                  logoUrl={event.logoUrl}
                  cfpState={event.cfpState}
                  cfpStart={event.cfpStart}
                  cfpEnd={event.cfpEnd}
                />
              ))}
            </ul>

            <Pagination {...pagination} />

            <SponsorLink />
          </div>
        )}
      </Page>

      <Footer />
    </>
  );
}
