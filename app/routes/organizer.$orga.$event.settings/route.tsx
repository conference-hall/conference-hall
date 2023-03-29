import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useOutletContext, useParams } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { NavMenu } from '~/design-system/NavMenu';
import { sessionRequired } from '~/libs/auth/auth.server';
import {
  CodeBracketIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  EnvelopeIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
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
  { to: `/organizer/${orga}/${event}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/organizer/${orga}/${event}/settings/customize`, icon: PaintBrushIcon, label: 'Customize' },
  { to: `/organizer/${orga}/${event}/settings/tracks`, icon: SwatchIcon, label: 'Tracks' },
  { to: `/organizer/${orga}/${event}/settings/cfp`, icon: PaperAirplaneIcon, label: 'Call for paper' },
  { to: `/organizer/${orga}/${event}/settings/survey`, icon: QuestionMarkCircleIcon, label: 'Speaker survey' },
  { to: `/organizer/${orga}/${event}/settings/review`, icon: StarIcon, label: 'Proposals review' },
  { to: `/organizer/${orga}/${event}/settings/notifications`, icon: EnvelopeIcon, label: 'Email notifications' },
  { to: `/organizer/${orga}/${event}/settings/integrations`, icon: CpuChipIcon, label: 'Slack integration' },
  { to: `/organizer/${orga}/${event}/settings/api`, icon: CodeBracketIcon, label: 'Web API' },
];

export default function OrganizationSettingsRoute() {
  const params = useParams();
  const menus = getMenuItems(params.orga, params.event);
  const { event } = useOutletContext<OrganizerEventContext>();

  return (
    <Container className="my-4 sm:my-12">
      <h1 className="sr-only">Settings</h1>
      <div className="sm:grid sm:grid-cols-12 sm:gap-x-12">
        <NavMenu aria-label="Event settings menu" items={menus} className="px-2 py-6 sm:col-span-3 sm:px-0 sm:py-0" />

        <div className="space-y-16 sm:col-span-9 sm:px-0">
          <Outlet context={{ event }} />
        </div>
      </div>
    </Container>
  );
}
