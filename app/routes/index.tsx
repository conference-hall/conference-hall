import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useSearchParams } from 'react-router';
import { EventsSearch } from '~/.server/event-search/event-search.ts';
import { parseUrlFilters } from '~/.server/event-search/event-search.types.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { BG_GRADIENT_COLOR } from '~/design-system/colors.ts';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { Pagination } from '~/design-system/list/pagination.tsx';
import { H1, H2 } from '~/design-system/typography.tsx';
import { Footer } from '~/routes/__components/footer.tsx';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import type { Route } from './+types/index.ts';
import { useUser } from './__components/contexts/user-context.tsx';
import { EventCardLink } from './__components/events/event-card.tsx';
import { SearchEventsFilters } from './__components/search/search-events-filters.tsx';
import { SearchEventsInput } from './__components/search/search-events-input.tsx';
import { SponsorLink } from './__components/sponsor-link.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const results = await EventsSearch.with(filters, page).search();
  return results;
};

export default function IndexRoute({ loaderData }: Route.ComponentProps) {
  const user = useUser();
  const { filters, results, pagination } = loaderData;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <>
      <Navbar />

      <div className={cx(BG_GRADIENT_COLOR, 'shadow p-4 pt-0 lg:pb-16 lg:pt-10')}>
        <div className="hidden lg:mb-8 lg:block">
          <H1 size="2xl" weight="bold" variant="light" align="center">
            Call for papers for conferences and meetups.
          </H1>
        </div>
        <div className="flex flex-col w-full items-center">
          <div className="flex flex-col gap-2 w-full lg:w-6/12 lg:max-w-5xl items-end">
            <SearchEventsInput filters={filters} />

            {!user?.hasTeamAccess ? (
              <Link to="/team/request" variant="secondary-light" weight="semibold">
                Or become organizer
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <Page>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <H2 size="xl">Incoming call for papers</H2>
          <SearchEventsFilters />
        </div>

        {results?.length === 0 ? (
          <EmptyState icon={FaceFrownIcon} label="No results found!" />
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <ul aria-label="Search results" className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 w-full">
              {results.map((event) => (
                <EventCardLink
                  key={event.slug}
                  to={talkId ? `/${event.slug}/submission/${talkId}` : `/${event.slug}`}
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
