import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useSubmit } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import invariant from 'tiny-invariant';

import { AlertInfo } from '~/design-system/Alerts';
import { Avatar } from '~/design-system/Avatar';
import { ButtonFileUpload } from '~/design-system/forms/FileUploadButton';
import { Card } from '~/design-system/layouts/Card';
import { ExternalLink } from '~/design-system/Links';
import { H2, Subtitle } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';

import { useOrganizerEvent } from '../_layout';
import { uploadEventLogo } from './server/upload-event-logo.server';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const result = await uploadEventLogo(params.event, userId, request);
  return json(result, await addToast(request, 'Logo updated.'));
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

  return (
    <Card as="section">
      <Card.Title>
        <H2>Customize event logo</H2>
        <Subtitle>Upload a beautiful logo for your event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Avatar picture={event.logo} name={`${event.name} logo`} square size="4xl" />
        <AlertInfo>
          JPEG, PNG, WEBP or AVIF formats supported with optimal resolution of 500x500.
          <br />
          300kB max. You can optimize your logo with{' '}
          <ExternalLink href="https://squoosh.app" variant="secondary">
            squoosh.app
          </ExternalLink>
        </AlertInfo>
        {result?.status === 'error' && <p className="text-sm text-red-600">{result.message}</p>}
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
