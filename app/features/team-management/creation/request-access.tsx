import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslation } from 'react-i18next';
import { Form, href } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { TeamAccessRequestSchema } from '~/features/team-management/creation/services/team-access-request.schema.server.ts';
import { TeamAccessRequest } from '~/features/team-management/creation/services/team-access-request.server.ts';
import { verifyCaptcha } from '~/shared/captcha/verify-captcha.server.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
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
  const nonce = useNonce();
  const { captchaSiteKey } = loaderData;

  if (actionData?.success) {
    return (
      <Page>
        <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
          <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
          <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
            {t('team.request.heading')}
          </h2>
        </header>

        <Card className="mt-10 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="size-12 text-green-500" />
            <Text size="l" weight="medium">
              {t('team.request.success.title')}
            </Text>
            <Text variant="secondary">{t('team.request.success.description')}</Text>
          </div>
        </Card>

        <footer className="my-8 flex justify-center">
          <Link to={href('/')} weight="semibold" iconLeft={ArrowLeftIcon}>
            {t('team.request.back')}
          </Link>
        </footer>
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
        <Subtitle className="mt-2 text-center">{t('team.request.description')}</Subtitle>
      </header>

      <Card className="mt-10 space-y-4 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <Form method="POST" className="space-y-4">
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
              options={{ theme: 'light', size: 'invisible' }}
              scriptOptions={{ nonce }}
              className="hidden"
              aria-hidden
            />
          )}

          <Button type="submit" className="mt-2 w-full">
            {t('team.request.form.submit')}
          </Button>
        </Form>
      </Card>

      <footer className="my-8 flex justify-center">
        <Link to={href('/')} weight="semibold" iconLeft={ArrowLeftIcon}>
          {t('team.request.back')}
        </Link>
      </footer>
    </Page>
  );
}
