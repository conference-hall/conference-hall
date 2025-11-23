import { Outlet } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { TeamFetcher } from '~/features/team-management/services/team-fetcher.server.ts';
import { getProtectedSession, protectedRouteMiddleware } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/layout.ts';
import { CurrentTeamProvider } from './team-context.tsx';

export const middleware = [protectedRouteMiddleware];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `New event | ${args.data?.name} | Conference Hall` }]);
};

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  return TeamFetcher.for(userId, params.team).get();
};

export default function EventCreationLayout({ loaderData: team }: Route.ComponentProps) {
  return (
    <FullscreenPage compact>
      <CurrentTeamProvider team={team}>
        <Outlet />
      </CurrentTeamProvider>
    </FullscreenPage>
  );
}
