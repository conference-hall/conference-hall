import { redirect } from 'react-router';
import { EventPage } from '~/.server/event-page/event-page.ts';
import type { Route } from './+types/public.event.$legacyId.ts';

// Redirect Conference Hall beta event URLs
export const loader = async ({ params }: Route.LoaderArgs) => {
  const event = await EventPage.getByLegacyId(params.legacyId);
  throw redirect(`/${event.slug}`, 301);
};

export default function RedirectLegacyRoute() {
  return null;
}
