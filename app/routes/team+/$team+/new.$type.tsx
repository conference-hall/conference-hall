import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { H1, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { EventForm } from '../../__components/events/EventForm.tsx';
import { createEvent } from './__server/create-event.server.ts';
import { EventCreateSchema } from './__types/event-create.schema.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  const form = await request.formData();

  const result = parse(form, { schema: EventCreateSchema });
  if (!result.value) return json(result.error);

  const event = await createEvent(params.team, userId, result.value);
  if (event.error) return json(event.error);

  return redirect(`/team/${params.team}/${event.slug}/settings`);
};

export default function OrganizationRoute() {
  const errors = useActionData<typeof action>();
  const params = useParams();
  const type = params.type || 'CONFERENCE';

  return (
    <PageContent className="flex flex-col">
      <Card>
        <Card.Title>
          <H1>Create a new event</H1>
          <Subtitle>You can make it public or private.</Subtitle>
        </Card.Title>

        <Form method="POST">
          <Card.Content>
            <EventForm errors={errors} />
            <input name="type" type="hidden" value={type} />
          </Card.Content>
          <Card.Actions>
            <ButtonLink to=".." variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit">Create new event</Button>
          </Card.Actions>
        </Form>
      </Card>
    </PageContent>
  );
}
