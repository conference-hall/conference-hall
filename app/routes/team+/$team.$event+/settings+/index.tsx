import { parse } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AlertInfo } from '~/design-system/Alerts.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { UserEvent } from '~/domains/organizer-event-settings/UserEvent.ts';
import {
  EventDetailsSettingsSchema,
  EventGeneralSettingsSchema,
} from '~/domains/organizer-event-settings/UserEvent.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { EventForm } from '~/routes/__components/events/EventForm.tsx';

import { useTeamEvent } from '../_layout.tsx';

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
  const action = form.get('_action');
  switch (action) {
    case 'general': {
      const result = parse(form, { schema: EventGeneralSettingsSchema });
      if (!result.value) return json(result.error);

      try {
        const updated = await event.update(result.value);
        return redirectWithToast(`/team/${params.team}/${updated.slug}/settings`, 'success', 'Event saved.');
      } catch (SlugAlreadyExistsError) {
        return json({ slug: ['This URL already exists, please try another one.'] } as Record<string, string[]>);
      }
    }
    case 'details': {
      const result = parse(form, { schema: EventDetailsSettingsSchema });
      if (!result.value) return json(result.error);

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
  const { event } = useTeamEvent();
  const errors = useActionData<typeof action>();

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>General</H2>
        </Card.Title>

        <Form method="POST">
          <Card.Content>
            <input type="hidden" name="_action" value="general" />
            <EventForm initialValues={event} errors={errors} />
          </Card.Content>
          <Card.Actions>
            <Button type="submit">Update event</Button>
          </Card.Actions>
        </Form>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Event details</H2>
          <Subtitle>
            Provide details about the event, like address, dates and description to generate the event page.
          </Subtitle>
        </Card.Title>

        <Form method="POST">
          <Card.Content>
            <input type="hidden" name="_action" value="details" />
            {event.type === 'CONFERENCE' && (
              <DateRangeInput
                start={{ name: 'conferenceStart', label: 'Start date', value: event?.conferenceStart }}
                end={{ name: 'conferenceEnd', label: 'End date', value: event?.conferenceEnd }}
                error={errors?.conferenceStart}
              />
            )}
            <Input
              name="address"
              label="Venue address or city"
              autoComplete="off"
              defaultValue={event?.address || ''}
              error={errors?.address}
            />
            <MarkdownTextArea
              name="description"
              label="Description"
              defaultValue={event?.description || ''}
              rows={5}
              autoComplete="off"
              error={errors?.description}
            />
            <Input
              name="websiteUrl"
              label="Website URL"
              defaultValue={event.websiteUrl || ''}
              error={errors?.websiteUrl}
            />
            <Input
              name="contactEmail"
              label="Contact email"
              defaultValue={event.contactEmail || ''}
              error={errors?.contactEmail}
            />
          </Card.Content>

          <Card.Actions>
            <Button type="submit">Update event details</Button>
          </Card.Actions>
        </Form>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Archiving</H2>
        </Card.Title>

        <Card.Content>
          <AlertInfo>
            Archived events are not displayed anymore in the team list and in the Conference Hall search. Nothing is
            deleted, you can restore them when you want.
          </AlertInfo>
        </Card.Content>

        <Card.Actions>
          <Form method="POST">
            <input type="hidden" name="_action" value="archive" />
            <input type="hidden" name="archived" value={event.archived ? '' : 'true'} />
            <Button
              type="submit"
              variant="secondary"
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
