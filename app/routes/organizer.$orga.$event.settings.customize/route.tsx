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
import { ButtonFileUpload } from '~/design-system/forms/FileUploadButton';
import { uploadEventLogo } from './server/upload-event-logo.server';
import { Card } from '~/design-system/layouts/Card';
import { Avatar } from '~/design-system/Avatar';
import { Button } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const result = await uploadEventLogo(params.event, userId, request);
  return json(result);
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
        <H2 size="xl">Customize event logo</H2>
        <Subtitle>Upload a beautiful logo for your event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Avatar picture={event.logo} name={`Logo of ${event.name}`} square size="4xl" />
        <AlertInfo>
          JPEG, PNG, WEBP or AVIF formats supported with optimal resolution of 500x500.
          <br />
          300kB max. You can optimize your logo with{' '}
          <ExternalLink href="https://squoosh.app" className="underline">
            squoosh.app
          </ExternalLink>
        </AlertInfo>
        {result?.status === 'error' && <p className="text-sm text-red-600">{result.message}</p>}
      </Card.Content>

      <Card.Actions>
        <Button variant="secondary">Remove logo</Button>
        <Form method="POST" encType="multipart/form-data" onChange={handleSubmit}>
          <ButtonFileUpload name="logo" accept="image/jpeg,image/png,image/webp,image/avif">
            Change logo
          </ButtonFileUpload>
        </Form>
      </Card.Actions>
    </Card>
  );
}
