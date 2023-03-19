import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Select from '~/design-system/forms/Select';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import type { SearchFilters } from '~/schemas/search';

type Props = {
  filters: SearchFilters;
  className?: string;
};

export function SearchEventsForm({ filters, className }: Props) {
  const { query, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');
  const submit = useSubmit();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'get', action: '/' });
  }

  return (
    <Form action="/" method="get" className={className}>
      {talkId && <input type="hidden" name="talkId" value={talkId} />}
      <div className="flex sm:items-center sm:gap-4">
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
        <Button type="submit" className="hidden sm:block">
          Search
        </Button>
      </div>
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
