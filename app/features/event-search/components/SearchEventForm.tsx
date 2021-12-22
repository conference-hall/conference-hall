import { Form } from 'remix';
import { Input } from '../../../components/forms/Input';

type SearchEventFormProps = { terms?: string, className?: string };

export function SearchEventForm({ terms, className }: SearchEventFormProps) {
  return (
    <Form action="/search" method="get" className={className}>
      <Input
        type="search"
        name="terms"
        placeholder="Search..."
        aria-label="Search conferences and meetups."
        defaultValue={terms}
      />
    </Form>
  );
}
