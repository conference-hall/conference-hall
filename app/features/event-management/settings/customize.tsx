import { parseFormData } from '@remix-run/form-data-parser';
import { type ChangeEvent, useRef, useState } from 'react';
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
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/customize.ts';

const MAX_FILE_SIZE = 300 * 1024; // 300kB
const FILE_SCHEMA = z.object({ name: z.url() });

function toKB(size: number) {
  return `${(size / 1024).toFixed(0)} KB`;
}

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const i18n = getI18n(context);

  try {
    const formData = await parseFormData(
      request,
      { maxFiles: 1, maxFileSize: MAX_FILE_SIZE },
      uploadToStorageHandler({ name: 'logo' }),
    );
    const data = FILE_SCHEMA.parse(formData.get('logo'));
    const settings = EventSettings.for(authUser.id, params.team, params.event);
    await settings.update({ logoUrl: data.name });
    return toast('success', i18n.t('event-management.settings.customize.feedbacks.logo-updated'));
  } catch {
    return toast('error', i18n.t('error.global'));
  }
};

export default function EventGeneralSettingsRoute() {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();

  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useSubmit();
  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    if (!inputRef.current) return;
    const file = inputRef.current.files?.item(0);

    if (!file) return;
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      setError(
        t('event-management.settings.customize.errors.max-size', {
          size: toKB(file.size),
          maxSize: toKB(MAX_FILE_SIZE),
        }),
      );
      return;
    }

    const formData = new FormData(e.currentTarget);
    submit(formData, { method: 'post', encType: 'multipart/form-data' });
    setError(null);
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
            values={{ maxSize: toKB(MAX_FILE_SIZE) }}
            components={[<br key="1" />, <ExternalLink key="2" href="https://squoosh.app" weight="medium" />]}
          />
        </Callout>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </Card.Content>

      <Card.Actions>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload ref={inputRef} name="logo" accept="image/jpeg,image/png,image/webp,image/avif">
            {t('event-management.settings.customize.logo.submit')}
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
