import { Form } from 'remix';
import { Input } from './Input';

type SearchEventFormProps = { terms?: string };

export function SearchEventForm({ terms }: SearchEventFormProps) {
  return (
    <Form action="/search" method="get" className="my-8">
      <Input type="search" name="terms" placeholder="Search events" aria-label="Search events" defaultValue={terms} />
    </Form>
  );
}
