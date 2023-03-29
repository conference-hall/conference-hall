import invariant from 'tiny-invariant';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useParams } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { NavMenu } from '~/design-system/NavMenu';
import { sessionRequired } from '~/libs/auth/auth.server';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  const role = await getUserRole(params.orga, uid);
  if (role !== 'OWNER') throw redirect(`/organizer/${params.orga}/${params.event}/proposals`);
  return null;
};

const getMenuItems = (orga?: string, event?: string) => [
  { to: `/organizer/${orga}/${event}/emails`, icon: ShieldCheckIcon, label: 'Acceptation campaign' },
  { to: `/organizer/${orga}/${event}/emails/rejected`, icon: ShieldExclamationIcon, label: 'Rejection campaign' },
];

export default function EventProposalEmails() {
  const params = useParams();
  const menus = getMenuItems(params.orga, params.event);

  return (
    <Container className="my-4 flex flex-col gap-8 sm:my-12">
      <h1 className="sr-only">Emails campaign</h1>
      <div className="sm:grid sm:grid-cols-12 sm:gap-x-12">
        <NavMenu aria-label="Emails campaign menu" items={menus} className="px-2 py-6 sm:col-span-3 sm:px-0 sm:py-0" />

        <div className="sm:col-span-9 sm:px-0">
          <Outlet />
        </div>
      </div>
    </Container>
  );
}
