import * as Firebase from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { redirect } from 'react-router';
import { useFetcher, useSearchParams } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { createSession, getSessionUserId } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { type AuthProvider, AuthProviderButton } from '~/routes/components/auth-provider-button.tsx';
import { Footer } from '../components/footer.tsx';
import { useHydrated } from '../components/utils/use-hydrated.ts';
import type { Route } from './+types/login.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Login | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  return createSession(request);
};

export default function Login() {
  const hydrated = useHydrated();
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const loading = searchParams.get('loading');
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { submit } = useFetcher<typeof action>();

  useEffect(() => {
    const clientAuth = getClientAuth();
    Firebase.getRedirectResult(clientAuth)
      .then(async (credentials) => {
        if (!credentials) return;
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
      })
      .catch((error) => setError(error.message));
  }, [submit, redirectTo]);

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      // Set loading state in url to get it when redirected back from auth
      if (hydrated) {
        const { protocol, host, pathname } = window.location;
        const newurl = `${protocol}//${host}${pathname}?redirectTo=${redirectTo}&loading=true`;
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
    <Page>
      <div className="flex flex-col items-center pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        {loading && !error ? (
          <div className="mt-2 flex flex-col items-center gap-12">
            <LoadingIcon className="h-10 w-10" />
            <Link to="/auth/login">Go back to login</Link>
          </div>
        ) : (
          <>
            <Card p={16}>
              <div>
                {error && (
                  <Callout title="Error" variant="error" className="mb-8">
                    {error}
                  </Callout>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-900">Continue with</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <AuthProviderButton provider="google" onClick={signIn} />
                  <AuthProviderButton provider="github" onClick={signIn} />
                  <AuthProviderButton provider="x" onClick={signIn} />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </Page>
  );
}
