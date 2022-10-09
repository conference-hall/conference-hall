import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useParams } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { NavMenu } from '~/design-system/NavMenu';
import { sessionRequired } from '~/services/auth/auth.server';
import { getUserRole } from '~/services/organizers/organizations.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const role = await getUserRole(slug!, uid);
  if (role !== 'OWNER') throw redirect(`/organizer/${slug}/${eventSlug}/proposals`);
  return null;
};

const getMenuItems = (orga: string, event: string) => [
  { to: `/organizer/${orga}/${event}/emails`, icon: ShieldCheckIcon, label: 'Acceptation campaign' },
  { to: `/organizer/${orga}/${event}/emails/rejected`, icon: ShieldExclamationIcon, label: 'Rejection campaign' },
];

export default function EventProposalEmails() {
  const { slug, eventSlug } = useParams();
  const menus = getMenuItems(slug!, eventSlug!);

  return (
    <Container className="my-4 flex flex-col gap-8 sm:my-12">
      <h1 className="sr-only">Emails campaign</h1>
      <div className="sm:grid sm:grid-cols-12 sm:gap-x-12">
        <NavMenu aria-label="Emails campaign menu" items={menus} className="py-6 px-2 sm:col-span-3 sm:py-0 sm:px-0" />

        <div className="sm:col-span-9 sm:px-0">
          <Outlet />
        </div>
      </div>
    </Container>
  );
}
