import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Turnstile } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import type { Route } from './+types/forgot-password.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Forgot password | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(OptionalAuthContext);
  if (user) return redirect('/');

  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { captchaSiteKey: CAPTCHA_SITE_KEY };
};

export default function ForgotPasswordSent({ loaderData }: Route.ComponentProps) {
  const { captchaSiteKey } = loaderData;
  const { t } = useTranslation();
  const [emailSent, setEmailSent] = useState(false);
  const [searchParams] = useSearchParams();

  const defaultEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(defaultEmail || '');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [error, setError] = useState<ParseKeys | null>(null);
  const nonce = useNonce();

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    await authClient.requestPasswordReset(
      { email, redirectTo: '/auth/reset-password' },
      {
        headers: captchaSiteKey ? { 'x-captcha-response': captchaToken } : undefined,
        onRequest: () => setLoading(true),
        onSuccess: () => setEmailSent(true),
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
          {emailSent ? t('auth.forgot-password.sent.heading') : t('auth.forgot-password.form.heading')}
        </h2>
      </header>

      {emailSent ? (
        <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
          <EnvelopeIcon className="mx-auto size-16 text-slate-300" />
          <div className="flex flex-col items-center gap-4">
            <Subtitle align="center">{t('auth.forgot-password.sent.confirmation')}</Subtitle>
            <Subtitle align="center" weight="semibold">
              {t('auth.common.check-inbox')}
            </Subtitle>
          </div>
        </Card>
      ) : (
        <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
          <Subtitle>{t('auth.forgot-password.form.description')}</Subtitle>

          <Form method="POST" className="space-y-4" onSubmit={resetPassword}>
            <Input
              label={t('common.email')}
              placeholder={t('common.email.placeholder')}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              {t('auth.forgot-password.form.submit')}
            </Button>

            {error ? (
              <Callout variant="error" role="alert">
                {t(error)}
              </Callout>
            ) : null}
          </Form>
        </Card>
      )}
    </Page>
  );
}
