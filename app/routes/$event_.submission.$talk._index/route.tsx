import { parse } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { DetailsForm } from '~/components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { ProposalCreateSchema } from '~/schemas/proposal';
import { getTalk } from '~/server/talks/get-talk.server';

import { useSubmissionStep } from '../$event_.submission/components/useSubmissionStep';
import { isTalkAlreadySubmitted } from './server/is-talk-already-submitted.server';
import { saveDraftProposal } from './server/save-draft-proposal.server';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  if (params.talk === 'new') return json(null);

  const alreadySubmitted = await isTalkAlreadySubmitted(params.event, params.talk, userId);
  if (alreadySubmitted) throw new Response('Talk already submitted.', { status: 400 });

  const talk = await getTalk(userId, params.talk);
  return json(talk);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalCreateSchema });
  if (!result.value) return json(result.error);

  const proposal = await saveDraftProposal(params.talk, params.event, userId, result.value);
  return redirect(`/${params.event}/submission/${proposal.talkId}/speakers`);
};

export default function SubmissionProposalRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2>Your proposal</H2>
      </Card.Title>
      <Card.Content>
        <Form id="proposal-form" method="POST">
          <DetailsForm initialValues={talk} errors={errors} />
        </Form>
      </Card.Content>
      <Card.Actions>
        <ButtonLink to={previousPath} variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" form="proposal-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
