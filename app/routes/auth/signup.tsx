import { useTranslation } from 'react-i18next';
import { redirect, useSearchParams } from 'react-router';
import { getUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { DividerWithLabel } from '~/shared/design-system/divider.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { Link } from '~/shared/design-system/links.tsx';
import { ConferenceHallLogo } from '~/shared/design-system/logo.tsx';
import { Subtitle } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/signup.ts';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { EmailPasswordSignup } from './components/email-password-signup.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Signup | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');
  return null;
};

export default function Signup() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email');
  const redirectTo = searchParams.get('redirectTo') || '/';

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {t('auth.common.sign-up')}
        </h2>
      </header>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        <EmailPasswordSignup redirectTo={redirectTo} defaultEmail={defaultEmail} />

        <DividerWithLabel label={t('common.or')} />

        <AuthProvidersSignin redirectTo={redirectTo} />
      </Card>

      <footer className="flex justify-center gap-2 my-8">
        <Subtitle>{t('auth.signup.has-account')}</Subtitle>
        <Link to={{ pathname: '/auth/login', search: `${searchParams}` }} weight="semibold">
          {t('auth.common.sign-in')}
        </Link>
      </footer>
    </Page>
  );
}
