import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { AuthorizedAdminContext } from '~/shared/authorization/authorization.middleware.ts';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import type { Route } from './+types/requests.ts';
import { AdminRequests } from './services/admin-requests.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  const adminRequests = AdminRequests.for(admin);
  return { requests: await adminRequests.listRequests() };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  const adminRequests = AdminRequests.for(admin);
  const form = await request.formData();
  const intent = form.get('intent');
  const id = String(form.get('id'));

  if (intent === 'accept') {
    await adminRequests.acceptRequest(id);
  } else if (intent === 'deny') {
    await adminRequests.denyRequest(id);
  }

  return null;
};

export default function AdminRequestsRoute({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const { requests } = loaderData;

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.requests')}</H1>

      <List>
        <List.Header>
          <Text weight="semibold">{t('admin.requests.total', { count: requests.length })}</Text>
        </List.Header>

        <List.Content aria-label={t('admin.nav.requests')}>
          {requests.length === 0 ? (
            <li className="p-8 text-center">
              <Text variant="secondary">{t('admin.requests.empty')}</Text>
            </li>
          ) : null}

          {requests.map((req) => (
            <List.Row key={req.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Text size="xs" weight="medium" truncate>
                  {req.eventName}
                </Text>
                <Text size="xs" variant="secondary">
                  {req.email}
                </Text>
                <Text size="xs" variant="secondary">
                  {formatDate(req.createdAt, { format: 'medium', locale: i18n.language })}
                </Text>
              </div>
              <div className="flex gap-2">
                <Form method="POST">
                  <input type="hidden" name="id" value={req.id} />
                  <Button type="submit" name="intent" value="accept" variant="secondary" size="xs" iconLeft={CheckIcon}>
                    {t('admin.requests.accept')}
                  </Button>
                </Form>
                <Form method="POST">
                  <input type="hidden" name="id" value={req.id} />
                  <Button type="submit" name="intent" value="deny" variant="secondary" size="xs" iconLeft={XMarkIcon}>
                    {t('admin.requests.deny')}
                  </Button>
                </Form>
              </div>
            </List.Row>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
