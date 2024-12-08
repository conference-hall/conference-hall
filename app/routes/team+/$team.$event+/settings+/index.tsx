import { parseWithZod } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { Form, redirect } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventDetailsSettingsSchema, EventGeneralSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/__components/contexts/event-team-context';
import { EventDetailsForm } from '~/routes/__components/events/event-details-form.tsx';
import { EventForm } from '~/routes/__components/events/event-form.tsx';
import type { Route } from './+types/index.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'general': {
      const result = parseWithZod(form, { schema: EventGeneralSettingsSchema });
      if (result.status !== 'success') return result.error;
      let updated = null;
      try {
        updated = await event.update(result.value);
      } catch (_error) {
        return { slug: ['This URL already exists, please try another one.'] } as Record<string, string[]>;
      }
      const headers = await toastHeaders('success', 'Event saved.');
      throw redirect(`/team/${params.team}/${updated.slug}/settings`, { headers });
    }
    case 'details': {
      const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', 'Event details saved.');
    }
    case 'archive': {
      const archived = Boolean(form.get('archived'));
      await event.update({ archived });
      return toast('success', `Event ${archived ? 'archived' : 'restored'}.`);
    }
  }
  return null;
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const currentEvent = useCurrentEvent();

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>General</H2>
        </Card.Title>

        <Card.Content>
          <Form id="general-form" method="POST" className="space-y-4 lg:space-y-6">
            <EventForm initialValues={currentEvent} errors={errors} />
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
            type={currentEvent.type}
            timezone={currentEvent.timezone}
            conferenceStart={currentEvent.conferenceStart}
            conferenceEnd={currentEvent.conferenceEnd}
            onlineEvent={currentEvent.onlineEvent}
            location={currentEvent.location}
            description={currentEvent.description}
            websiteUrl={currentEvent.websiteUrl}
            contactEmail={currentEvent.contactEmail}
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
            <input type="hidden" name="archived" value={currentEvent.archived ? '' : 'true'} />
            <Button
              type="submit"
              variant={currentEvent.archived ? 'secondary' : 'important'}
              name="intent"
              value="archive"
              iconLeft={currentEvent.archived ? ArchiveBoxXMarkIcon : ArchiveBoxArrowDownIcon}
            >
              {currentEvent.archived ? 'Restore event' : 'Archive event'}
            </Button>
          </Form>
        </Card.Actions>
      </Card>
    </>
  );
}
