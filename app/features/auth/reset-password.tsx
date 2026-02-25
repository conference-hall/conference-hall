import type { ParseKeys } from 'i18next';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validatePassword } from '~/shared/validators/auth.ts';
import type { Route } from './+types/reset-password.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Reset password | Conference Hall' }]);
};

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const errorCode = searchParams.get('error');
  const errorKey = errorCode ? getAuthError({ code: errorCode }) : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParseKeys | null>(errorKey);
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const [password, setPassword] = useState('');

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading || !token) return;

    const fieldErrors = validatePassword(password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    await authClient.resetPassword(
      { newPassword: password, token },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          toast.success(t('auth.reset-password.toast.success'));
          navigate({ pathname: '/auth/login' });
        },
        onError: (ctx) => setError(getAuthError(ctx.error)),
      },
    );
    setLoading(false);
  };

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('auth.reset-password.heading')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <Subtitle>{t('auth.reset-password.description')}</Subtitle>

        <Form className="space-y-4" onSubmit={resetPassword}>
          <InputPassword
            value={password}
            onChange={setPassword}
            isNewPassword
            error={fieldErrors?.password?.map((e) => t(e))}
            disabled={!token}
          />

          <Button type="submit" variant="primary" loading={loading} disabled={!token} className="mt-2 w-full">
            {t('auth.reset-password.submit')}
          </Button>

          {error ? (
            <Callout variant="error" role="alert">
              {t(error)}
            </Callout>
          ) : null}
        </Form>
      </Card>

      <footer className="my-8 text-center">
        <Link to="/auth/login" weight="semibold">
          {t('auth.common.go-back-login')}
        </Link>
      </footer>
    </Page>
  );
}
