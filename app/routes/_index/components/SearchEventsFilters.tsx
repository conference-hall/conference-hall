import { Form, useSearchParams } from '@remix-run/react';

import { Button } from '~/design-system/Buttons';

import type { SearchFilters } from '../server/search.server';

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
          defaultOutline
          className="rounded-r-none border-r-0"
        >
          All
        </Button>
        <Button
          name="type"
          value="conference"
          variant={type === 'conference' ? 'primary' : 'secondary'}
          size="s"
          defaultOutline
          className="rounded-none"
        >
          Conferences
        </Button>
        <Button
          name="type"
          value="meetup"
          variant={type === 'meetup' ? 'primary' : 'secondary'}
          size="s"
          defaultOutline
          className="rounded-l-none border-l-0"
        >
          Meetups
        </Button>
      </div>
    </Form>
  );
}
