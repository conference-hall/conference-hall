import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Form, useSearchParams } from 'react-router';
import { Input } from '~/design-system/forms/input.tsx';

type Props = { placeholder: string; ariaLabel: string };

export function SearchInput({ placeholder, ariaLabel }: Props) {
  const [params] = useSearchParams();
  const query = params.get('query') ?? undefined;

  return (
    <Form method="GET" className="grow">
      {[...params.entries()]
        .filter(([key]) => key !== 'query')
        .map(([key, value], i) => (
          <input key={`${key}-${i}`} type="hidden" name={key} value={value} />
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
