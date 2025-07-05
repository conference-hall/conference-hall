import * as Firebase from 'firebase/auth';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '~/routes/components/utils/use-hydrated.ts';
import { getClientAuth, PROVIDERS, type ProviderId } from '~/shared/auth/firebase.ts';
import { Button } from '~/shared/design-system/buttons.tsx';

type AuthProvidersSigninProps = { redirectTo: string };

export function AuthProvidersSignin({ redirectTo }: AuthProvidersSigninProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();

  const signIn = useCallback(
    (provider: ProviderId) => {
      // Set "from" in url to set loading state when redirected back from auth
      if (hydrated) {
        const { protocol, host } = window.location;
        const newurl = `${protocol}//${host}/auth/login?redirectTo=${redirectTo}&from=${provider}`;
        window.history.pushState({ path: newurl }, '', newurl);
      }

      if (provider === 'google.com') {
        const authProvider = new Firebase.GoogleAuthProvider();
        authProvider.setCustomParameters({ prompt: 'select_account' });
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }

      if (provider === 'github.com') {
        const authProvider = new Firebase.GithubAuthProvider();
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }

      if (provider === 'twitter.com') {
        const authProvider = new Firebase.TwitterAuthProvider();
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }
    },
    [hydrated, redirectTo],
  );

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
