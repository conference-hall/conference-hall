import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { Form, redirect, useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { getSessionUserId } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/reset-password.ts';
import { PasswordInput } from './components/password-input.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Reset password | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect('/');

  const url = new URL(request.url);
  const oobCode = url.searchParams.get('oobCode');
  if (!oobCode) return redirect('/auth/login');

  return null;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState('');

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading || !oobCode) return;

    try {
      setError('');
      setLoading(true);
      await Firebase.confirmPasswordReset(getClientAuth(), oobCode, password);
      navigate(getPathFromContinueUrl(continueUrl));
    } catch (error) {
      setError(getFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Change your password
        </h2>
      </header>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        <Subtitle>
          Enter a new password for your account. We recommend using a strong password that you don't use elsewhere.
        </Subtitle>

        <Form className="space-y-4" onSubmit={resetPassword}>
          <PasswordInput value={password} onChange={setPassword} isNewPassword />

          <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
            {loading ? <LoadingIcon className="size-4" /> : 'Change your password'}
          </Button>

          {error ? <Callout variant="error">{error}</Callout> : null}
        </Form>
      </Card>

      <footer className="text-center my-8">
        <Link to="/auth/login" weight="semibold">
          Go back to login
        </Link>
      </footer>
    </Page>
  );
}

function getPathFromContinueUrl(continueUrl: string | null) {
  if (!continueUrl) return '/auth/login';
  try {
    const url = new URL(continueUrl);
    if (url.origin !== window.location.origin) return '/auth/login';
    return url.pathname + url.search;
  } catch {
    return '/auth/login';
  }
}
