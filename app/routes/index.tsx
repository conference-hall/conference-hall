import { FaceFrownIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { Pagination } from '~/design-system/list/Pagination.tsx';
import { H1, H2 } from '~/design-system/Typography.tsx';
import { EventsSearch } from '~/domains/event-search/EventSearch.ts';
import { parseUrlFilters } from '~/domains/event-search/EventSearch.types.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { useUser } from '~/root.tsx';
import { EventCard } from '~/routes/__components/EventCard.tsx';
import { Footer } from '~/routes/__components/Footer.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';

import { SearchEventsFilters } from './__components/search/SearchEventsFilters.tsx';
import { SearchEventsInput } from './__components/search/SearchEventsInput.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const results = await EventsSearch.with(filters, page).search();
  return json(results);
};

export default function IndexRoute() {
  const { user } = useUser();
  const { filters, results, pagination } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <>
      <Navbar user={user} />

      <div className="bg-gray-800 shadow p-4 pt-0 lg:pb-16 lg:pt-10">
        <div className="hidden lg:mb-8 lg:block">
          <H1 size="2xl" variant="light" align="center">
            Call for papers for conferences and meetups.
          </H1>
        </div>
        <SearchEventsInput filters={filters} />
      </div>

      <PageContent>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <H2 size="xl">Incoming call for papers</H2>
          <SearchEventsFilters filters={filters} />
        </div>
        {results?.length === 0 ? (
          <EmptyState icon={FaceFrownIcon} label="No results found!" />
        ) : (
          <div className="flex-col items-center space-y-8">
            <ul aria-label="Search results" className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
              {results.map((event) => (
                <EventCard
                  key={event.slug}
                  to={talkId ? `/${event.slug}/submission/${talkId}` : `/${event.slug}`}
                  name={event.name}
                  type={event.type}
                  logo={event.logo}
                  cfpState={event.cfpState}
                  cfpStart={event.cfpStart}
                  cfpEnd={event.cfpEnd}
                />
              ))}
            </ul>
            <Pagination {...pagination} />
          </div>
        )}
      </PageContent>

      <Footer />
    </>
  );
}
