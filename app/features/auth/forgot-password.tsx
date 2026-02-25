import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import type { Route } from './+types/forgot-password.ts';
import { ForgotPasswordForm } from './components/forgot-password-form.tsx';

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

          <ForgotPasswordForm
            defaultEmail={defaultEmail}
            captchaSiteKey={captchaSiteKey}
            onSuccess={() => setEmailSent(true)}
          />
        </Card>
      )}
    </Page>
  );
}
