import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { createOrganization, validateOrganizationData } from '~/services/organizers/organizations.server';
import { Form, useParams } from '@remix-run/react';
import { H1, H3, Text } from '~/design-system/Typography';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { MegaphoneIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { EventInfoForm } from '~/components/event-forms/EventInfoForm';
import { useState } from 'react';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const result = validateOrganizationData(form);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const updated = await createOrganization(uid, result.data);
    if (updated?.fieldErrors) return json(updated);
    throw redirect(`/organizer/${updated.slug}`);
  }
};

export default function NewEventRoute() {
  const [type, setType] = useState<'CONFERENCE' | 'MEETUP' | null>(null);

  return (
    <Container className="max-w-5xl">
      {!type ? <SelectEventType onSelect={setType} /> : <CreateEventForm type={type} />}
    </Container>
  );
}

function SelectEventType({ onSelect }: { onSelect: (type: 'CONFERENCE' | 'MEETUP') => void }) {
  const { slug } = useParams();
  return (
    <>
      <div className="mt-8 flex flex-col items-center gap-8">
        <H1 className="my-8 text-center">Select an event type</H1>
        <Button variant="secondary" onClick={() => onSelect('CONFERENCE')} className="flex gap-8 p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <MegaphoneIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H3>Conference</H3>
            <Text variant="secondary">
              Conferences are open to proposals for a time limited period. You can also make the conference public or
              private.
            </Text>
          </span>
        </Button>
        <Button variant="secondary" onClick={() => onSelect('MEETUP')} className="flex gap-8 p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H3>Meetup</H3>
            <Text variant="secondary">
              Meetup are open to proposals all the year. You can manually open or close the call for paper. You can also
              make the meetup public or private.
            </Text>
          </span>
        </Button>
        <ButtonLink to={`/organizer/${slug}`} className="mt-4" variant="secondary">
          Go back
        </ButtonLink>
      </div>
    </>
  );
}

function CreateEventForm({ type }: { type: 'CONFERENCE' | 'MEETUP' }) {
  const { slug } = useParams();
  return (
    <>
      <div className="mt-12 mb-12 space-y-6 text-center">
        <H1>{`Create a new ${type?.toLowerCase()}`}</H1>
        <Text variant="secondary">
          Provide main information about your event and it's visibility in Conference Hall.
        </Text>
      </div>
      <Form
        method="post"
        className="space-y-8 border border-gray-200 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md"
      >
        <EventInfoForm type={type} />
        <input name="type" type="hidden" value={type || ''} />
        <div className="flex justify-end gap-2">
          <ButtonLink to={`/organizer/${slug}`} variant="secondary">
            Cancel
          </ButtonLink>
          <Button>Create and configure event</Button>
        </div>
      </Form>
    </>
  );
}
