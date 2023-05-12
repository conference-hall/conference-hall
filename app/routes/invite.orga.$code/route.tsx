import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { requireSession } from '~/libs/auth/session';
import { Container } from '~/design-system/layouts/Container';
import { H1, H2 } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { useUser } from '~/root';
import { addMember, checkTeamInviteCode } from './server/invite-organization.server';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const organization = await checkTeamInviteCode(params.code);
  return json(organization);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const organization = await addMember(params.code, userId);
  return redirect(`/organizer/${organization.slug}`);
};

export default function InvitationRoute() {
  const organization = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Container className="m-8">
        <Card p={16} className="flex flex-col items-center">
          <H1 size="l" mb={4} variant="secondary">
            You have been invited to organization
          </H1>

          <H2 size="3xl" mb={8}>
            {organization.name}
          </H2>

          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
