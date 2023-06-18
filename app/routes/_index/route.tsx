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
import { H2, Text } from '~/design-system/Typography';
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
        <Container className="py-4 pt-0 lg:pb-16 lg:pt-10">
          <div className="hidden lg:mb-8 lg:block">
            <Text size="2xl" heading variant="light" align="center">
              Call for papers for conferences and meetups.
            </Text>
          </div>
          <SearchEventsInput filters={filters} />
        </Container>
      </div>

      <Container className="pt-8">
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
      </Container>

      <Footer />
    </>
  );
}
