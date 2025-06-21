import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { KeyIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { TeamBetaAccess } from '~/.server/team/team-beta-access.ts';
import { Button, button } from '~/design-system/buttons.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import type { Route } from './+types/team-request-access.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Request access | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const t = await i18n.getFixedT(request);
  const form = await request.formData();

  try {
    await TeamBetaAccess.for(userId).validateAccessKey(String(form.get('key')));
  } catch (_error) {
    return { key: [t('error.invalid-access-key')] };
  }
  return redirect('/team/new');
};

export default function RequestAccessRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title title={t('team.request.heading')} subtitle={t('team.request.description')} />

      <Card className="p-8 md:p-12">
        <Form method="POST" className="flex flex-col sm:flex-row gap-2">
          <Input
            name="key"
            aria-label={t('team.request.form.access-key')}
            placeholder={t('team.request.form.access-key.placeholder')}
            className="grow"
            required
            error={errors?.key}
          />
          <Button type="submit" variant="secondary" iconRight={ArrowRightIcon}>
            {t('team.request.form.submit')}
          </Button>
        </Form>

        <DividerWithLabel label="or" className="py-8" />

        <a href="https://forms.gle/AnArRCSHibmG59zw7" target="_blank" className={button()} rel="noreferrer">
          <KeyIcon className="h-4 w-4" aria-hidden="true" />
          {t('team.request.request-link')}
        </a>
      </Card>
    </FullscreenPage>
  );
}
