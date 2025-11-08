import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Turnstile } from '@marsidev/react-turnstile';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect, useNavigation, useSearchParams, useSubmit } from 'react-router';
import { z } from 'zod';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getCaptchaSiteKey } from '~/shared/auth/captcha.server.ts';
import { getUserSession } from '~/shared/auth/session.ts';
import { getI18n, getLocale } from '~/shared/i18n/i18n.middleware.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import { dataWithToast } from '~/shared/toasts/toast.server.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import type { Route } from './+types/forgot-password.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Forgot password | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');

  const captchaSiteKey = await getCaptchaSiteKey();
  return { captchaSiteKey };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const i18n = getI18n(context);
  const locale = getLocale(context);
  const form = await request.formData();
  try {
    const email = z.email().parse(form.get('email'));
    const captchaToken = z.string().optional().parse(form.get('captchaToken'));
    await UserAccount.sendResetPasswordEmail(email, locale, captchaToken);
  } catch {
    return dataWithToast({ emailSent: false }, 'error', i18n.t('error.global'));
  }
  return { emailSent: true };
};

export default function ForgotPasswordSent({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { captchaSiteKey } = loaderData;
  const navigation = useNavigation();
  const { emailSent } = actionData || {};
  const [searchParams] = useSearchParams();

  const submit = useSubmit();
  const nonce = useNonce();

  const defaultEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(defaultEmail || '');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  const loading = navigation.state !== 'idle';

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (loading) return;
    console.log({ captchaToken });
    if (captchaSiteKey && !captchaToken) {
      setError(t('common.captcha-required'));
      return;
    }
    await submit({ email, captchaToken }, { method: 'POST' });
  };

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {emailSent ? t('auth.forgot-password.sent.heading') : t('auth.forgot-password.form.heading')}
        </h2>
      </header>

      {emailSent ? (
        <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
          <EnvelopeIcon className="size-16 mx-auto text-slate-300" />
          <div className="flex flex-col items-center gap-4">
            <Subtitle align="center">{t('auth.forgot-password.sent.confirmation')}</Subtitle>
            <Subtitle align="center" weight="semibold">
              {t('auth.common.check-inbox')}
            </Subtitle>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
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

            <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
              {t('auth.forgot-password.form.submit')}
            </Button>

            {error ? (
              <Callout variant="error" role="alert">
                {error}
              </Callout>
            ) : null}
          </Form>
        </Card>
      )}
    </Page>
  );
}
