import * as Firebase from 'firebase/auth';
import { useCallback } from 'react';
import { Button } from '~/design-system/buttons.tsx';
import { PROVIDERS, type ProviderId, getClientAuth } from '~/libs/auth/firebase.ts';
import { useHydrated } from '~/routes/components/utils/use-hydrated.ts';

type AuthProvidersSigninProps = { redirectTo: string };

export function AuthProvidersSignin({ redirectTo }: AuthProvidersSigninProps) {
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
        <Button key={id} type="button" onClick={() => signIn(id)} variant="secondary" className="w-full">
          <Icon className="size-4" />
          {`Continue with ${label}`}
        </Button>
      ))}
    </div>
  );
}
