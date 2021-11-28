import { Form } from 'remix';

type SearchEventFormProps = { terms?: string };

export function SearchEventForm({ terms }: SearchEventFormProps) {
  return (
    <Form action="/search" method="get">
      <input type="search" name="terms" placeholder="search" defaultValue={terms} />
      <button type="submit">Search</button>
    </Form>
  );
}
