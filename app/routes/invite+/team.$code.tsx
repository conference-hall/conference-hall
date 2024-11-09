import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamMemberInvite } from '~/.server/team/team-member-invite.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { FullscreenPage } from '../__components/fullscreen-page.tsx';

export const meta = mergeMeta(() => [{ title: 'Team invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const team = await TeamMemberInvite.with(params.code).check();
  return { name: team.name };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const team = await TeamMemberInvite.with(params.code).addMember(userId);
  return redirect(`/team/${team.slug}`);
};

export default function InvitationRoute() {
  const team = useLoaderData<typeof loader>();

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
