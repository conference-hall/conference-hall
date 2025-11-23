import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { NavbarTeam } from '~/app-platform/components/navbar/navbar-team.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Badge } from '~/design-system/badges.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { CurrentTeamProvider } from '~/features/team-management/team-context.tsx';
import { getProtectedSession, protectedRouteMiddleware } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/layout.ts';
import { TeamFetcher } from './services/team-fetcher.server.ts';

export const middleware = [protectedRouteMiddleware];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.name} | Conference Hall` }]);
};

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  return TeamFetcher.for(userId, params.team).get();
};

export default function TeamLayout({ loaderData: team }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <CurrentTeamProvider team={team}>
      <NavbarTeam />

      <Page.NavHeader className="flex items-center justify-between">
        <NavTabs py={4} scrollable>
          <NavTab to={href('/team/:team', { team: team.slug })} icon={StarIcon} end>
            {t('common.events')}
          </NavTab>
          <NavTab to={href('/team/:team/settings', { team: team.slug })} icon={Cog6ToothIcon}>
            {t('common.settings')}
          </NavTab>
        </NavTabs>
        <div className="hidden md:inline-flex">
          <Badge color="blue">{t(`common.member.role.label.${team.userRole}`)}</Badge>
        </div>
      </Page.NavHeader>

      <Outlet />
    </CurrentTeamProvider>
  );
}
