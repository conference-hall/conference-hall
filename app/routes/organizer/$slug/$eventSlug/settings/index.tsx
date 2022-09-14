import { useState } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import slugify from '@sindresorhus/slugify';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import type { OrganizerEventContext } from '../../$eventSlug';
import EventVisibilityRadioGroup from '~/components/event-forms/EventVisibilityRadioGroup';
import { updateEvent, validateEventDetailsInfo, validateEventGeneralInfo } from '~/services/organizers/event.server';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const action = form.get('_action');

  if (action === 'general') {
    const result = validateEventGeneralInfo(form);
    if (!result.success) return json(result.error.flatten());
    const updated = await updateEvent(slug!, eventSlug!, uid, result.data);
    if (updated.slug) throw redirect(`/organizer/${slug}/${updated.slug}/settings`);
    return json(updated);
  } else if (action === 'details') {
    const result = validateEventDetailsInfo(form);
    if (!result.success) return json(result.error.flatten());
    await updateEvent(slug!, eventSlug!, uid, result.data);
  }
  return null;
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const result = useActionData();
  const [name, setName] = useState<string>(event?.name || '');
  const [slug, setSlug] = useState<string>(event?.slug || '');

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">General</H2>
        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="_action" value="general" />
          <Input
            name="name"
            label="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(slugify(e.target.value.toLowerCase()));
            }}
            autoComplete="off"
            required
            error={result?.fieldErrors?.name?.[0]}
          />
          <Input
            name="slug"
            label="Event URL"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
            }}
            autoComplete="off"
            required
            error={result?.fieldErrors?.slug?.[0]}
          />
          <EventVisibilityRadioGroup defaultValue={event?.visibility} />
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
              error={result?.fieldErrors?.conferenceStart?.[0]}
            />
          )}
          <Input
            name="address"
            label="Venue address or city"
            autoComplete="off"
            defaultValue={event?.address ?? ''}
            error={result?.fieldErrors?.address?.[0]}
          />
          <MarkdownTextArea
            name="description"
            label="Description"
            defaultValue={event?.description}
            required
            rows={5}
            autoComplete="off"
            error={result?.fieldErrors?.description?.[0]}
          />
          <Input
            name="websiteUrl"
            label="Website URL"
            defaultValue={event.websiteUrl || ''}
            error={result?.fieldErrors?.websiteUrl?.[0]}
          />
          <Input
            name="contactEmail"
            label="Contact email"
            defaultValue={event.contactEmail || ''}
            error={result?.fieldErrors?.contactEmail?.[0]}
          />
          <Button type="submit">Update event details</Button>
        </Form>
      </section>
    </>
  );
}
