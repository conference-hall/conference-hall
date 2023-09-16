import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root';
import { Navbar } from '~/routes/__components/navbar/Navbar';

import { addCoSpeakerToProposal, checkProposalInviteCode } from './__server/invite-proposal.server';

export const meta = mergeMeta(() => [{ title: 'Proposal invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await checkProposalInviteCode(params.code);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await addCoSpeakerToProposal(params.code, userId);
  return redirect(`/${proposal.eventSlug}/proposals/${proposal.id}`);
};

export default function InvitationRoute() {
  const proposal = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Container className="m-8">
        <Card p={16} className="flex flex-col items-center">
          <H1 mb={4} variant="secondary">
            You have been invited to proposal
          </H1>

          <Text size="3xl" heading strong mb={8}>
            {proposal.title}
          </Text>

          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
