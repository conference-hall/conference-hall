import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { requireSession } from '~/libs/auth/session';
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
import { H2 } from '~/design-system/Typography';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { useUser } from '~/root';
import { useOrganization } from '../organizer.$orga/route';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { OrganizationRole } from '@prisma/client';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  await allowedForEvent(params.event, userId, [OrganizationRole.OWNER]);
  return null;
};

const getMenuItems = (orga?: string, event?: string) => [
  { to: `/organizer/${orga}/${event}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/organizer/${orga}/${event}/settings/cfp`, icon: PaperAirplaneIcon, label: 'Call for paper' },
  { to: `/organizer/${orga}/${event}/settings/tracks`, icon: SwatchIcon, label: 'Tracks' },
  { to: `/organizer/${orga}/${event}/settings/customize`, icon: PaintBrushIcon, label: 'Customize' },
  { to: `/organizer/${orga}/${event}/settings/survey`, icon: QuestionMarkCircleIcon, label: 'Speaker survey' },
  { to: `/organizer/${orga}/${event}/settings/review`, icon: StarIcon, label: 'Proposals review' },
  { to: `/organizer/${orga}/${event}/settings/notifications`, icon: EnvelopeIcon, label: 'Email notifications' },
  { to: `/organizer/${orga}/${event}/settings/integrations`, icon: CpuChipIcon, label: 'Slack integration' },
  { to: `/organizer/${orga}/${event}/settings/api`, icon: CodeBracketIcon, label: 'Web API' },
];

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { event } = useOrganizerEvent();

  const menus = getMenuItems(organization.slug, event.slug);

  return (
    <Container className="mt-4 flex gap-8 sm:mt-8">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu aria-label="Event settings menu" items={menus} className="sticky top-4 self-start" />

      <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
        <Outlet context={{ user, organization, event }} />
      </div>
    </Container>
  );
}
