import { parseWithZod } from '@conform-to/zod/v4';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Text } from '~/design-system/typography.tsx';
import { TeamAccessRequestSchema } from '~/features/team-management/creation/services/team-access-request.schema.server.ts';
import { TeamAccessRequest } from '~/features/team-management/creation/services/team-access-request.server.ts';
import { verifyCaptcha } from '~/shared/captcha/verify-captcha.server.ts';
import { getWebServerEnv } from '../../../../servers/environment.server.ts';
import type { Route } from './+types/request-access.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Request access | Conference Hall' }]);
};

export const loader = () => {
  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { captchaSiteKey: CAPTCHA_SITE_KEY };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TeamAccessRequestSchema });
  if (result.status !== 'success') return { errors: result.error, success: false };

  const captchaToken = result.value['cf-turnstile-response'] ?? '';
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) return { errors: { email: ['Captcha verification failed'] }, success: false };

  await TeamAccessRequest.submit({ eventName: result.value.eventName, email: result.value.email });
  return { errors: null, success: true };
};

export default function RequestAccessRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { captchaSiteKey } = loaderData;

  if (actionData?.success) {
    return (
      <FullscreenPage>
        <FullscreenPage.Title title={t('team.request.heading')} />

        <Card className="p-8 md:p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="size-12 text-green-500" />
            <Text size="l" weight="medium">
              {t('team.request.success.title')}
            </Text>
            <Text variant="secondary">{t('team.request.success.description')}</Text>
          </div>
        </Card>
      </FullscreenPage>
    );
  }

  return (
    <FullscreenPage>
      <FullscreenPage.Title title={t('team.request.heading')} subtitle={t('team.request.description')} />

      <Card className="p-8 md:p-12">
        <Form method="POST" className="space-y-4">
          <Input
            name="eventName"
            label={t('team.request.form.event-name')}
            required
            error={actionData?.errors?.eventName}
          />
          <Input
            name="email"
            type="email"
            label={t('team.request.form.email')}
            required
            error={actionData?.errors?.email}
          />

          {captchaSiteKey ? <Turnstile siteKey={captchaSiteKey} /> : null}

          <Button type="submit">{t('team.request.form.submit')}</Button>
        </Form>
      </Card>
    </FullscreenPage>
  );
}
