import { Form } from '@remix-run/react';

import { InputSearch } from '~/design-system/forms/InputSearch.tsx';

export function SearchEventsInput() {
  return (
    <Form action="/" method="GET" className="flex flex-1 justify-center pl-4 pr-2 lg:ml-2 lg:justify-start">
      <InputSearch name="query" label="Search conferences and meetups." placeholder="Search" />
    </Form>
  );
}
