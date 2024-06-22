import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Form, useSearchParams } from '@remix-run/react';

import { Input } from '~/design-system/forms/Input.tsx';

export function SearchInput() {
  const [params] = useSearchParams();
  const { query, ...filters } = Object.fromEntries(params.entries());

  return (
    <Form method="GET" className="grow">
      {Object.keys(filters).map((key) => (
        <input key={key} type="hidden" name={key} value={filters[key]} />
      ))}
      <Input
        name="query"
        icon={MagnifyingGlassIcon}
        type="search"
        defaultValue={query}
        placeholder="Search proposals"
        aria-label="Search proposals"
      />
    </Form>
  );
}
