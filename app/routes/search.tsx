import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/Container';
import { SearchEventForm } from '~/components/SearchEventForm';
import { searchEvents, SearchEventsResponse } from '~/server/search-events/search.server';
import { EventItem, EventsList } from '../components/EventsList';

export const loader: LoaderFunction = async ({ request }) => {
  return searchEvents(request);
};

export default function SearchRoute() {
  const data = useLoaderData<SearchEventsResponse>();

  return (
    <Container>
      <SearchEventForm terms={data.terms} />
      {data.results?.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <EventsList>
          {data.results.map((result) => (
            <EventItem key={result.id} {...result} />
          ))}
        </EventsList>
      )}
    </Container>
  );
}
