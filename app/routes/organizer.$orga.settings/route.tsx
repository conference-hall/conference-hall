import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { requireSession } from '~/libs/auth/cookies';
import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';
import { H2 } from '~/design-system/Typography';
import { useUser } from '~/root';
import { useOrganization } from '../organizer.$orga/route';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const role = await getUserRole(params.orga, uid);
  if (role !== 'OWNER') return redirect(`/organizer/${params.orga}`);
  return null;
};

const getMenuItems = (orga?: string) => [
  { to: `/organizer/${orga}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/organizer/${orga}/settings/members`, icon: UserGroupIcon, label: 'Members' },
];

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { organization } = useOrganization();

  const menus = getMenuItems(organization.slug);

  return (
    <Container className="mt-4 flex gap-8 sm:mt-8">
      <H2 srOnly>Organization settings</H2>

      <NavSideMenu aria-label="Organization settings menu" items={menus} className="sticky top-4 self-start" />

      <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
        <Outlet context={{ user, organization }} />
      </div>
    </Container>
  );
}
