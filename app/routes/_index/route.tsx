import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext, useSearchParams } from '@remix-run/react';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import type { UserContext } from '~/root';
import { mapErrorToResponse } from '~/libs/errors';
import { EmptyState } from '~/design-system/EmptyState';
import { Container } from '~/design-system/Container';
import { H1, H4 } from '~/design-system/Typography';
import { Pagination } from '~/design-system/Pagination';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { parsePage } from '~/schemas/pagination';
import { searchEvents } from './server/search.server';
import { SearchEventsFilters } from './components/SearchEventsFilters';
import { SearchEventsList } from './components/SearchEventsList';
import { parseFilters } from './types/search';

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
        <Container className="py-0 sm:pt-10 sm:pb-16">
          <H1 type="light" align="center">
            Conference Hall
          </H1>
          <H4 as="p" type="light" align="center" mb={10}>
            Call for papers for conferences and meetups.
          </H4>
          <SearchEventsFilters filters={filters} />
        </Container>
      </div>
      <Container className="py-0 sm:py-16">
        {results?.length === 0 ? (
          <EmptyState
            icon={FaceFrownIcon}
            label="No results found!"
            description="Adjust the filters to find your results."
          />
        ) : (
          <SearchEventsList events={results} forTalkId={searchParams.get('talkId')} />
        )}
        {pagination.total > 1 && <Pagination pathname="/" {...pagination} className="mt-8" />}
      </Container>
    </>
  );
}
