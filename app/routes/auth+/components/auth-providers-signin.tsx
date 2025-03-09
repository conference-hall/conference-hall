import * as Firebase from 'firebase/auth';
import { useCallback } from 'react';
import { Button } from '~/design-system/buttons.tsx';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { GoogleIcon } from '~/design-system/icons/google-icon.tsx';
import { XIcon } from '~/design-system/icons/x-icon.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { useHydrated } from '~/routes/components/utils/use-hydrated.ts';

const PROVIDERS = {
  google: { label: 'Google', icon: GoogleIcon },
  github: { label: 'GitHub', icon: GitHubIcon },
  x: { label: 'X.com', icon: XIcon },
} as const;

type AuthProvidersSigninProps = { redirectTo: string; withEmailPasswordSignin: boolean };

export function AuthProvidersSignin({ redirectTo, withEmailPasswordSignin }: AuthProvidersSigninProps) {
  const hydrated = useHydrated();

  const signIn = useCallback(
    (provider: string) => {
      // Set "from" in url to set loading state when redirected back from auth
      if (hydrated) {
        const { protocol, host } = window.location;
        const newurl = `${protocol}//${host}/auth/login?redirectTo=${redirectTo}&from=${provider}`;
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
      {Object.entries(PROVIDERS).map(([provider, { label, icon: Icon }]) => (
        <Button key={provider} type="button" onClick={() => signIn(provider)} variant="secondary" className="w-full">
          <Icon className="size-4" />
          {withEmailPasswordSignin ? `Continue with ${label}` : label}
        </Button>
      ))}
    </div>
  );
}
