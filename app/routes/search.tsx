import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { Container } from '../components-ui/Container';
import { H1, Text } from '../components-ui/Typography';
import { SearchEventsList } from '../components-app/SearchEventsList';
import { searchEvents, SearchEvents, validateFilters, validatePage } from '../services/events/search.server';
import { mapErrorToResponse } from '../services/errors';
import { SearchEventsForm } from '../components-app/SearchEventsForm';
import { Link } from '../components-ui/Links';
import { SearchPagination } from '../components-ui/Pagination';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filters = validateFilters(url.searchParams);
  const page = validatePage(url.searchParams);

  try {
    const results = await searchEvents(filters, page);
    return json<SearchEvents>(results);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SearchRoute() {
  const { filters, results, pagination } = useLoaderData<SearchEvents>();
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <div>
      <div>
        <Container className="py-24">
          <H1>Conferences and meetups.</H1>
          <SearchEventsForm filters={filters} className="mt-4" />
        </Container>
      </div>
      <Container className="pb-8">
        {results?.length === 0 ? (
          <Text>No events found.</Text>
        ) : (
          <SearchEventsList events={results} forTalkId={talkId} />
        )}
        {pagination.total > 1 && <SearchPagination pathname="/search" {...pagination} className="mt-8" />}
      </Container>
    </div>
  );
}
