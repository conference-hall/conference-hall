import { Outlet } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { TeamSettings } from '~/features/team-management/settings/services/team-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/layout.ts';
import { CurrentTeamProvider } from './team-context.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `New event | ${args.data?.name} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return TeamSettings.for(userId, params.team).get();
};

export default function EventCreationLayout({ loaderData: team }: Route.ComponentProps) {
  return (
    <FullscreenPage navbar="default" compact>
      <CurrentTeamProvider team={team}>
        <Outlet />
      </CurrentTeamProvider>
    </FullscreenPage>
  );
}
