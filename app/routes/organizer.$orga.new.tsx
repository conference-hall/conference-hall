import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { H1, H2, Text } from '~/design-system/Typography';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { MegaphoneIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { EventInfoForm } from '~/components/organizer-event/EventInfoForm';
import { CardLink } from '~/design-system/Card';
import { withZod } from '@remix-validated-form/with-zod';
import { EventCreateSchema } from '~/schemas/event';
import { getUserRole } from '~/services/organization/get-user-role.server';
import { createEvent } from '~/services/organizer-event/create-event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const role = await getUserRole(params.orga, uid);
  if (role !== 'OWNER') throw redirect(`/organizer/${params.orga}`);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  const form = await request.formData();

  const result = await withZod(EventCreateSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  } else {
    const updated = await createEvent(params.orga, uid, result.data);
    if (updated.slug) throw redirect(`/organizer/${params.orga}/${updated.slug}/settings`);
    return json(updated.error?.fieldErrors);
  }
};

export default function NewEventRoute() {
  const [searchParams] = useSearchParams();
  const errors = useActionData<typeof action>();
  const type = searchParams.get('type');
  return (
    <Container className="max-w-5xl">
      {type === 'CONFERENCE' || type === 'MEETUP' ? (
        <CreateEventForm type={type} errors={errors} />
      ) : (
        <SelectEventType />
      )}
    </Container>
  );
}

function SelectEventType() {
  return (
    <Container className="mt-16 flex flex-col items-center gap-16">
      <H1 className="text-center">Select an event type</H1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <CardLink to={{ pathname: '.', search: '?type=CONFERENCE' }} className="flex gap-8 p-8 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <MegaphoneIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H2>New conference</H2>
            <Text variant="secondary">
              Conferences are open to proposals for a time limited period. You can also make the conference public or
              private.
            </Text>
          </span>
        </CardLink>
        <CardLink to={{ pathname: '.', search: '?type=MEETUP' }} className="flex gap-8 p-8 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H2>New meetup</H2>
            <Text variant="secondary">
              Meetup are open to proposals all the year. You can manually open or close the call for paper. You can also
              make the meetup public or private.
            </Text>
          </span>
        </CardLink>
      </div>
      <ButtonLink to=".." variant="secondary">
        Cancel
      </ButtonLink>
    </Container>
  );
}

function CreateEventForm({ type, errors }: { type: string; errors?: Record<string, string> }) {
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
        <EventInfoForm errors={errors} />
        <input name="type" type="hidden" value={type} />
        <div className="flex justify-end gap-2">
          <ButtonLink to="." variant="secondary">
            Cancel
          </ButtonLink>
          <Button>Create and configure event</Button>
        </div>
      </Form>
    </>
  );
}
