import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { requireSession } from '~/libs/auth/session';
import { updateEvent } from '~/server/teams/update-event.server';

import { useOrganizerEvent } from '../team.$team.$event/route';
import { ApiTryoutSection } from './components/ApiTryoutSection';
import { EnableApiSection } from './components/EnableApiSection';

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
    case 'revoke-api-key': {
      await updateEvent(params.event, userId, { apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await updateEvent(params.event, userId, { apiKey: uuid() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { event } = useOrganizerEvent();

  return (
    <>
      <EnableApiSection apiKey={event.apiKey} />
      {event.apiKey && <ApiTryoutSection slug={event.slug} apiKey={event.apiKey} />}
    </>
  );
}
