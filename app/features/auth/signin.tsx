import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Callout } from '~/design-system/callout.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { getCaptchaSiteKey } from '~/shared/authentication/captcha.server.ts';
import { createSession } from '~/shared/authentication/session.ts';
import type { Route } from './+types/signin.ts';
import { AuthProvidersResult } from './components/auth-providers-result.tsx';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { EmailPasswordSignin } from './components/email-password-signin.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Login | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(OptionalAuthContext);
  if (user) return redirect('/');

  const captchaSiteKey = await getCaptchaSiteKey();
  return { captchaSiteKey };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  return createSession(request, context);
};

export default function Signin({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { captchaSiteKey } = loaderData;
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
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center font-bold text-2xl text-gray-900 leading-9 tracking-tight">
          {t('auth.signin.heading')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <EmailPasswordSignin redirectTo={redirectTo} defaultEmail={defaultEmail} captchaSiteKey={captchaSiteKey} />

        <DividerWithLabel label={t('common.or')} />

        <AuthProvidersSignin redirectTo={redirectTo} />

        {providerError ? (
          <Callout variant="error" role="alert">
            {providerError}
          </Callout>
        ) : null}
      </Card>

      <footer className="my-8 flex justify-center gap-2">
        <Subtitle>{t('auth.signin.no-account')}</Subtitle>
        <Link to={{ pathname: '/auth/signup', search: `${searchParams}` }} weight="semibold">
          {t('auth.common.sign-up')}
        </Link>
      </footer>
    </Page>
  );
}
