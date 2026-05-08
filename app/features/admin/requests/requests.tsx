import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form, useSearchParams } from 'react-router';
import { BadgeDot } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/button.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { TeamAccessRequests } from '~/features/team-management/creation/services/team-access-request.server.ts';
import { AuthorizedAdminContext } from '~/shared/authorization/authorization.middleware.ts';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/requests.ts';

const STATUS_OPTIONS = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_BADGE_COLORS: Record<Status, 'yellow' | 'green' | 'red'> = {
  PENDING: 'yellow',
  ACCEPTED: 'green',
  REJECTED: 'red',
};

const STATUS_I18N_KEYS = {
  PENDING: 'admin.requests.status.pending',
  ACCEPTED: 'admin.requests.status.accepted',
  REJECTED: 'admin.requests.status.rejected',
} as const;

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  if (!admin) throw new NotAuthorizedError();
  const status = (url.searchParams.get('status') as Status) || 'PENDING';
  const page = parseUrlPage(url);
  return TeamAccessRequests.listRequests(status, page);
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const admin = context.get(AuthorizedAdminContext);
  if (!admin) throw new NotAuthorizedError();

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  const requestId = form.get('requestId') as string;

  switch (intent) {
    case 'accept': {
      await TeamAccessRequests.accept(requestId);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, pagination, statistics, filters } = loaderData;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', e.target.value);
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.requests')}</H1>

      <List>
        <List.Header className="flex items-center justify-between">
          <Text weight="semibold">{t('admin.requests.total', { count: statistics.total })}</Text>
          <SelectNative
            name="status"
            label={t('admin.requests.filter-status')}
            srOnly
            options={STATUS_OPTIONS.map((s) => ({ value: s, name: t(STATUS_I18N_KEYS[s]) }))}
            value={filters.status}
            onChange={handleStatusChange}
          />
        </List.Header>

        <List.Content aria-label={t('admin.nav.requests')}>
          {results.map((req) => (
            <List.Row key={req.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Text size="s" weight="medium" truncate>
                  {req.eventName}
                </Text>
                <div className="flex items-center gap-2">
                  <Text size="xs" variant="secondary">
                    {req.email} •
                  </Text>
                  <Text size="xs" variant="secondary">
                    <ClientOnly>{() => formatDatetime(req.createdAt, { format: 'short', locale })}</ClientOnly> •
                  </Text>
                  <BadgeDot color={STATUS_BADGE_COLORS[req.status]} compact pill>
                    {t(STATUS_I18N_KEYS[req.status])}
                  </BadgeDot>
                </div>
              </div>

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
            </List.Row>
          ))}
        </List.Content>

        <List.PaginationFooter current={pagination.current} pages={pagination.pages} total={statistics.total} />
      </List>
    </Page>
  );
}
