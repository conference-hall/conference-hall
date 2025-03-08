import * as Firebase from 'firebase/auth';
import { useCallback } from 'react';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { type AuthProvider, AuthProviderButton } from '~/routes/auth+/components/auth-provider-button.tsx';
import { useHydrated } from '~/routes/components/utils/use-hydrated.ts';

type AuthProvidersSigninProps = { redirectTo: string };

export function AuthProvidersSignin({ redirectTo }: AuthProvidersSigninProps) {
  const hydrated = useHydrated();

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      // Set "from" in url to set loading state when redirected back from auth
      if (hydrated) {
        const { protocol, host, pathname } = window.location;
        const newurl = `${protocol}//${host}${pathname}?redirectTo=${redirectTo}&from=${provider}`;
        window.history.pushState({ path: newurl }, '', newurl);
      }

      if (provider === 'google') {
        const authProvider = new Firebase.GoogleAuthProvider();
        authProvider.setCustomParameters({ prompt: 'select_account' });
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }

      if (provider === 'x') {
        const authProvider = new Firebase.TwitterAuthProvider();
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }

      if (provider === 'github') {
        const authProvider = new Firebase.GithubAuthProvider();
        return Firebase.signInWithRedirect(getClientAuth(), authProvider);
      }
    },
    [hydrated, redirectTo],
  );

  return (
    <div className="flex flex-col gap-4">
      <AuthProviderButton provider="google" onClick={signIn} />
      <AuthProviderButton provider="github" onClick={signIn} />
      <AuthProviderButton provider="x" onClick={signIn} />
    </div>
  );
}
