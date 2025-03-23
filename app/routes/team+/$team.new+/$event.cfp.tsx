import { parseWithZod } from '@conform-to/zod';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { redirect } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { CfpConferenceOpeningSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { EventCfpConferenceForm } from '~/routes/components/events/event-cfp-conference-form.tsx';
import { FullscreenPage } from '~/routes/components/fullscreen-page.tsx';
import type { Route } from './+types/$event.cfp.ts';
import { EventCreationStepper } from './components/event-creation-stepper.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const event = await UserEvent.for(userId, params.team, params.event).get();
  if (event.type === 'MEETUP') {
    return redirect(`/team/${params.team}/${params.event}`);
  }
  return event;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: CfpConferenceOpeningSchema });
  if (result.status !== 'success') return result.error;
  await event.update(result.value);

  return redirect(`/team/${params.team}/${params.event}`);
};

export default function NewEventDetailsRoute({ loaderData: event, actionData: errors }: Route.ComponentProps) {
  const currentTeam = useCurrentTeam();

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
