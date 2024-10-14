import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, unstable_parseMultipartFormData } from '@remix-run/node';
import { Form, useActionData, useSubmit } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import invariant from 'tiny-invariant';
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

import { useEvent } from '../__components/use-event.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const event = await UserEvent.for(userId, params.team, params.event);
  await event.needsPermission('canEditEvent');

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadToStorageHandler({ name: 'logoUrl', maxFileSize: 300_000 }),
  );
  const result = z.string().url().safeParse(formData.get('logoUrl'));
  if (result.success) {
    await event.update({ logoUrl: result.data });
    return toast('success', 'Logo updated.');
  } else {
    return json({ status: 'error', message: 'An error occurred during upload, you may exceed max file size.' });
  }
};

export default function EventGeneralSettingsRoute() {
  const { event } = useEvent();
  const submit = useSubmit();
  const result = useActionData<typeof action>();

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
        <Avatar picture={event.logoUrl} name={`${event.name} logo`} square size="4xl" />
        <Callout title="Logo format">
          JPEG, PNG, WEBP or AVIF formats supported with optimal resolution of 500x500.
          <br />
          300kB max. You can optimize your logo with{' '}
          <ExternalLink href="https://squoosh.app" variant="secondary">
            squoosh.app
          </ExternalLink>
        </Callout>
        {result?.status === 'error' && <p className="text-sm text-red-600">{result.message}</p>}
      </Card.Content>

      <Card.Actions>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload name="logoUrl" accept="image/jpeg,image/png,image/webp,image/avif">
            Change logo
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
