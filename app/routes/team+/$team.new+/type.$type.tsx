import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Form, redirect, useActionData, useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { EventCreateSchema, TeamEvents } from '~/.server/team/team-events.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';
import type { EventType } from '~/types/events.types.ts';

import { EventForm } from '../../__components/events/event-form.tsx';
import { EventCreationStepper } from '../__components/event-creation-stepper.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  const form = await request.formData();

  const result = parseWithZod(form, { schema: EventCreateSchema });
  if (result.status !== 'success') return result.error;

  let event = null;
  try {
    event = await TeamEvents.for(userId, params.team).create(result.value);
  } catch (_error) {
    return { slug: ['This URL already exists, please try another one.'] };
  }
  throw redirect(`/team/${params.team}/new/${event.slug}/details`);
};

export default function NewEventRoute() {
  const errors = useActionData<typeof action>();
  const params = useParams();
  const type = (params.type || 'CONFERENCE') as EventType;

  const title = type === 'CONFERENCE' ? 'Create a new conference.' : 'Create a new meetup.';

  return (
    <>
      <FullscreenPage.Title
        title={title}
        subtitle="You will able to setup the call for paper later and make the event public or private."
      />

      <EventCreationStepper type={type} currentStep={0} />

      <Card>
        <Card.Content>
          <Form id="create-event-form" method="POST" replace className="flex grow flex-col gap-4 lg:gap-6">
            <EventForm errors={errors} />
            <input name="type" type="hidden" value={type} />
          </Form>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to=".." variant="secondary">
            Go back
          </ButtonLink>
          <Button type="submit" form="create-event-form" iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
