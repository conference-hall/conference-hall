import { EnvelopeIcon } from '@heroicons/react/24/outline';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmit } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { PROVIDERS, type ProviderId, getClientAuth } from '~/libs/auth/firebase.ts';
import { EmailProviderSettings } from './email-provider-settings.tsx';
import { LinkProvider, UnlinkProvider } from './social-providers-settings..tsx';

type Props = { email: string; authLoaded: boolean };

export function AuthenticationMethods({ email, authLoaded }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const [error, setError] = useState<string>('');
  const { emailVerified = false, providerData = [] } = getClientAuth().currentUser ?? {};

  useEffect(() => {
    // Get error messages from the redirect result after linking a provider
    Firebase.getRedirectResult(getClientAuth()).catch((error) => setError(getFirebaseError(error, t)));
  }, [t]);

  const canUnlink = providerData.length > 1;
  const passwordProvider = providerData.find((p) => p.providerId === 'password');

  const onUnlink = async (providerId: ProviderId | 'password') => {
    const remainingEmails = providerData.filter((p) => p.providerId !== providerId).map(({ email }) => email);
    const newEmail = !remainingEmails.includes(email) ? remainingEmails[0] : '';
    await submit({ newEmail, intent: 'unlink-provider' }, { method: 'POST', navigate: true });
  };

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('settings.account.authentication-methods.heading')}</H2>
        <Subtitle>{t('settings.account.authentication-methods.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        {error ? (
          <Callout variant="error" role="alert">
            {error}
          </Callout>
        ) : null}

        <List>
          <List.Content aria-label={t('settings.account.authentication-methods.list')}>
            <ProviderItem
              label={t('settings.account.authentication-methods.password')}
              icon={EnvelopeIcon}
              email={
                passwordProvider?.email && !emailVerified
                  ? t('settings.account.authentication-methods.email-not-verified', { email: passwordProvider?.email })
                  : passwordProvider?.email
              }
              loading={!authLoaded}
            >
              <EmailProviderSettings
                passwordProvider={passwordProvider}
                emailVerified={emailVerified}
                canUnlink={canUnlink}
                onUnlink={onUnlink}
              />
            </ProviderItem>

            {PROVIDERS.map((provider) => {
              const userProvider = providerData.find((p) => p.providerId === provider.id);
              return (
                <ProviderItem
                  key={provider.id}
                  label={provider.label}
                  icon={provider.icon}
                  email={userProvider?.email}
                  loading={!authLoaded}
                >
                  {userProvider ? (
                    <UnlinkProvider providerId={provider.id} disabled={!canUnlink} onUnlink={onUnlink} />
                  ) : (
                    <LinkProvider providerId={provider.id} />
                  )}
                </ProviderItem>
              );
            })}
          </List.Content>
        </List>
      </Card.Content>
    </Card>
  );
}

type ProviderItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  email?: string | null;
  loading: boolean;
  children: React.ReactNode;
};

function ProviderItem({ icon: Icon, label, email, loading, children }: ProviderItemProps) {
  return (
    <List.Row className="flex-col sm:flex-row justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <div>
          <Text weight="semibold">{label}</Text>
          {email ? <Subtitle size="xs">{email}</Subtitle> : null}
        </div>
      </div>
      {!loading ? children : null}
    </List.Row>
  );
}
