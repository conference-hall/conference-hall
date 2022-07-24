import c from 'classnames';
import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { SearchFilters } from '../services/events/search.server';
import { Input } from '../components-ui/forms/Input';
import { Button } from '../components-ui/Buttons';
import DetailedSelect from '../components-ui/forms/DetailedSelect';

type Props = {
  filters: SearchFilters;
  className?: string;
};

export function SearchEventsForm({ filters, className }: Props) {
  const { terms, type, cfp } = filters;
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');
  const submit = useSubmit();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'get', action: '/' });
  }

  return (
    <Form action="/" method="get" className={c(className)}>
      {talkId && <input type="hidden" name="talkId" value={talkId} />}
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
