import c from 'classnames'
import { Form } from '@remix-run/react';
import { Input } from '../forms/Input';

type SearchEventFormProps = { terms?: string; className?: string };

export function SearchEventForm({ terms, className }: SearchEventFormProps) {
  return (
    <Form action="/search" method="get" className={c(className)}>
      <Input
        type="search"
        name="terms"
        placeholder="Search conferences and meetups..."
        aria-label="Search conferences and meetups."
        defaultValue={terms}
      />
    </Form>
  );
}
