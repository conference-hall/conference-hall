import { parseFormData } from '@mjackson/form-data-parser';
import type { ChangeEvent } from 'react';
import { Form, useSubmit } from 'react-router';
import { z } from 'zod';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { ButtonFileUpload } from '~/design-system/forms/file-upload-button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { uploadToStorageHandler } from '~/libs/storage/storage.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/__components/contexts/event-team-context';
import type { Route } from './+types/customize.ts';

const MAX_FILE_SIZE = 300 * 1024; // 300kB
const FILE_SCHEMA = z.object({ name: z.string().url() });

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const event = await UserEvent.for(userId, params.team, params.event);
  await event.needsPermission('canEditEvent');

  const formData = await parseFormData(request, uploadToStorageHandler({ name: 'logo', maxFileSize: MAX_FILE_SIZE }));
  const result = FILE_SCHEMA.safeParse(formData.get('logo'));
  if (result.success) {
    await event.update({ logoUrl: result.data.name });
    return toast('success', 'Logo updated.');
  } else {
    return { status: 'error', message: 'An error occurred during upload, you may exceed max file size.' };
  }
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
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
        <H2>Customize event logo</H2>
        <Subtitle>Upload a beautiful logo for your event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Avatar picture={logoUrl} name={`${name} logo`} square size="4xl" />
        <Callout title="Logo format">
          JPEG, PNG, WEBP or AVIF formats supported with optimal resolution of 500x500.
          <br />
          300kB max. You can optimize your logo with{' '}
          <ExternalLink href="https://squoosh.app" variant="secondary">
            squoosh.app
          </ExternalLink>
        </Callout>
        {errors?.status === 'error' && <p className="text-sm text-red-600">{errors.message}</p>}
      </Card.Content>

      <Card.Actions>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload name="logo" accept="image/jpeg,image/png,image/webp,image/avif">
            Change logo
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
