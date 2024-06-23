import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Form, useSearchParams } from '@remix-run/react';

import type { SearchFilters } from '~/.server/event-search/event-search.types';
import { Input } from '~/design-system/forms/input.tsx';

type Props = { filters: SearchFilters };

export function SearchEventsInput({ filters }: Props) {
  const { query, type } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <Form action="/" method="GET" className="flex flex-1 justify-center lg:justify-center">
      {type && <input type="hidden" name="type" value={type} />}
      {talkId && <input type="hidden" name="talkId" value={talkId} />}

      <Input
        name="query"
        aria-label="Search conferences and meetups."
        placeholder="Search conferences and meetups..."
        icon={MagnifyingGlassIcon}
        color="dark"
        size="l"
        defaultValue={query}
        type="search"
        className="w-full lg:w-6/12 lg:max-w-5xl"
        min={3}
      />
    </Form>
  );
}
