import { Turnstile } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect, useNavigate, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validateRequiredEmailAndPassword } from '~/shared/validators/auth.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import type { Route } from './+types/signin.ts';
import { AuthProvidersSignin } from './components/auth-providers-signin.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Login | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(OptionalAuthContext);
  if (user) return redirect('/');

  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { captchaSiteKey: CAPTCHA_SITE_KEY };
};

export default function Signin({ loaderData }: Route.ComponentProps) {
  const { captchaSiteKey } = loaderData;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email');
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ParseKeys | null>(null);
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const nonce = useNonce();

  const forgotPasswordPath = email ? `${href('/auth/forgot-password')}?email=${email}` : href('/auth/forgot-password');

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const fieldErrors = validateRequiredEmailAndPassword(email, password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    await authClient.signIn.email(
      { email, password },
      {
        headers: captchaSiteKey ? { 'x-captcha-response': captchaToken } : undefined,
        onRequest: () => setLoading(true),
        onSuccess: () => navigate(redirectTo, { replace: true }),
        onError: async (ctx) => {
          setLoading(false);
          if (ctx.error.code === 'EMAIL_NOT_VERIFIED') {
            await navigate('/auth/email-verification');
          } else {
            setError(getAuthError(ctx.error));
          }
        },
      },
    );
  };

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('auth.signin.heading')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <Form className="space-y-4" onSubmit={signIn}>
          <Input
            label={t('common.email')}
            placeholder={t('common.email.placeholder')}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors?.email?.map((e) => t(e))}
            required
          />

          <InputPassword
            value={password}
            onChange={setPassword}
            forgotPasswordPath={forgotPasswordPath}
            error={fieldErrors?.password?.map((e) => t(e))}
          />

          {captchaSiteKey && (
            <Turnstile
              siteKey={captchaSiteKey}
              onSuccess={setCaptchaToken}
              onError={() => setCaptchaToken('')}
              onExpire={() => setCaptchaToken('')}
              options={{ theme: 'light', size: 'invisible' }}
              scriptOptions={{ nonce }}
              className="hidden"
              aria-hidden
            />
          )}

          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
            {t('auth.common.sign-in')}
          </Button>

          {error ? (
            <Callout variant="error" role="alert">
              {t(error)}
            </Callout>
          ) : null}
        </Form>

        <DividerWithLabel label={t('common.or')} />

        <AuthProvidersSignin redirectTo={redirectTo} />
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
