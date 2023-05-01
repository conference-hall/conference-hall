import { useCallback, useEffect } from 'react';
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
import { Logo } from '~/shared-components/navbar/Logo';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon';
import { GoogleIcon } from '~/design-system/icons/GoogleIcon';
import { Card } from '~/design-system/layouts/Card';

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
      .catch((error) => {
        // TODO: Handle errors
        console.error(error);
      });
  }, [submit, redirectTo]);

  const signIn = useCallback(
    (provider: string) => {
      if (hydrated) {
        // Set loading status in url to get it when redirected back from auth
        const { protocol, host, pathname } = window.location;
        const newurl = `${protocol}//${host}${pathname}?redirectTo=${redirectTo}&loading=true`;
        window.history.pushState({ path: newurl }, '', newurl);
      }

      const clientAuth = getClientAuth();
      switch (provider) {
        case 'google':
          return signInWithRedirect(clientAuth, new GoogleAuthProvider());
        case 'twitter':
          return signInWithRedirect(clientAuth, new TwitterAuthProvider());
        case 'github':
          return signInWithRedirect(clientAuth, new GithubAuthProvider());
      }
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
          {loading ? (
            <div className="mt-2 flex justify-center">
              <LoadingIcon className="h-10 w-10" />
            </div>
          ) : (
            <>
              <Card p={12}>
                <div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-gray-900">Continue with</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <button
                      type="button"
                      onClick={() => signIn('google')}
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#EA2533] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA2533]"
                    >
                      <GoogleIcon className="h-5 w-5" />
                      <span className="text-sm font-semibold leading-6">Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => signIn('twitter')}
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#1D9BF0] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
                    >
                      <TwitterIcon className="h-5 w-5" />
                      <span className="text-sm font-semibold leading-6">Twitter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => signIn('github')}
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >
                      <GitHubIcon className="h-5 w-5" />
                      <span className="text-sm font-semibold leading-6">GitHub</span>
                    </button>
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
