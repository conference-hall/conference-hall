import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext, useSearchParams } from '@remix-run/react';
import { Container } from '../../design-system/Container';
import { H1 } from '../../design-system/Typography';
import { mapErrorToResponse } from '../../libs/errors';
import { SearchEventsForm } from './components/SearchEventsForm';
import { EmptyState } from '~/design-system/EmptyState';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { parsePage } from '~/schemas/pagination';
import { parseFilters } from '~/schemas/search';
import { Navbar } from '~/shared-components/navbar/Navbar';
import type { UserContext } from '~/root';
import { searchEvents } from './server/search.server';
import { Pagination } from '~/design-system/Pagination';
import { SearchEventsList } from './components/SearchEventsList';

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const filters = await parseFilters(url.searchParams);
  const page = await parsePage(url.searchParams);

  try {
    const results = await searchEvents(filters, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function IndexRoute() {
  const { user, notifications } = useOutletContext<UserContext>();
  const { filters, results, pagination } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <>
      <Navbar user={user} notifications={notifications} />
      <Container className="py-0 sm:py-24">
        <H1 className="hidden sm:block">Conferences and meetups.</H1>
        <SearchEventsForm filters={filters} className="mt-4" />
      </Container>
      <Container className="pb-8">
        {results?.length === 0 ? (
          <EmptyState
            icon={FaceFrownIcon}
            label="No results found!"
            description="Adjust the filters to find your results."
          />
        ) : (
          <SearchEventsList events={results} forTalkId={talkId} />
        )}
        {pagination.total > 1 && <Pagination pathname="/" {...pagination} className="mt-8" />}
      </Container>
    </>
  );
}
