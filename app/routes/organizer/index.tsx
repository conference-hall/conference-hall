import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1 } from '~/design-system/Typography';
import { hasOrganizerAccess } from '~/services/organizers/access';
import { getOrganizations } from '~/services/organizers/organizations';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await sessionRequired(request);
  const hasAccess = await hasOrganizerAccess(uid);
  if (!hasAccess) return redirect('/organizer/request');

  const organizations = await getOrganizations(uid);
  if (organizations.length === 0) return redirect('/organizer/welcome');
  if (organizations.length === 1) return redirect('/organizer/slug');

  return organizations;
};

export default function OrganizerRoute() {
  return (
    <Container className="my-4 sm:my-8">
      <H1>My organizations</H1>
    </Container>
  );
}
