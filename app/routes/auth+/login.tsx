import { useState } from 'react';
import { redirect } from 'react-router';
import { useSearchParams } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { createSession, getSessionUserId } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/login.ts';
import { AuthProvidersResult } from './components/auth-providers-result.tsx';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { EmailPasswordSignin } from './components/email-password-signin.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Login | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');

  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  return { withEmailPasswordSignin };
};

export const action = async ({ request }: Route.ActionArgs) => {
  return createSession(request);
};

export default function Login({ loaderData }: Route.ComponentProps) {
  const { withEmailPasswordSignin } = loaderData;

  const [providerError, setProviderError] = useState<string>('');
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email');
  const fromProvider = searchParams.get('from');
  const redirectTo = searchParams.get('redirectTo') || '/';

  if (fromProvider && !providerError) {
    return <AuthProvidersResult redirectTo={redirectTo} setError={setProviderError} />;
  }

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </header>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        {withEmailPasswordSignin ? <EmailPasswordSignin redirectTo={redirectTo} defaultEmail={defaultEmail} /> : null}

        <DividerWithLabel label={withEmailPasswordSignin ? 'Or' : 'Continue with'} />

        <AuthProvidersSignin redirectTo={redirectTo} withEmailPasswordSignin={withEmailPasswordSignin} />

        {providerError ? (
          <Callout variant="error" role="alert">
            {providerError}
          </Callout>
        ) : null}
      </Card>

      {withEmailPasswordSignin ? (
        <footer className="flex justify-center gap-2 my-8">
          <Subtitle>Don't have an account?</Subtitle>
          <Link to={{ pathname: '/auth/signup', search: `${searchParams}` }} weight="semibold">
            Create your account
          </Link>
        </footer>
      ) : null}
    </Page>
  );
}
