import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventDetailsSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { EventDetailsForm } from '~/routes/__components/events/event-details-form.tsx';
import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';

import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const event = await UserEvent.for(userId, params.team, params.event).get();
  return json(event);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
  if (result.status !== 'success') return json(result.error);
  await event.update(result.value);

  return redirect(`/team/${params.team}/new/${params.event}/cfp`);
};

export default function NewEventDetailsRoute() {
  const { team } = useTeam();
  const event = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const isConference = event.type === 'CONFERENCE';

  return (
    <>
      <FullscreenPage.Title
        title={`${event.name} information.`}
        subtitle="Provide details about the event, like address, dates and description to generate the event page."
      />

      <Card>
        <Card.Content>
          <EventDetailsForm
            type={event.type}
            timezone={event.timezone}
            conferenceStart={event.conferenceStart}
            conferenceEnd={event.conferenceEnd}
            address={event.address}
            description={event.description}
            websiteUrl={event.websiteUrl}
            contactEmail={event.contactEmail}
            errors={errors}
          />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={`/team/${team.slug}/${event.slug}`} iconLeft={ClockIcon} variant="secondary">
            Do it later
          </ButtonLink>
          {isConference ? (
            <Button type="submit" form="details-form" iconRight={ArrowRightIcon}>
              Continue
            </Button>
          ) : (
            <Button type="submit" form="details-form" iconLeft={CheckIcon}>
              Finish
            </Button>
          )}
        </Card.Actions>
      </Card>
    </>
  );
}
