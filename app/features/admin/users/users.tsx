import { parseWithZod } from '@conform-to/zod/v4';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Input } from '~/design-system/forms/input.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import type { Route } from './+types/users.ts';
import { AdminUsers, UsersSearchFiltersSchema } from './services/admin-users.server.ts';

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const { searchParams } = new URL(request.url);
  const result = parseWithZod(searchParams, { schema: UsersSearchFiltersSchema });
  const filters = result.status === 'success' ? result.value : {};
  const page = parseUrlPage(request.url);
  const adminUsers = await AdminUsers.for(userId);
  return adminUsers.listUsers(filters, page);
};

export default function AdminUsersRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { results, filters, pagination, statistics } = loaderData;

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.users')}</H1>

      <List>
        <List.Header className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Text weight="semibold">{t('admin.users.total', { count: statistics.total })}</Text>
          <Form method="GET">
            <Input
              name="query"
              icon={MagnifyingGlassIcon}
              defaultValue={filters.query}
              aria-label={t('admin.users.search')}
              placeholder={t('admin.users.search')}
              className="w-full sm:w-72"
            />
          </Form>
        </List.Header>

        <List.Content aria-label={t('admin.nav.users')}>
          {results.map((user) => (
            <List.RowLink key={user.id} to={user.id} className="flex justify-between items-center gap-4">
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
