import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { authClient, getAuthError, PROVIDERS } from '~/shared/better-auth/auth-client.ts';

type Account = { providerId: string; accountId: string };
type Props = { accounts: Array<Account> };

export function SocialAccountsSection({ accounts }: Props) {
  const { t } = useTranslation();
  const canUnlink = accounts.length > 1;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('settings.account.authentication-methods.heading')}</H2>
        <Subtitle>{t('settings.account.authentication-methods.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <List>
          <List.Content aria-label={t('settings.account.authentication-methods.list')}>
            {PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const providerAccounts = accounts.filter((p) => p.providerId === provider.id);

              if (providerAccounts.length > 0) {
                return providerAccounts.map((account) => (
                  <List.Row key={account.accountId} className="min-h-16 flex-col justify-between gap-4 p-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <Text weight="semibold">{provider.label}</Text>
                      <UserInfo account={account} />
                    </div>
                    {canUnlink ? <UnlinkProvider account={account} /> : null}
                  </List.Row>
                ));
              } else {
                return (
                  <List.Row key={provider.id} className="min-h-16 flex-col justify-between gap-4 p-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <Text weight="semibold">{provider.label}</Text>
                    </div>
                    <LinkProvider provider={provider.id} />
                  </List.Row>
                );
              }
            })}
          </List.Content>
        </List>
      </Card.Content>
    </Card>
  );
}

type LinkProviderProps = { provider: string };

function LinkProvider({ provider }: LinkProviderProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const linkProvider = async () => {
    setLoading(true);
    const callbackURL = href('/speaker/settings');
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL,
      errorCallbackURL: `/auth/error?redirectTo=${encodeURIComponent(callbackURL)}`,
    });
    if (error) {
      toast.error(t(getAuthError(error)));
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={linkProvider} size="sm" loading={loading}>
      {t('common.add')}
    </Button>
  );
}

type UnlinkProviderProps = { account: Account };

function UnlinkProvider({ account }: UnlinkProviderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const unlinkProvider = async () => {
    const confirm = window.confirm(t('settings.account.authentication-methods.confirm-unlink'));
    if (!confirm) return;

    setLoading(true);
    const { error } = await authClient.unlinkAccount(account);
    if (error) {
      toast.error(t(getAuthError(error)));
      setLoading(false);
    } else {
      await navigate('/speaker/settings');
    }
  };

  return (
    <Button type="button" variant="important" onClick={unlinkProvider} loading={loading} size="sm">
      {t('common.delete')}
    </Button>
  );
}

type UserInfoProps = { account: Account };

// todo(auth): add placeholder when fetching
function UserInfo({ account }: UserInfoProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    authClient.accountInfo({ query: { accountId: account.accountId } }).then(({ data, error }) => {
      if (error) return;
      setEmail(data.user.email || null);
    });
  }, [account.accountId]);

  if (!email) return null;

  return <Subtitle>{email}</Subtitle>;
}
