import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const orgaSlug = params.slug!;
  const eventSlug = params.eventSlug!;
  return json({ uid, orgaSlug, eventSlug });
};

export default function OrganizationEventsRoute() {
  return <Container className="my-4 sm:my-8">Event</Container>;
}
