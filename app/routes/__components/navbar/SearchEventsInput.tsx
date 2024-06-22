import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';

import { Input } from '~/design-system/forms/Input.tsx';

export function SearchEventsInput() {
  return (
    <Form action="/" method="GET" className="flex flex-1 justify-center pl-4 pr-2 lg:ml-2 lg:justify-start">
      <Input
        name="query"
        aria-label="Search conferences and meetups."
        icon={MagnifyingGlassIcon}
        placeholder="Search"
        color="dark"
        type="search"
        className="w-full md:w-96"
      />
    </Form>
  );
}
