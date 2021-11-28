import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '../components/Container';
import { SearchEventForm } from '../components/SearchEventForm';
import { searchEvents, ISearchResult } from '../server/search.server';

export const loader: LoaderFunction = async ({ request }) => {
  const data = await searchEvents(request);
  return data;
};

export default function SearchRoute() {
  const data = useLoaderData<ISearchResult>();

  return (
    <Container>
      <SearchEventForm terms={data.terms} />
      <div>
        {data.results.map((result) => (
          <div key={result.id}>{result.name}</div>
        ))}
      </div>
    </Container>
  );
}
