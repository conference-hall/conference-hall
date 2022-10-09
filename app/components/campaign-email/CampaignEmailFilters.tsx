import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';

type Props = { pathname: string; query?: string | null };

export function CampaignEmailFilters({ pathname, query }: Props) {
  return (
    <Form action={pathname} method="get">
      <Input
        name="query"
        type="search"
        aria-label="Find a proposal"
        placeholder="Find a proposal"
        className="mt-4 w-full sm:w-80"
        autoComplete="off"
        defaultValue={query || ''}
        icon={MagnifyingGlassIcon}
      />
    </Form>
  );
}
