import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { SearchEventForm } from '~/features/event-search/components/SearchEventForm';
import { SearchEvents, searchEvents } from '~/features/event-search/search-events.server';
import { EventItem, EventsList } from '../features/event-search/components/EventsList';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return searchEvents({ request, params, context });
};

export default function SearchRoute() {
  const data = useLoaderData<SearchEvents>();

  return (
    <div className="bg-gray-50 h-[calc(100vh-64px)]">
      <div className="bg-white border-y border-gray-200">
        <Container className="py-16">
          <h1 className="text-3xl leading-6 font-black">Search for conferences and meetups.</h1>
          <SearchEventForm terms={data.terms} className="mt-16" />
        </Container>
      </div>
      <Container className="pt-8">
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
    </div>
  );
}
