import { parseWithZod } from '@conform-to/zod';
import { CalendarIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { Form } from 'react-router';
import { AdminTeams, TeamsSearchFiltersSchema } from '~/.server/admin/admin-teams.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { Input } from '~/design-system/forms/input.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SortMenu } from '~/design-system/list/sort-menu.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import type { Route } from './+types/teams.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const adminTeams = await AdminTeams.for(userId);
  const { searchParams } = new URL(request.url);
  const result = parseWithZod(searchParams, { schema: TeamsSearchFiltersSchema });
  const filters = result.status === 'success' ? result.value : {};
  const page = parseUrlPage(request.url);
  return adminTeams.listTeams(filters, page);
};

const options = [
  { name: 'Name', value: 'name' },
  { name: 'Creation date', value: 'createdAt' },
  { name: 'Members', value: 'members' },
  { name: 'Events', value: 'events' },
];

export default function AdminTeamsRoute({ loaderData }: Route.ComponentProps) {
  const { results, filters, pagination, statistics } = loaderData;

  return (
    <Page>
      <H1 srOnly>Teams</H1>

      <List>
        <List.Header className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Text weight="semibold">{`${statistics.total} teams`}</Text>
          <div className="flex gap-2">
            <Form method="GET">
              <Input
                name="query"
                icon={MagnifyingGlassIcon}
                defaultValue={filters.query}
                aria-label="Search by name"
                placeholder="Search by name"
                className="w-full sm:w-72"
              />
            </Form>
            <SortMenu options={options} defaultSort="createdAt" defaultOrder="desc" />
          </div>
        </List.Header>

        <List.Content aria-label="Teams list">
          {results.map((team) => (
            <List.Row key={team.id} className="flex justify-between items-center gap-4 px-4 py-4 sm:px-6">
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
