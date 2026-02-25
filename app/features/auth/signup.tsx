import { useTranslation } from 'react-i18next';
import { redirect, useNavigate, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import type { Route } from './+types/signup.ts';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { SignupForm } from './components/signup-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Signup | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(OptionalAuthContext);
  if (user) return redirect('/');

  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { captchaSiteKey: CAPTCHA_SITE_KEY };
};

export default function Signup({ loaderData }: Route.ComponentProps) {
  const { captchaSiteKey } = loaderData;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirectTo') || '/';

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('auth.common.sign-up')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <SignupForm
          defaultEmail={defaultEmail}
          captchaSiteKey={captchaSiteKey}
          onSuccess={() => navigate('/auth/email-verification')}
        />

        <DividerWithLabel label={t('common.or')} />

        <AuthProvidersSignin redirectTo={redirectTo} />
      </Card>

      <footer className="my-8 flex justify-center gap-2">
        <Subtitle>{t('auth.signup.has-account')}</Subtitle>
        <Link to={{ pathname: '/auth/login', search: `${searchParams}` }} weight="semibold">
          {t('auth.common.sign-in')}
        </Link>
      </footer>
    </Page>
  );
}
