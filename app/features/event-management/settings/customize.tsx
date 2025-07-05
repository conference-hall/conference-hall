import { parseFormData } from '@mjackson/form-data-parser';
import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { z } from 'zod';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { useCurrentEvent } from '~/features/event-management/event-team-context.tsx';
import { uploadToStorageHandler } from '~/libs/storage/storage.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Avatar } from '~/shared/design-system/avatar.tsx';
import { Callout } from '~/shared/design-system/callout.tsx';
import { ButtonFileUpload } from '~/shared/design-system/forms/file-upload-button.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { ExternalLink } from '~/shared/design-system/links.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/customize.ts';

const MAX_FILE_SIZE = 300 * 1024; // 300kB
const FILE_SCHEMA = z.object({ name: z.string().url() });

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = await UserEvent.for(userId, params.team, params.event);
  await event.needsPermission('canEditEvent');

  const formData = await parseFormData(request, uploadToStorageHandler({ name: 'logo', maxFileSize: MAX_FILE_SIZE }));
  const result = FILE_SCHEMA.safeParse(formData.get('logo'));
  if (result.success) {
    await event.update({ logoUrl: result.data.name });
    return toast('success', t('event-management.settings.customize.feedbacks.logo-updated'));
  } else {
    return { status: 'error', message: t('event-management.settings.customize.errors.upload') };
  }
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { name, logoUrl } = useCurrentEvent();
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
        <Avatar picture={logoUrl} name={`${name} logo`} square size="4xl" />
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
