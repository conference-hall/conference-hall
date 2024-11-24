import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { EventPage } from '~/.server/event-page/event-page.ts';

// Redirect Conference Hall beta event URLs
export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.legacyId, 'Invalid legacy id');

  const event = await EventPage.getByLegacyId(params.legacyId);

  return redirect(`/${event.slug}`, 301);
};

export default function RedirectLegacyRoute() {
  return null;
}
