import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext, useSearchParams } from '@remix-run/react';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import type { UserContext } from '~/root';
import { mapErrorToResponse } from '~/libs/errors';
import { EmptyState } from '~/design-system/EmptyState';
import { Container } from '~/design-system/Container';
import { H1, H2, Text } from '~/design-system/Typography';
import { Pagination } from '~/design-system/Pagination';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { parsePage } from '~/schemas/pagination';
import { searchEvents } from './server/search.server';
import { SearchEventsInput } from './components/SearchEventsInput';
import { parseFilters } from './types/search';
import { SearchEventsFilters } from './components/SearchEventsFilters';
import { EventCard } from '~/shared-components/EventCard';

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const filters = await parseFilters(url.searchParams);
  const page = await parsePage(url.searchParams);
  const results = await searchEvents(filters, page).catch(mapErrorToResponse);
  return json(results);
};

export default function IndexRoute() {
  const { user, notifications } = useOutletContext<UserContext>();
  const { filters, results, pagination } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Navbar user={user} notifications={notifications} />
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
              <EventCard key={event.slug} {...event} forTalkId={searchParams.get('talkId')} />
            ))}
          </ul>
        )}
        {pagination.total > 1 && <Pagination pathname="/" {...pagination} className="mt-8" />}
      </Container>
    </>
  );
}
