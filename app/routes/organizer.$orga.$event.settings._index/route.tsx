import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { EventForm } from '~/shared-components/events/EventForm';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { EventDetailsSettingsSchema } from './types/event-details-settings.schema';
import { EventGeneralSettingsSchema } from './types/event-general-settings.schema';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  if (action === 'general') {
    const result = await withZod(EventGeneralSettingsSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    const updated = await updateEvent(params.orga, params.event, uid, result.data);
    if (updated.slug) throw redirect(`/organizer/${params.orga}/${updated.slug}/settings`);
    return json({ slug: updated.error });
  } else if (action === 'details') {
    const result = await withZod(EventDetailsSettingsSchema).validate(form);
    if (result.error) return json(result.error?.fieldErrors);
    await updateEvent(params.orga, params.event, uid, result.data);
  }
  return json(null);
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const errors = useActionData<typeof action>() as Record<string, string>;

  return (
    <>
      <section>
        <H2>General</H2>
        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="_action" value="general" />
          <EventForm initialValues={event} errors={errors} />
          <Button type="submit">Update event</Button>
        </Form>
      </section>
      <section>
        <H2>Event details</H2>
        <Text type="secondary">
          Provide details about the event, like address, dates and description to generate the event page.
        </Text>
        <Form method="post" className="mt-6 space-y-4">
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
          <Button type="submit">Update event details</Button>
        </Form>
      </section>
    </>
  );
}
