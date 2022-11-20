import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import type { OrganizerEventContext } from '../../$eventSlug';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { EventInfoForm } from '~/components/organizer-event/EventInfoForm';
import { withZod } from '@remix-validated-form/with-zod';
import { EventDetailsSettingsSchema, EventGeneralSettingsSchema } from '~/schemas/event';
import { updateEvent } from '~/services/organizer-event/update-event.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const action = form.get('_action');

  if (action === 'general') {
    const result = await withZod(EventGeneralSettingsSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    const updated = await updateEvent(slug!, eventSlug!, uid, result.data);
    if (updated.slug) return redirect(`/organizer/${slug}/${updated.slug}/settings`);
    return json(updated?.error?.fieldErrors);
  } else if (action === 'details') {
    const result = await withZod(EventDetailsSettingsSchema).validate(form);
    if (result.error) return json(result.error?.fieldErrors);
    await updateEvent(slug!, eventSlug!, uid, result.data);
  }
  return json(null);
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const errors = useActionData<typeof action>();

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">General</H2>
        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="_action" value="general" />
          <EventInfoForm initialValues={event} errors={errors} />
          <Button type="submit">Update event</Button>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-4">Event details</H2>
        <Text variant="secondary" className="mt-4">
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
