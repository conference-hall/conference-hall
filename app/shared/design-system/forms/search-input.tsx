import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Form, useSearchParams } from 'react-router';
import { Input } from '~/shared/design-system/forms/input.tsx';

type Props = { placeholder: string; ariaLabel: string };

export function SearchInput({ placeholder, ariaLabel }: Props) {
  const [params] = useSearchParams();
  const { query, ...filters } = Object.fromEntries(params.entries());

  return (
    <Form method="GET" className="grow">
      {Object.keys(filters).map((key) => (
        <input key={key} type="hidden" name={key} value={filters[key]} />
      ))}
      <Input
        name="query"
        key={query}
        icon={MagnifyingGlassIcon}
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </Form>
  );
}
