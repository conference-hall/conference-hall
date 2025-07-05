import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { getFirebaseError } from '~/shared/auth/firebase.errors.ts';
import { getClientAuth } from '~/shared/auth/firebase.ts';
import { getUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Callout } from '~/shared/design-system/callout.tsx';
import { PasswordInput } from '~/shared/design-system/forms/password-input.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { Link } from '~/shared/design-system/links.tsx';
import { ConferenceHallLogo } from '~/shared/design-system/logo.tsx';
import { Subtitle } from '~/shared/design-system/typography.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import { validatePassword } from '~/shared/validators/auth.ts';
import type { Route } from './+types/reset-password.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Reset password | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');

  const url = new URL(request.url);
  const oobCode = url.searchParams.get('oobCode');
  if (!oobCode) return redirect('/auth/login');

  return null;
};

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>(null);
  const [password, setPassword] = useState('');

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading || !oobCode) return;

    const fieldErrors = validatePassword(password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    try {
      setError('');
      setLoading(true);
      await Firebase.confirmPasswordReset(getClientAuth(), oobCode, password);
      toast.success(t('auth.reset-password.toast.success'));
      navigate({ pathname: '/auth/login', search: `?email=${email}` });
    } catch (error) {
      setError(getFirebaseError(error, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {t('auth.reset-password.heading')}
        </h2>
      </header>

      <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
        <Subtitle>{t('auth.reset-password.description')}</Subtitle>

        <Form className="space-y-4" onSubmit={resetPassword}>
          <PasswordInput value={password} onChange={setPassword} isNewPassword error={fieldErrors?.password} />

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
            {t('auth.reset-password.submit')}
          </Button>

          {error ? (
            <Callout variant="error" role="alert">
              {error}
            </Callout>
          ) : null}
        </Form>
      </Card>

      <footer className="text-center my-8">
        <Link to="/auth/login" weight="semibold">
          {t('auth.common.go-back-login')}
        </Link>
      </footer>
    </Page>
  );
}
