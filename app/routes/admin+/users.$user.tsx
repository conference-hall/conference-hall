import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import invariant from 'tiny-invariant';
import { AdminUsers } from '~/.server/admin/admin-users.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, H2, H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.user);

  const adminUsers = await AdminUsers.for(userId);

  return adminUsers.getUserInfo(params.user);
};

export default function AdminUserRoute() {
  const user = useLoaderData<typeof loader>();

  return (
    <Page className="space-y-6">
      <Link to="/admin" iconLeft={ChevronLeftIcon}>
        Go back
      </Link>

      <Card>
        <div className="px-6 py-4">
          <H1>{user.name}</H1>
          <Subtitle>{user.email}</Subtitle>
        </div>
        <div className="border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                Email verified
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {user.emailVerified ? 'Yes' : 'No'}
              </Text>
            </div>
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                Terms accepted
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {user.termsAccepted ? 'Yes' : 'No'}
              </Text>
            </div>
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                Created at
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {format(user.createdAt, DATETIME_FORMAT)}
              </Text>
            </div>
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                Updated at
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {format(user.updatedAt, DATETIME_FORMAT)}
              </Text>
            </div>
          </dl>
        </div>
      </Card>

      <List>
        <List.Header>
          <H2 size="s">{`Authentication methods (${user.authenticationMethods.length})`}</H2>
        </List.Header>
        <List.Content aria-label="Authentication methods list">
          {user.authenticationMethods.map((methods) => (
            <List.Row key={methods.uid} className="py-4 px-6 flex justify-between items-center">
              <div className="sm:flex gap-4 items-baseline">
                <H3>{methods.provider}</H3>
                <Subtitle size="xs">{methods.email}</Subtitle>
                <Subtitle size="xs">{methods.uid}</Subtitle>
              </div>
              <Text variant="secondary">{format(methods.createdAt, DATETIME_FORMAT)}</Text>
            </List.Row>
          ))}
        </List.Content>
      </List>

      <List>
        <List.Header>
          <H2 size="s">{`Teams membership (${user.teams.length})`}</H2>
        </List.Header>
        <List.Content aria-label="Teams list">
          {user.teams.map((team) => (
            <List.Row key={team.slug} className="py-4 px-6 flex justify-between items-center">
              <div className="sm:flex gap-4 items-baseline">
                <H3>{team.name}</H3>
                <Subtitle size="xs">{team.role}</Subtitle>
              </div>
              <Text variant="secondary">{format(team.updatedAt, DATETIME_FORMAT)}</Text>
            </List.Row>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
