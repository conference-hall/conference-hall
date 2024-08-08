import { parseWithZod } from '@conform-to/zod';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { AdminUsers, UsersSearchFiltersSchema } from '~/.server/admin/admin-users.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { Input } from '~/design-system/forms/input.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);

  const adminUsers = await AdminUsers.for(userId);

  const { searchParams } = new URL(request.url);
  const result = parseWithZod(searchParams, { schema: UsersSearchFiltersSchema });
  const filters = result.status === 'success' ? result.value : {};

  const page = parseUrlPage(request.url);

  return adminUsers.listUsers(filters, page);
};

export default function AdminRoute() {
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  return (
    <Page>
      <H1 srOnly>Users</H1>

      <List>
        <List.Header className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Text weight="semibold">{`${statistics.total} user(s)`}</Text>
          <Form method="GET">
            <Input
              name="query"
              icon={MagnifyingGlassIcon}
              defaultValue={filters.query}
              aria-label="Search by name or email"
              placeholder="Search by name or email"
              className="w-full sm:w-72"
            />
          </Form>
        </List.Header>

        <List.Content aria-label="Users list">
          {results.map((user) => (
            <List.RowLink key={user.id} to={`users/${user.id}`} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {user.name}
                </Text>
                <Text size="xs" variant="secondary">
                  {user.email}
                </Text>
              </div>
              <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </List.RowLink>
          ))}
        </List.Content>

        <List.PaginationFooter current={pagination.current} pages={pagination.pages} total={statistics.total} />
      </List>
    </Page>
  );
}
