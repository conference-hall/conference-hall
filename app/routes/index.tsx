import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { Container } from '../design-system/Container';
import { H1 } from '../design-system/Typography';
import { SearchEventsList } from '../components/SearchEventsList';
import { searchEvents } from '../services/events/search.server';
import { SearchEventsForm } from '../components/SearchEventsForm';
import { Pagination } from '../design-system/Pagination';
import { EmptyState } from '~/design-system/EmptyState';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { Navbar } from '~/components/navbar/Navbar';
import { fromSuccess, inputFromSearch } from 'domain-functions';

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  let result = await searchEvents(inputFromSearch(url.searchParams));

  if (result.success) return json(result.data);

  return json(await fromSuccess(searchEvents)({}));
};

export default function IndexRoute() {
  const { filters, results, pagination } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <>
      <Navbar />
      <Container className="py-0 sm:py-24">
        <H1 className="hidden sm:block">Conferences and meetups.</H1>
        <SearchEventsForm className="mt-4" filters={filters} />
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
