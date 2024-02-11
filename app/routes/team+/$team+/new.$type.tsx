import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventCreateSchema, TeamEvents } from '~/.server/organizer-team/TeamEvents.ts';
import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { H1, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { EventForm } from '../../__components/events/EventForm.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  const form = await request.formData();

  const result = parseWithZod(form, EventCreateSchema);
  if (!result.success) return json(result.error);

  try {
    const event = await TeamEvents.for(userId, params.team).create(result.value);
    return redirect(`/team/${params.team}/${event.slug}/settings`);
  } catch (SlugAlreadyExistsError) {
    return json({ slug: 'This URL already exists, please try another one.' });
  }
};

export default function NewEventRoute() {
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
