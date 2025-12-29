import { Outlet } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { TeamFetcher } from '~/features/team-management/services/team-fetcher.server.ts';
import { requiredAuthMiddleware } from '~/shared/auth/auth.middleware.ts';
import { AuthorizedTeamContext, requireAuthorizedTeam } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/layout.ts';
import { CurrentTeamProvider } from './team-context.tsx';

export const middleware = [requiredAuthMiddleware, requireAuthorizedTeam];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `New event | ${args.loaderData?.name} | Conference Hall` }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedTeam = context.get(AuthorizedTeamContext);
  return TeamFetcher.for(authorizedTeam).get();
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
