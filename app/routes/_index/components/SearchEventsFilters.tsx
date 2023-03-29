import { Form, useSearchParams } from '@remix-run/react';
import type { SearchFilters } from '../types/search';
import { Button } from '~/design-system/Buttons';

type Props = { filters: SearchFilters };

export function SearchEventsFilters({ filters }: Props) {
  const { query, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <Form action="/" method="get" className="space-x-4">
      {query && <input type="hidden" name="query" value={query} />}
      {cfp && <input type="hidden" name="cfp" value={cfp} />}
      {talkId && <input type="hidden" name="talkId" value={talkId} />}

      <Button name="type" value="all" variant={!type || type === 'all' ? 'primary' : 'secondary'} size="s" rounded>
        All events
      </Button>
      <Button name="type" value="conference" variant={type === 'conference' ? 'primary' : 'secondary'} size="s" rounded>
        Conferences only
      </Button>
      <Button name="type" value="meetup" variant={type === 'meetup' ? 'primary' : 'secondary'} size="s" rounded>
        Meetups only
      </Button>
    </Form>
  );
}
