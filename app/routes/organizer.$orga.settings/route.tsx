import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { requireSession } from '~/libs/auth/session';
import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { H2 } from '~/design-system/Typography';
import { useUser } from '~/root';
import { useOrganization } from '../organizer.$orga/route';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';
import { OrganizationRole } from '@prisma/client';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  await allowedForOrga(params.orga, userId, [OrganizationRole.OWNER]);
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
