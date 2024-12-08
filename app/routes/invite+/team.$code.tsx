import { Form, redirect } from 'react-router';
import { TeamMemberInvite } from '~/.server/team/team-member-invite.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import type { Route } from './+types/team.$code.ts';

export const meta = () => [{ title: 'Team invitation | Conference Hall' }];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireSession(request);
  const team = await TeamMemberInvite.with(params.code).check();
  return { name: team.name };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const team = await TeamMemberInvite.with(params.code).addMember(userId);
  throw redirect(`/team/${team.slug}`);
};

export default function InvitationRoute({ loaderData: team }: Route.ComponentProps) {
  return (
    <FullscreenPage navbar="default" className="text-center">
      <Card className="p-8 md:p-16 space-y-16">
        <div className="space-y-6">
          <H1 size="3xl" weight="bold">
            {team.name}
          </H1>
          <Subtitle>{`You have been invited to join the ${team.name} team in Conference Hall.`}</Subtitle>
        </div>

        <Form method="POST">
          <Button type="submit">Accept invitation</Button>
        </Form>
      </Card>
    </FullscreenPage>
  );
}
