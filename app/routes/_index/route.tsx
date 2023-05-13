import { FaceFrownIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { EventCard } from '~/components/EventCard';
import { Footer } from '~/components/Footer';
import { Navbar } from '~/components/navbar/Navbar';
import { Container } from '~/design-system/layouts/Container';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2, Text } from '~/design-system/Typography';
import { useUser } from '~/root';
import { parsePage } from '~/schemas/pagination';

import { SearchEventsFilters } from './components/SearchEventsFilters';
import { SearchEventsInput } from './components/SearchEventsInput';
import { parseFilters, searchEvents } from './server/search.server';

export const loader = async ({ request }: LoaderArgs) => {
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
          <H1 variant="light" align="center" size="4xl">
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
          <H2 mb={0}>Incoming call for papers</H2>
          <SearchEventsFilters filters={filters} />
        </div>
        {results?.length === 0 ? (
          <EmptyState icon={FaceFrownIcon} label="No results found!" />
        ) : (
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
        )}
        <Pagination {...pagination} className="mt-8" />
      </Container>

      <Footer />
    </>
  );
}
