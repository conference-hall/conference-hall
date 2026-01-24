import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { authClient, PROVIDERS, type ProviderId } from '~/shared/better-auth/auth-client.ts';

type AuthProvidersSigninProps = { redirectTo: string };

export function AuthProvidersSignin({ redirectTo }: AuthProvidersSigninProps) {
  const { t } = useTranslation();

  const signIn = async (provider: ProviderId) => {
    await authClient.signIn.social({ provider, callbackURL: redirectTo, errorCallbackURL: href('/auth/error') });
  };

  return (
    <div className="flex flex-col gap-4">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button key={id} type="button" onClick={() => signIn(id)} iconLeft={Icon} variant="secondary">
          {t('auth.signin.auth-provider', { label })}
        </Button>
      ))}
    </div>
  );
}
