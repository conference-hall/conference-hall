import { useCallback, useEffect, useState } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { createSession, getSessionUserId } from '~/libs/auth/session';
import { getClientAuth } from '~/libs/auth/firebase';
import { useHydrated } from 'remix-utils';
import { LoadingIcon } from '~/design-system/icons/LoadingIcon';
import { Logo } from '~/components/navbar/Logo';
import { Card } from '~/design-system/layouts/Card';
import { AuthProviderButton } from '~/components/AuthProviderButton';
import { AlertError } from '~/design-system/Alerts';
import { Link } from '~/design-system/Links';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  return createSession(request);
};

export default function Login() {
  const hydrated = useHydrated();
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const loading = searchParams.get('loading');
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { submit } = useFetcher();

  useEffect(() => {
    const clientAuth = getClientAuth();
    getRedirectResult(clientAuth)
      .then(async (credentials) => {
        if (!credentials) return;
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'post', action: '/login' });
      })
      .catch((error) => setError(error.message));
  }, [submit, redirectTo]);

  const signIn = useCallback(
    async (provider: string) => {
      // Set loading status in url to get it when redirected back from auth
      if (hydrated) {
        const { protocol, host, pathname } = window.location;
        const newurl = `${protocol}//${host}${pathname}?redirectTo=${redirectTo}&loading=true`;
        window.history.pushState({ path: newurl }, '', newurl);
      }

      let authProvider;
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
        authProvider.setCustomParameters({ prompt: 'select_account' });
      } else if (provider === 'twitter') {
        authProvider = new TwitterAuthProvider();
      } else if (provider === 'github') {
        authProvider = new GithubAuthProvider();
      }

      if (!authProvider) return;
      await signInWithRedirect(getClientAuth(), authProvider);
    },
    [hydrated, redirectTo]
  );

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md">
          <Logo />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          {loading && !error ? (
            <div className="mt-2 flex flex-col items-center gap-12">
              <LoadingIcon className="h-10 w-10" />
              <Link to="/login">Go back to login</Link>
            </div>
          ) : (
            <>
              <Card p={12}>
                <div>
                  {error && <AlertError className="mb-8">{error}</AlertError>}

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
                    <AuthProviderButton provider="twitter" onClick={signIn} />
                    <AuthProviderButton provider="github" onClick={signIn} />
                  </div>
                </div>
              </Card>
              <p className="mt-10 text-center text-sm text-gray-500">
                &copy; 2023 Conference Hall. All rights reserved.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
