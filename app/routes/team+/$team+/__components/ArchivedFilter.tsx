import { Form, useLocation, useSearchParams } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons.tsx';

export function ArchivedFilters() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const archived = Boolean(searchParams.get('archived'));

  return (
    <Form action="/" method="GET">
      <div className="isolate inline-flex">
        <ButtonLink
          to={pathname}
          variant={!archived ? 'primary' : 'secondary'}
          size="s"
          className="rounded-r-none border-0 ring-1 ring-inset ring-gray-300"
        >
          Active
        </ButtonLink>
        <ButtonLink
          to={{ pathname: pathname, search: 'archived=true' }}
          variant={archived ? 'primary' : 'secondary'}
          size="s"
          className="rounded-l-none -ml-px border-0 ring-1 ring-inset ring-gray-300"
        >
          Archived
        </ButtonLink>
      </div>
    </Form>
  );
}
