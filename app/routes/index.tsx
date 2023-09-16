import { FaceFrownIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { Container } from '~/design-system/layouts/Container';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2, Text } from '~/design-system/Typography';
import { useUser } from '~/root';
import { EventCard } from '~/routes/__components/EventCard';
import { Footer } from '~/routes/__components/Footer';
import { Navbar } from '~/routes/__components/navbar/Navbar';
import { parsePage } from '~/routes/__types/pagination';

import { SearchEventsFilters } from './__components/search/SearchEventsFilters';
import { SearchEventsInput } from './__components/search/SearchEventsInput';
import { parseFilters, searchEvents } from './__server/search/search.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const filters = parseFilters(url.searchParams);
  const page = parsePage(url.searchParams);
  const results = await searchEvents(filters, page);
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

      <div className="bg-gray-800 shadow">
        <Container className="pb-8 sm:pb-16 sm:pt-10">
          <H1 size="4xl" variant="light" align="center">
            Conference Hall
          </H1>
          <Text size="l" heading variant="light" align="center">
            Call for papers for conferences and meetups.
          </Text>
          <SearchEventsInput filters={filters} />
        </Container>
      </div>

      <Container className="pt-8 sm:pt-16">
        <div className="mb-10 flex items-center justify-between">
          <H2 size="xl">Incoming call for papers</H2>
          <SearchEventsFilters filters={filters} />
        </div>
        {results?.length === 0 ? (
          <EmptyState icon={FaceFrownIcon} label="No results found!" />
        ) : (
          <div className="space-y-8">
            <ul aria-label="Search results" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
      </Container>

      <Footer />
    </>
  );
}
