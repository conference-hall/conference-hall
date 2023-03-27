import { Form, useSearchParams } from '@remix-run/react';
import type { SearchFilters } from '../types/search';
import { InputSearch } from '~/design-system/forms/InputSearch';

type Props = { filters: SearchFilters };

export function SearchEventsForm({ filters }: Props) {
  const { query, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <Form action="/" method="get" className="mt-10 flex flex-1 justify-center lg:justify-center">
      {type && <input type="hidden" name="type" value={type} />}
      {cfp && <input type="hidden" name="cfp" value={cfp} />}
      {talkId && <input type="hidden" name="talkId" value={talkId} />}

      <InputSearch
        name="query"
        label="Search conferences and meetups."
        placeholder="Search conferences and meetups..."
        size="l"
        defaultValue={query}
      />
    </Form>
  );
}
