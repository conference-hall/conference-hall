import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { getProtectedSession, protectedRouteMiddleware } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/team-invitation.ts';
import { TeamMemberInvite } from './services/team-member-invite.server.ts';

export const middleware = [protectedRouteMiddleware];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Team invitation | Conference Hall' }]);
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const team = await TeamMemberInvite.with(params.code).check();
  return { name: team.name };
};

export const action = async ({ params, context }: Route.ActionArgs) => {
  const { userId } = getProtectedSession(context);
  const team = await TeamMemberInvite.with(params.code).addMember(userId);
  return redirect(href('/team/:team', { team: team.slug }));
};

export default function InvitationRoute({ loaderData: team }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <FullscreenPage className="text-center">
      <Card className="p-8 md:p-16 space-y-16">
        <div className="space-y-6">
          <H1 size="3xl" weight="bold">
            {team.name}
          </H1>
          <Subtitle>{t('team.invitation.description', { team: team.name })}</Subtitle>
        </div>

        <Form method="POST">
          <Button type="submit">{t('common.accept-invitation')}</Button>
        </Form>
      </Card>
    </FullscreenPage>
  );
}
