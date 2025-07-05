import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Form, redirect, useNavigation, useSearchParams } from 'react-router';
import { z } from 'zod';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { getUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/shared/design-system/logo.tsx';
import { Subtitle } from '~/shared/design-system/typography.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import type { Route } from './+types/reset-password-sent.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Forgot password | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const locale = await i18n.getLocale(request);
  const form = await request.formData();
  const email = z.string().email().parse(form.get('email'));
  await UserAccount.sendResetPasswordEmail(email, locale);
  return { emailSent: true };
};

export default function ResetPasswordSent({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { emailSent } = actionData || {};
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const loading = navigation.state !== 'idle';

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

          <Form method="POST" className="space-y-4">
            <Input
              label={t('common.email')}
              placeholder={t('common.email.placeholder')}
              name="email"
              type="email"
              defaultValue={defaultEmail}
              required
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
              {t('auth.forgot-password.form.submit')}
            </Button>
          </Form>
        </Card>
      )}
    </Page>
  );
}
