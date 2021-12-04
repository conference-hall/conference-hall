import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/ui/Container';
import { SearchEventForm } from '~/components/search/SearchEventForm';
import { SearchEvents, searchEvents } from '~/server/search/search-events.server';
import { EventItem, EventsList } from '../components/search/EventsList';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return searchEvents({ request, params, context });
};

export default function SearchRoute() {
  const data = useLoaderData<SearchEvents>();

  return (
    <Container>
      <SearchEventForm terms={data.terms} />
      {data.results?.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <EventsList>
          {data.results.map((result) => (
            <EventItem key={result.slug} {...result} />
          ))}
        </EventsList>
      )}
    </Container>
  );
}
