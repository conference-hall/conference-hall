import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { TeamAccessRequests } from '~/features/team-management/creation/services/team-access-request.server.ts';
import { AuthorizedAdminContext } from '~/shared/authorization/authorization.middleware.ts';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { getSharedServerEnv } from '../../../../servers/environment.server.ts';
import type { Route } from './+types/requests.ts';
import { AdminRequests } from './services/admin-requests.server.ts';

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  const adminRequests = AdminRequests.for(admin);
  const status = url.searchParams.get('status') || 'PENDING';
  const page = parseUrlPage(url);
  return adminRequests.listRequests(status, page);
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  AdminRequests.for(admin);

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  const requestId = form.get('requestId') as string;

  const { APP_URL } = getSharedServerEnv();

  switch (intent) {
    case 'accept': {
      await TeamAccessRequests.accept(requestId, APP_URL);
      return toast('success', i18n.t('admin.requests.feedbacks.accepted'));
    }
    case 'reject': {
      await TeamAccessRequests.reject(requestId);
      return toast('success', i18n.t('admin.requests.feedbacks.rejected'));
    }
    default:
      return null;
  }
};

export default function AdminRequestsRoute({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { results, pagination, statistics } = loaderData;

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.requests')}</H1>

      <List>
        <List.Header className="flex items-center justify-between">
          <Text weight="semibold">{t('admin.requests.total', { count: statistics.total })}</Text>
        </List.Header>

        <List.Content aria-label={t('admin.nav.requests')}>
          {results.map((req) => (
            <List.Row key={req.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Text size="s" weight="medium" truncate>
                  {req.eventName}
                </Text>
                <Text size="xs" variant="secondary">
                  {req.email}
                </Text>
                <Text size="xs" variant="secondary">
                  {formatDatetime(new Date(req.createdAt), { format: 'short', locale })}
                </Text>
              </div>

              <div className="flex items-center gap-3">
                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Form method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <Button
                        type="submit"
                        name="intent"
                        value="accept"
                        variant="secondary"
                        size="sm"
                        iconLeft={CheckIcon}
                      >
                        {t('admin.requests.accept')}
                      </Button>
                    </Form>
                    <Form method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <Button
                        type="submit"
                        name="intent"
                        value="reject"
                        variant="secondary"
                        size="sm"
                        iconLeft={XMarkIcon}
                      >
                        {t('admin.requests.reject')}
                      </Button>
                    </Form>
                  </div>
                )}
              </div>
            </List.Row>
          ))}
        </List.Content>

        <List.PaginationFooter current={pagination.current} pages={pagination.pages} total={statistics.total} />
      </List>
    </Page>
  );
}
