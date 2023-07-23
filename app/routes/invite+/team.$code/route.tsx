import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Navbar } from '~/components/navbar/Navbar';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root';

import { addMember, checkTeamInviteCode } from './server/invite-team.server';

export const meta = mergeMeta(() => [{ title: 'Team invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const team = await checkTeamInviteCode(params.code);
  return json(team);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const team = await addMember(params.code, userId);
  return redirect(`/team/${team.slug}`);
};

export default function InvitationRoute() {
  const team = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Container className="m-8">
        <Card p={16} className="flex flex-col items-center">
          <H1 mb={4} variant="secondary">
            You have been invited to the team
          </H1>

          <Text size="3xl" heading strong mb={8}>
            {team.name}
          </Text>

          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}