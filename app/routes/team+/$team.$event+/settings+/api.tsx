import { v4 as uuid } from 'uuid';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import type { Route } from './+types/api.ts';
import { ApiTryoutSection } from './components/api-tryout-section.tsx';
import { EnableApiSection } from './components/enable-api-section.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
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
