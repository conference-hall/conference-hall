import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import {
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  TwitterAuthProvider,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

import { Callout } from '~/design-system/callout.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { createSession, getSessionUserId } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { AuthProviderButton } from '~/routes/__components/auth-provider-button.tsx';

import { FullscreenPage } from '../__components/fullscreen-page.tsx';
import { useHydrated } from '../__components/utils/use-hydrated.ts';

export const meta = mergeMeta(() => [{ title: 'Login | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');
  return json(null);
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
    getRedirectResult(clientAuth)
      .then(async (credentials) => {
        if (!credentials) return;
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
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
    [hydrated, redirectTo],
  );

  return (
    <FullscreenPage navbar="auth">
      <div className="flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md">
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
                  <AuthProviderButton provider="twitter" onClick={signIn} />
                  <AuthProviderButton provider="github" onClick={signIn} />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </FullscreenPage>
  );
}
