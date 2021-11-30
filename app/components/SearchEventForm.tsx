import { Form } from 'remix';

type SearchEventFormProps = { terms?: string };

export function SearchEventForm({ terms }: SearchEventFormProps) {
  return (
    <Form action="/search" method="get">
      <input type="search" name="terms" placeholder="search" aria-label="Search events" defaultValue={terms} />
      <button type="submit">Search</button>
    </Form>
  );
}
