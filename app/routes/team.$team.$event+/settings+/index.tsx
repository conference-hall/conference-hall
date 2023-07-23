import { parse } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventForm } from '~/components/events/EventForm';
import { AlertInfo } from '~/design-system/Alerts';
import { Button } from '~/design-system/Buttons';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { Input } from '~/design-system/forms/Input';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { Card } from '~/design-system/layouts/Card';
import { H2, Subtitle } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { updateEvent } from '~/server/teams/update-event.server';

import { useOrganizerEvent } from '../_layout';
import { EventDetailsSettingsSchema } from './types/event-details-settings.schema';
import { EventGeneralSettingsSchema } from './types/event-general-settings.schema';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'general': {
      const result = parse(form, { schema: EventGeneralSettingsSchema });
      if (!result.value) return json(result.error);

      const updated = await updateEvent(params.event, userId, result.value);
      if (!updated.slug) return json({ slug: updated.error });

      return redirect(`/team/${params.team}/${updated.slug}/settings`, await addToast(request, 'Event saved.'));
    }
    case 'details': {
      const result = parse(form, { schema: EventDetailsSettingsSchema });
      if (!result.value) return json(result.error);

      await updateEvent(params.event, userId, result.value);
      return json(null, await addToast(request, 'Event details saved.'));
    }
    case 'archive': {
      const archived = Boolean(form.get('archived'));
      await updateEvent(params.event, userId, { archived });
      return json(null, await addToast(request, `Event ${archived ? 'archived' : 'restored'}.`));
    }
  }
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData();

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
