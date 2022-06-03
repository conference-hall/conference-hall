import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { SearchEventForm } from '~/components/search/SearchEventForm';
import { SearchEvents, searchEvents } from '~/features/events-search.server';
import { H1, Text } from '../components/Typography';
import { EventItem, EventsList } from '../components/search/EventsList';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const terms = url.searchParams.get('terms') ?? undefined;
  const results = await searchEvents(terms);
  return json<SearchEvents>(results);
}

export default function SearchRoute() {
  const data = useLoaderData<SearchEvents>();
  return (
    <div>
      <div className="bg-white">
        <Container className="py-16">
          <H1>Search for conferences and meetups.</H1>
          <SearchEventForm terms={data.terms} className="mt-16" />
        </Container>
      </div>
      <Container className="pt-8">
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
