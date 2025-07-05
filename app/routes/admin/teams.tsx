import { parseWithZod } from '@conform-to/zod';
import { CalendarIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { AdminTeams, TeamsSearchFiltersSchema } from '~/.server/admin/admin-teams.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { IconLabel } from '~/shared/design-system/icon-label.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { SortMenu } from '~/shared/design-system/list/sort-menu.tsx';
import { H1, Text } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/teams.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const adminTeams = await AdminTeams.for(userId);
  const { searchParams } = new URL(request.url);
  const result = parseWithZod(searchParams, { schema: TeamsSearchFiltersSchema });
  const filters = result.status === 'success' ? result.value : {};
  const page = parseUrlPage(request.url);
  return adminTeams.listTeams(filters, page);
};

const options = ['name', 'createdAt', 'members', 'events'] as const;

export default function AdminTeamsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { results, filters, pagination, statistics } = loaderData;

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.teams')}</H1>

      <List>
        <List.Header className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Text weight="semibold">{t('admin.teams.total', { count: statistics.total })}</Text>
          <div className="flex gap-2">
            <Form method="GET">
              <Input
                name="query"
                icon={MagnifyingGlassIcon}
                defaultValue={filters.query}
                aria-label={t('admin.teams.search')}
                placeholder={t('admin.teams.search')}
                className="w-full sm:w-72"
              />
            </Form>
            <SortMenu
              options={options.map((value) => ({ value, name: t(`admin.teams.sort.${value}`) }))}
              defaultSort="createdAt"
              defaultOrder="desc"
            />
          </div>
        </List.Header>

        <List.Content aria-label={t('admin.nav.teams')}>
          {results.map((team) => (
            <List.Row key={team.id} className="flex justify-between items-center gap-4 p-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {team.name}
                </Text>
                <Text as="pre" size="xs" variant="secondary">
                  {team.slug}
                </Text>
              </div>
              <div className="flex gap-8">
                <IconLabel icon={UserGroupIcon} variant="secondary">
                  {team.members.count}
                </IconLabel>
                <IconLabel icon={CalendarIcon} variant="secondary">
                  {team.events.count}
                </IconLabel>
              </div>
            </List.Row>
          ))}
        </List.Content>

        <List.PaginationFooter current={pagination.current} pages={pagination.pages} total={statistics.total} />
      </List>
    </Page>
  );
}
