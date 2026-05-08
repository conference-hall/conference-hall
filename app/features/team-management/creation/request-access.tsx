import { parseWithZod } from '@conform-to/zod/v4';
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Text } from '~/design-system/typography.tsx';
import { verifyTurnstile } from '~/shared/captcha/verify-turnstile.server.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import { getWebServerEnv } from '../../../../servers/environment.server.ts';
import type { Route } from './+types/request-access.ts';
import { TeamAccessRequestSchema } from './services/team-access-request.schema.server.ts';
import { TeamAccessRequests } from './services/team-access-request.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Request access | Conference Hall' }]);
};

export const loader = async () => {
  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { captchaSiteKey: CAPTCHA_SITE_KEY };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TeamAccessRequestSchema });

  if (result.status !== 'success') {
    return { success: false, errors: result.error };
  }

  const turnstileToken = result.value['cf-turnstile-response'];
  const isValid = await verifyTurnstile(turnstileToken);
  if (!isValid) {
    return { success: false, errors: { 'cf-turnstile-response': ['Captcha verification failed'] } };
  }

  await TeamAccessRequests.submit({ eventName: result.value.eventName, email: result.value.email });

  return { success: true, errors: null };
};

export default function RequestAccessRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { captchaSiteKey } = loaderData;
  const { t } = useTranslation();
  const nonce = useNonce();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  if (actionData?.success) {
    return (
      <Page>
        <div className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
          <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
          <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
            {t('team.request.success.heading')}
          </h2>
        </div>
        <Card className="mt-10 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
          <Text>{t('team.request.success.message')}</Text>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('team.request.heading')}
        </h2>
        <Text variant="secondary" className="mt-2 text-center">
          {t('team.request.description')}
        </Text>
      </header>

      <Card className="mt-10 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <Form method="POST" className="space-y-6">
          <Input
            name="eventName"
            label={t('team.request.form.event-name')}
            placeholder={t('team.request.form.event-name.placeholder')}
            required
            error={actionData?.errors?.eventName}
          />
          <Input
            name="email"
            type="email"
            label={t('team.request.form.email')}
            placeholder={t('team.request.form.email.placeholder')}
            required
            error={actionData?.errors?.email}
          />

          {captchaSiteKey && (
            <Turnstile
              siteKey={captchaSiteKey}
              onSuccess={setCaptchaToken}
              onError={() => setCaptchaToken(null)}
              onExpire={() => setCaptchaToken(null)}
              options={{ theme: 'light', size: 'invisible' }}
              scriptOptions={{ nonce }}
              className="hidden"
              aria-hidden
            />
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || (!!captchaSiteKey && !captchaToken)}>
            {isSubmitting ? t('team.request.form.submitting') : t('team.request.form.submit')}
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
