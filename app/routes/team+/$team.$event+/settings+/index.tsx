import { parseWithZod } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventDetailsSettingsSchema, EventGeneralSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { EventDetailsForm } from '~/routes/__components/events/event-details-form.tsx';
import { EventForm } from '~/routes/__components/events/event-form.tsx';

import { useEvent } from '../__components/use-event.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'general': {
      const result = parseWithZod(form, { schema: EventGeneralSettingsSchema });
      if (result.status !== 'success') return json(result.error);
      try {
        const updated = await event.update(result.value);
        return redirectWithToast(`/team/${params.team}/${updated.slug}/settings`, 'success', 'Event saved.');
      } catch (SlugAlreadyExistsError) {
        return json({ slug: ['This URL already exists, please try another one.'] } as Record<string, string[]>);
      }
    }
    case 'details': {
      const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      return toast('success', 'Event details saved.');
    }
    case 'archive': {
      const archived = Boolean(form.get('archived'));
      await event.update({ archived });
      return toast('success', `Event ${archived ? 'archived' : 'restored'}.`);
    }
  }
  return json(null);
};

export default function EventGeneralSettingsRoute() {
  const { event } = useEvent();
  const errors = useActionData<typeof action>();

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>General</H2>
        </Card.Title>

        <Card.Content>
          <Form id="general-form" method="POST" className="space-y-4 lg:space-y-6">
            <EventForm initialValues={event} errors={errors} />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" name="intent" value="general" form="general-form">
            Update event
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Event details</H2>
          <Subtitle>
            Provide details about the event, like address, dates and description to generate the event page.
          </Subtitle>
        </Card.Title>

        <Card.Content>
          <EventDetailsForm
            type={event.type}
            timezone={event.timezone}
            conferenceStart={event.conferenceStart}
            conferenceEnd={event.conferenceEnd}
            onlineEvent={event.onlineEvent}
            location={event.location}
            description={event.description}
            websiteUrl={event.websiteUrl}
            contactEmail={event.contactEmail}
            errors={errors}
          />
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="details" form="details-form">
            Update event details
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Archiving</H2>
        </Card.Title>

        <Card.Content>
          <Callout title="Be careful">
            Archived events are not displayed anymore in the team list and in the Conference Hall search. Nothing is
            deleted, you can restore them when you want.
          </Callout>
        </Card.Content>

        <Card.Actions>
          <Form method="POST">
            <input type="hidden" name="archived" value={event.archived ? '' : 'true'} />
            <Button
              type="submit"
              variant="secondary"
              name="intent"
              value="archive"
              iconLeft={event.archived ? ArchiveBoxXMarkIcon : ArchiveBoxArrowDownIcon}
            >
              {event.archived ? 'Restore event' : 'Archive event'}
            </Button>
          </Form>
        </Card.Actions>
      </Card>
    </>
  );
}
