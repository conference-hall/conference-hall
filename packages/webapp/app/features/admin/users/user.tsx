import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { DeleteModalButton } from '~/design-system/dialogs/delete-modal.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, H2, H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/user.ts';
import { AdminUsers } from './services/admin-users.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const adminUsers = await AdminUsers.for(userId);
  return adminUsers.getUserInfo(params.user);
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'delete-user': {
      const adminUsers = await AdminUsers.for(userId);
      await adminUsers.deleteUser(params.user);
      return toast('success', i18n.t('admin.users.page.feedbacks.deleted'));
    }
    default:
      return null;
  }
};

export default function AdminUserRoute({ loaderData: user }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <Page className="space-y-6">
      <Link to="/admin/users" iconLeft={ChevronLeftIcon}>
        {t('common.go-back')}
      </Link>

      <Card className="divide-y divide-gray-100">
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <H1>{user.name}</H1>
            <Subtitle>{user.email}</Subtitle>
          </div>
          {!user.deletedAt && (
            <DeleteModalButton
              intent="delete-user"
              title={t('admin.users.page.delete-user.button')}
              description={t('admin.users.page.delete-user.modal.description')}
              confirmationText={t('admin.users.page.delete-user.confirmation-text')}
            />
          )}
        </div>
        <dl className="divide-y divide-gray-100">
          <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
            <Text as="dt" size="s" weight="medium">
              {t('admin.users.page.talks-count')}
            </Text>
            <Text as="dd" variant="secondary" className="col-span-3">
              {user.talksCount}
            </Text>
          </div>
          <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
            <Text as="dt" size="s" weight="medium">
              {t('admin.users.page.terms-accepted')}
            </Text>
            <Text as="dd" variant="secondary" className="col-span-3">
              {user.termsAccepted ? t('common.yes') : t('common.no')}
            </Text>
          </div>
          <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
            <Text as="dt" size="s" weight="medium">
              {t('admin.users.page.email-verified')}
            </Text>
            <Text as="dd" variant="secondary" className="col-span-3">
              {user.emailVerified ? t('common.yes') : t('common.no')}
            </Text>
          </div>
          {user.lastSignInAt ? (
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                {t('admin.users.page.last-signed-in')}
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {formatDatetime(user.lastSignInAt, { format: 'short', locale })}
              </Text>
            </div>
          ) : null}
          <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
            <Text as="dt" size="s" weight="medium">
              {t('common.created-at')}
            </Text>
            <Text as="dd" variant="secondary" className="col-span-3">
              {formatDatetime(user.createdAt, { format: 'short', locale })}
            </Text>
          </div>
          <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
            <Text as="dt" size="s" weight="medium">
              {t('common.updated-at')}
            </Text>
            <Text as="dd" variant="secondary" className="col-span-3">
              {formatDatetime(user.updatedAt, { format: 'short', locale })}
            </Text>
          </div>
          {user.deletedAt ? (
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-6 py-3">
              <Text as="dt" size="s" weight="medium">
                {t('admin.users.page.deleted-at')}
              </Text>
              <Text as="dd" variant="secondary" className="col-span-3">
                {formatDatetime(user.deletedAt, { format: 'short', locale })}
              </Text>
            </div>
          ) : null}
        </dl>
      </Card>

      <List>
        <List.Header>
          <H2 size="s">{t('admin.users.page.authentication-methods')}</H2>
          <Subtitle size="xs">{user.uid}</Subtitle>
        </List.Header>
        <List.Content aria-label={t('admin.users.page.authentication-methods')}>
          {user.authenticationMethods.map((methods) => (
            <List.Row key={methods.provider} className="py-4 px-6 flex items-center gap-2">
              <H3>{methods.provider}</H3>
              <Subtitle size="xs">{methods.email}</Subtitle>
            </List.Row>
          ))}
        </List.Content>
      </List>

      <List>
        <List.Header>
          <H2 size="s">{t('admin.users.page.teams-membership')}</H2>
        </List.Header>
        <List.Content aria-label={t('admin.users.page.teams-membership')}>
          {user.teams.map((team) => (
            <List.Row key={team.slug} className="py-4 px-6 flex justify-between items-center">
              <div className="sm:flex gap-4 items-baseline">
                <H3>{team.name}</H3>
                <Subtitle size="xs">{team.role}</Subtitle>
              </div>
              <Text variant="secondary">{formatDatetime(team.createdAt, { format: 'short', locale })}</Text>
            </List.Row>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
