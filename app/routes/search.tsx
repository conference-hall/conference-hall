import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/Container';
import { SearchEventForm } from '~/components/SearchEventForm';
import { searchEvents, SearchEventsResponse } from '~/server/search-events/search.server';

export const loader: LoaderFunction = async ({ request }) => {
  return searchEvents(request);
};

export default function SearchRoute() {
  const data = useLoaderData<SearchEventsResponse>();

  return (
    <Container>
      <SearchEventForm terms={data.terms} />
      <div>
        {data.results.map((result) => (
          <div key={result.id}>{result.name}</div>
        ))}
        {data.results?.length === 0 ? <p>No events found.</p> : null}
      </div>
    </Container>
  );
}
