import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { requireSession } from '~/libs/auth/session.ts';
import { updateEvent } from '~/routes/__server/teams/update-event.server.ts';

import { useTeamEvent } from '../_layout.tsx';
import { ApiTryoutSection } from './__components/ApiTryoutSection.tsx';
import { EnableApiSection } from './__components/EnableApiSection.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
  const { event } = useTeamEvent();

  return (
    <>
      <EnableApiSection apiKey={event.apiKey} />
      {event.apiKey && <ApiTryoutSection slug={event.slug} apiKey={event.apiKey} />}
    </>
  );
}