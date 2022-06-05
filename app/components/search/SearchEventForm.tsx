import c from 'classnames';
import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { Input } from '../forms/Input';
import DetailedSelect from '../forms/DetailedSelect';
import { SearchFilters } from '../../services/events/search.server';
import { Button } from '../Buttons';

type SearchEventFormProps = {
  filters: SearchFilters;
  className?: string;
};

export function SearchEventForm({ filters, className }: SearchEventFormProps) {
  const { terms, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'get', action: '/search' });
  }

  return (
    <Form action="/search" method="get" className={c(className)}>
      <div className="gap-4 sm:flex sm:items-center">
        <Input
          type="search"
          name="terms"
          placeholder="Search conferences and meetups..."
          aria-label="Search conferences and meetups."
          defaultValue={terms}
          autoComplete="off"
          className=" w-full"
        />
        <Button type="submit">Search</Button>
      </div>
      <div className="flex justify-end pt-4">
        <DetailedSelect
          name="cfp"
          label="Filter by CFP status"
          value={cfp || 'incoming'}
          onChange={handleChange}
          options={[
            { id: 'incoming', label: 'Incoming CFP' },
            { id: 'past', label: 'Past CFP' },
          ]}
        />
        <DetailedSelect
          name="type"
          label="Filter by event types"
          value={type || 'all'}
          onChange={handleChange}
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
