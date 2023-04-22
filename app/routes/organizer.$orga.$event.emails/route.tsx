import invariant from 'tiny-invariant';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { requireSession } from '~/libs/auth/cookies';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';
import { H2 } from '~/design-system/Typography';
import { useUser } from '~/root';
import { useOrganization } from '../organizer.$orga/route';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  const role = await getUserRole(params.orga, uid);
  if (role !== 'OWNER') return redirect(`/organizer/${params.orga}/${params.event}/proposals`);
  return null;
};

const getMenuItems = (orga?: string, event?: string) => [
  { to: `/organizer/${orga}/${event}/emails`, icon: ShieldCheckIcon, label: 'Acceptation campaign' },
  { to: `/organizer/${orga}/${event}/emails/rejected`, icon: ShieldExclamationIcon, label: 'Rejection campaign' },
];

export default function EventProposalEmails() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { event } = useOrganizerEvent();

  const menus = getMenuItems(organization.slug, event.slug);

  return (
    <Container className="mt-4 flex gap-8 sm:mt-8">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu aria-label="Emails campaign menu" items={menus} className="sticky top-4 w-72 self-start" />

      <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
        <Outlet context={{ user, organization, event }} />
      </div>
    </Container>
  );
}
