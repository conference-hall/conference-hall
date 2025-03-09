import { redirect } from 'react-router';
import { useSearchParams } from 'react-router';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getSessionUserId } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/signup.ts';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';
import { EmailPasswordSignup } from './components/email-password-signup.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Signup | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');

  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  if (!withEmailPasswordSignin) return redirect('/auth/login');

  return null;
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  return (
    <Page>
      <div className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        <EmailPasswordSignup redirectTo={redirectTo} />

        <DividerWithLabel label="Or" />

        <AuthProvidersSignin redirectTo={redirectTo} withEmailPasswordSignin />
      </Card>

      <Subtitle className="text-center my-8">
        Already have an account?{' '}
        <Link to={{ pathname: '/auth/login', search: `${searchParams}` }} weight="semibold">
          Sign in
        </Link>
      </Subtitle>
    </Page>
  );
}
