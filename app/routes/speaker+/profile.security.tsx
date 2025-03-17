import { EnvelopeIcon } from '@heroicons/react/24/outline';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { redirect } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H1, H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { PROVIDERS, type ProviderId, getClientAuth } from '~/libs/auth/firebase.ts';
import { requireSession, sendEmailVerification } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/profile.security.ts';
import { EmailProviderSettings } from './components/security/email-provider-settings.tsx';
import { LinkProvider, UnlinkProvider } from './components/security/social-providers-settings..tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Security | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  if (!withEmailPasswordSignin) return redirect('/speaker/profile');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  if (intent === 'verify-email') {
    await sendEmailVerification(request);
    return toast('success', 'Verification email sent');
  }
};

export default function SecurityRoute() {
  const [error, setError] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [currentProviders, setCurrentProviders] = useState<Firebase.UserInfo[]>([]);

  useEffect(() => {
    // Get error messages from the redirect result after linking a provider
    Firebase.getRedirectResult(getClientAuth()).catch((error) => setError(getFirebaseError(error)));
    // Listen to auth state changes to update the list of providers
    Firebase.onAuthStateChanged(getClientAuth(), (user) => {
      if (!user) return;
      setEmailVerified(user.emailVerified);
      setCurrentProviders(user.providerData);
    });
  }, []);

  const loading = currentProviders.length === 0;
  const canUnlink = currentProviders.length > 1;
  const passwordProvider = currentProviders.find((p) => p.providerId === 'password');

  const removeProvider = (providerId: ProviderId | 'password') => {
    setCurrentProviders((providers) => providers.filter((p) => p.providerId !== providerId));
  };

  return (
    <div className="space-y-4 lg:space-y-6 lg:col-span-9">
      <H1 srOnly>Security</H1>

      <Card as="section">
        <Card.Title>
          <H2>Authentication methods</H2>
          <Subtitle>Connect with your favorite providers</Subtitle>
        </Card.Title>

        <Card.Content>
          {error ? (
            <Callout variant="error" role="alert">
              {error}
            </Callout>
          ) : null}

          <List>
            <List.Content aria-label="Authentication methods list">
              <ProviderItem
                label="Email & password"
                icon={EnvelopeIcon}
                email={
                  passwordProvider?.email && !emailVerified
                    ? `${passwordProvider?.email} • ⚠️ Not verified`
                    : passwordProvider?.email
                }
                loading={loading}
              >
                <EmailProviderSettings
                  passwordProvider={passwordProvider}
                  emailVerified={emailVerified}
                  canUnlink={canUnlink}
                  onUnlink={removeProvider}
                />
              </ProviderItem>

              {PROVIDERS.map((provider) => {
                const userProvider = currentProviders.find((p) => p.providerId === provider.id);
                return (
                  <ProviderItem
                    key={provider.id}
                    label={provider.label}
                    icon={provider.icon}
                    email={userProvider?.email}
                    loading={loading}
                  >
                    {userProvider ? (
                      <UnlinkProvider providerId={provider.id} disabled={!canUnlink} onUnlink={removeProvider} />
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
    </div>
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
