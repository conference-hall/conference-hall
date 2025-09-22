import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { KeyIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Form, href, replace } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button, button } from '~/design-system/buttons.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import type { Route } from './+types/request-access.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Request access | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  try {
    await TeamBetaAccess.for(userId).validateAccessKey(String(form.get('key')));
  } catch (_error) {
    return { key: [i18n.t('error.invalid-access-key')] };
  }
  return replace(href('/team/new'));
};

export default function RequestAccessRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <FullscreenPage>
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

        <DividerWithLabel label={t('common.or')} className="py-8" />

        <a href="https://forms.gle/AnArRCSHibmG59zw7" target="_blank" className={button()} rel="noreferrer">
          <KeyIcon className="h-4 w-4" aria-hidden="true" />
          {t('team.request.request-link')}
        </a>
      </Card>
    </FullscreenPage>
  );
}
