import { Form, useSearchParams } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';
import type { SearchFilters } from '~/domains/event-search/EventSearch.types';

type Props = { filters: SearchFilters };

export function SearchEventsFilters({ filters }: Props) {
  const { query, type } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <Form action="/" method="GET">
      {query && <input type="hidden" name="query" value={query} />}
      {talkId && <input type="hidden" name="talkId" value={talkId} />}

      <div className="isolate inline-flex">
        <Button
          name="type"
          value="all"
          variant={!type || type === 'all' ? 'primary' : 'secondary'}
          size="s"
          className="rounded-r-none border-0 ring-1 ring-inset ring-gray-300"
        >
          All
        </Button>
        <Button
          name="type"
          value="conference"
          variant={type === 'conference' ? 'primary' : 'secondary'}
          size="s"
          className="rounded-none -ml-px border-0 ring-1 ring-inset ring-gray-300"
        >
          Conferences
        </Button>
        <Button
          name="type"
          value="meetup"
          variant={type === 'meetup' ? 'primary' : 'secondary'}
          size="s"
          className="rounded-l-none -ml-px border-0 ring-1 ring-inset ring-gray-300"
        >
          Meetups
        </Button>
      </div>
    </Form>
  );
}
