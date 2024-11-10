import { parseWithZod } from '@conform-to/zod';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { CfpConferenceOpeningSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { EventCfpConferenceForm } from '~/routes/__components/events/event-cfp-conference-form.tsx';
import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';

import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';
import { EventCreationStepper } from '../__components/event-creation-stepper.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const event = await UserEvent.for(userId, params.team, params.event).get();

  if (event.type === 'MEETUP') {
    return redirect(`/team/${params.team}/${params.event}`);
  }

  return event;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: CfpConferenceOpeningSchema });
  if (result.status !== 'success') return result.error;
  await event.update(result.value);

  return redirect(`/team/${params.team}/${params.event}`);
};

export default function NewEventDetailsRoute() {
  const currentTeam = useCurrentTeam();
  const event = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <>
      <FullscreenPage.Title
        title={`${event.name} call for paper.`}
        subtitle="Set up the conference Call For Paper openings."
      />

      <EventCreationStepper type={event.type} currentStep={2} />

      <Card>
        <Card.Content>
          <EventCfpConferenceForm
            cfpStart={event.cfpStart}
            cfpEnd={event.cfpEnd}
            timezone={event.timezone}
            errors={errors}
          />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={`/team/${currentTeam.slug}/${event.slug}`} iconLeft={ClockIcon} variant="secondary">
            Do it later
          </ButtonLink>
          <Button type="submit" form="cfp-conference-form" iconLeft={CheckIcon}>
            Finish
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
