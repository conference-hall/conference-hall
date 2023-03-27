import { Form } from '@remix-run/react';
import { InputSearch } from '~/design-system/forms/InputSearch';

export function SearchEventsInput() {
  return (
    <Form action="/" method="get" className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
      <InputSearch name="query" label="Search conferences and meetups." placeholder="Search" />
    </Form>
  );
}
