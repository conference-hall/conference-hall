import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/layouts/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { useActionData, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';
import { createEvent } from './server/create-event.server';
import { CreateEventForm } from './components/CreateEventForm';
import { EventTypeSelection } from './components/EventTypeSelection';
import { EventCreateSchema } from './types/event-create.schema';

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
        <EventTypeSelection />
      )}
    </Container>
  );
}
