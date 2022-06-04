import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { SearchEventForm } from '~/components/search/SearchEventForm';
import { H1, Text } from '../components/Typography';
import { EventItem, EventsList } from '../components/search/EventsList';
import { searchEvents, SearchEvents, validateFilters } from '../services/events/search.server';
import { mapErrorToResponse } from '../services/errors';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filters = validateFilters(url.searchParams);
  try {
    const results = await searchEvents(filters);
    return json<SearchEvents>(results);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SearchRoute() {
  const data = useLoaderData<SearchEvents>();
  return (
    <div>
      <div>
        <Container className="py-24">
          <H1>Conferences and meetups.</H1>
          <SearchEventForm filters={data.filters} className="mt-4" />
        </Container>
      </div>
      <Container className="pb-8">
        {data.results?.length === 0 ? (
          <Text>No events found.</Text>
        ) : (
          <EventsList>
            {data.results.map((result) => (
              <EventItem key={result.slug} {...result} />
            ))}
          </EventsList>
        )}
      </Container>
    </div>
  );
}
