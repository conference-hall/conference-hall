import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Select from '~/design-system/forms/Select';
import { Input } from '~/design-system/forms/Input';
import type { SearchFilters } from '../types/search';

type Props = {
  filters: SearchFilters;
};

export function SearchEventsFilters({ filters }: Props) {
  const { query, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');
  const submit = useSubmit();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'get', action: '/' });
  }

  return (
    <Form action="/" method="get">
      {talkId && <input type="hidden" name="talkId" value={talkId} />}
      <Input
        type="search"
        name="query"
        placeholder="Search conferences and meetups..."
        aria-label="Search conferences and meetups."
        defaultValue={query}
        autoComplete="off"
        className=" w-full"
        icon={MagnifyingGlassIcon}
      />
      <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:justify-end">
        <Select
          name="cfp"
          label="Filter by CFP status"
          value={cfp || 'incoming'}
          onChange={handleChange}
          className="sm:w-56"
          srOnly
          options={[
            { id: 'incoming', label: 'Incoming CFP' },
            { id: 'past', label: 'Past CFP' },
          ]}
        />
        <Select
          name="type"
          label="Filter by event types"
          value={type || 'all'}
          onChange={handleChange}
          srOnly
          className="sm:w-56"
          options={[
            { id: 'all', label: 'Conferences & Meetups' },
            { id: 'conference', label: 'Conferences only' },
            { id: 'meetup', label: 'Meetups only' },
          ]}
        />
      </div>
    </Form>
  );
}
