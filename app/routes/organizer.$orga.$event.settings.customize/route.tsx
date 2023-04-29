import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2, Subtitle } from '~/design-system/Typography';
import { Form, useActionData, useSubmit } from '@remix-run/react';
import { AlertInfo } from '~/design-system/Alerts';
import { ExternalLink } from '~/design-system/Links';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { UploadingError } from '~/libs/storage/storage.server';
import { ButtonFileUpload } from '~/design-system/forms/FileUploadButton';
import { mapErrorToResponse } from '~/libs/errors';
import { ClientOnly } from 'remix-utils';
import { uploadEventBanner } from './server/upload-event-banner.server';
import { Card } from '~/design-system/layouts/Card';
import { Avatar } from '~/design-system/Avatar';
import { Button } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  try {
    await uploadEventBanner(params.orga, params.event, userId, request);
    return json(null);
  } catch (error) {
    if (error instanceof UploadingError) {
      return json({ error: error.message });
    }
    throw mapErrorToResponse(error);
  }
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOrganizerEvent();
  const submit = useSubmit();
  const result = useActionData<typeof action>();

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    if (e.currentTarget[0] && (e.currentTarget[0] as HTMLInputElement).value) {
      submit(e.currentTarget);
    }
  };

  const picture = event.logo ? `${event.logo}?${Math.random()}` : undefined;

  return (
    <Card as="section">
      <Card.Title>
        <H2 size="xl">Customize event logo</H2>
        <Subtitle>Upload a beautiful logo for your event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <ClientOnly>{() => <Avatar picture={picture} name={event.name} square size="4xl" />}</ClientOnly>
        <AlertInfo>
          JPEG format with optimal resolution of 500x500.
          <br />
          100kB max (optimize it with{' '}
          <ExternalLink href="https://squoosh.app" className="underline">
            squoosh.app
          </ExternalLink>
          )
        </AlertInfo>
      </Card.Content>

      <Card.Actions>
        <Button variant="secondary">Remove logo</Button>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload name="logo" accept="image/jpeg" error={result?.error}>
            Change logo
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
