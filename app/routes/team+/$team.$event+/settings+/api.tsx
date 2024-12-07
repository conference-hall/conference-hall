import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { useCurrentEvent } from '~/routes/__components/contexts/event-team-context.tsx';
import { ApiTryoutSection } from './__components/api-tryout-section.tsx';
import { EnableApiSection } from './__components/enable-api-section.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const intent = form.get('intent');

  const event = UserEvent.for(userId, params.team, params.event);
  switch (intent) {
    case 'revoke-api-key': {
      await event.update({ apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await event.update({ apiKey: uuid() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { slug, apiKey } = useCurrentEvent();

  return (
    <>
      <EnableApiSection apiKey={apiKey} />
      {apiKey && <ApiTryoutSection slug={slug} apiKey={apiKey} />}
    </>
  );
}
