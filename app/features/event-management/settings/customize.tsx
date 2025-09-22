import { parseFormData } from '@mjackson/form-data-parser';
import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { z } from 'zod';
import { uploadToStorageHandler } from '~/app-platform/storage/services/storage.server.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { ButtonFileUpload } from '~/design-system/forms/file-upload-button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/customize.ts';

const MAX_FILE_SIZE = 300 * 1024; // 300kB
const FILE_SCHEMA = z.object({ name: z.url() });

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const event = await EventSettings.for(userId, params.team, params.event);
  await event.needsPermission('canEditEvent');

  const formData = await parseFormData(request, uploadToStorageHandler({ name: 'logo', maxFileSize: MAX_FILE_SIZE }));
  const result = FILE_SCHEMA.safeParse(formData.get('logo'));
  if (result.success) {
    await event.update({ logoUrl: result.data.name });
    return toast('success', i18n.t('event-management.settings.customize.feedbacks.logo-updated'));
  } else {
    return { status: 'error', message: i18n.t('event-management.settings.customize.errors.upload') };
  }
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const submit = useSubmit();
  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    if (e.currentTarget[0] && (e.currentTarget[0] as HTMLInputElement).value) {
      submit(e.currentTarget);
    }
  };

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.customize.logo.heading')}</H2>
        <Subtitle>{t('event-management.settings.customize.logo.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <Avatar picture={event.logoUrl} name={`${event.name} logo`} square size="4xl" />
        <Callout title={t('event-management.settings.customize.logo.info.heading')}>
          <Trans
            i18nKey="event-management.settings.customize.logo.info"
            components={[<br key="1" />, <ExternalLink key="2" href="https://squoosh.app" weight="medium" />]}
          />
        </Callout>
        {errors?.status === 'error' && <p className="text-sm text-red-600">{errors.message}</p>}
      </Card.Content>

      <Card.Actions>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload name="logo" accept="image/jpeg,image/png,image/webp,image/avif">
            {t('event-management.settings.customize.logo.submit')}
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
