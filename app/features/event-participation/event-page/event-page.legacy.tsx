import { redirect } from 'react-router';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import type { Route } from './+types/event-page.legacy.ts';

// Redirect Conference Hall beta event URLs
export const loader = async ({ params }: Route.LoaderArgs) => {
  const event = await EventPage.getByLegacyId(params.legacyId);
  return redirect(`/${event.slug}`, 301);
};

export default function RedirectLegacyRoute() {
  return null;
}
