import { parseWithZod } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { Form, redirect } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventDetailsSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { EventDetailsForm } from '~/routes/components/events/event-details-form.tsx';
import { EventForm } from '~/routes/components/events/event-form.tsx';
import { DeleteModalButton } from '~/routes/components/modals/delete-modal.tsx';
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
      const schema = await event.buildGeneralSettingsSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;
      const updated = await event.update(result.value);
      const headers = await toastHeaders('success', 'Event saved.');
      return redirect(`/team/${params.team}/${updated.slug}/settings`, { headers });
    }
    case 'details': {
      const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', 'Event details saved.');
    }
    case 'archive-event': {
      const archived = Boolean(form.get('archived'));
      await event.update({ archived });
      return toast('success', `Event ${archived ? 'archived' : 'restored'}.`);
    }
    case 'delete-event': {
      await event.delete();
      const headers = await toastHeaders('success', 'Event deleted.');
      return redirect(`/team/${params.team}`, { headers });
    }
  }
  return null;
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const currentEvent = useCurrentEvent();
  const { userPermissions } = useCurrentTeam();

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

      <Card as="section" className="border-red-300">
        <Card.Title>
          <H2>Danger zone</H2>
        </Card.Title>

        <ul className="divide-y border-t mt-8">
          <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="space-y-1 grow">
              <Text weight="semibold">{currentEvent.archived ? 'Restore this event' : 'Archive this event'}</Text>
              <Subtitle>
                Archived events are not displayed anymore in the team list and in the Conference Hall search. Nothing is
                deleted, you can restore them when you want.
              </Subtitle>
            </div>
            <Form method="POST" className="w-full sm:w-auto">
              <input type="hidden" name="archived" value={currentEvent.archived ? '' : 'true'} />
              <Button
                type="submit"
                name="intent"
                value="archive-event"
                variant={currentEvent.archived ? 'secondary' : 'important'}
                iconLeft={currentEvent.archived ? ArchiveBoxXMarkIcon : ArchiveBoxArrowDownIcon}
                className="w-full"
              >
                {currentEvent.archived ? 'Restore event' : 'Archive event'}
              </Button>
            </Form>
          </li>
          {userPermissions.canDeleteEvent ? (
            <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-1 grow">
                <Text weight="semibold">Delete this event</Text>
                <Subtitle>
                  This will <strong>permanently delete the "{currentEvent.name}"</strong> event, speakers proposals,
                  reviews, comments, schedule, and settings. This action cannot be undone.
                </Subtitle>
              </div>
              <DeleteModalButton
                intent="delete-event"
                title="Delete event"
                description={`This will permanently delete the "${currentEvent.name}" event, speakers proposals,
              reviews, comments, schedule, and settings. This action cannot be undone.`}
                confirmationText={currentEvent.slug}
              />
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
