import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect, useSearchParams } from 'react-router';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { createSession, getUserSession } from '~/shared/auth/session.ts';
import { Callout } from '~/shared/design-system/callout.tsx';
import { DividerWithLabel } from '~/shared/design-system/divider.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { Link } from '~/shared/design-system/links.tsx';
import { ConferenceHallLogo } from '~/shared/design-system/logo.tsx';
import { Subtitle } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/signin.ts';
import { AuthProvidersResult } from './components/auth-providers-result.tsx';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { EmailPasswordSignin } from './components/email-password-signin.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Login | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  return createSession(request);
};

export default function Signin() {
  const { t } = useTranslation();
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
          {t('auth.signin.heading')}
        </h2>
      </header>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        <EmailPasswordSignin redirectTo={redirectTo} defaultEmail={defaultEmail} />

        <DividerWithLabel label={t('common.or')} />

        <AuthProvidersSignin redirectTo={redirectTo} />

        {providerError ? (
          <Callout variant="error" role="alert">
            {providerError}
          </Callout>
        ) : null}
      </Card>

      <footer className="flex justify-center gap-2 my-8">
        <Subtitle>{t('auth.signin.no-account')}</Subtitle>
        <Link to={{ pathname: '/auth/signup', search: `${searchParams}` }} weight="semibold">
          {t('auth.common.sign-up')}
        </Link>
      </footer>
    </Page>
  );
}
