import invariant from 'tiny-invariant';
import { withZod } from '@remix-validated-form/with-zod';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { ProposalCreateSchema } from '~/schemas/proposal';
import { getTalk } from '~/shared-server/talks/get-talk.server';
import { saveDraftProposal } from './server/save-draft-proposal.server';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { H2 } from '~/design-system/Typography';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { isTalkAlreadySubmitted } from './server/is-talk-already-submitted.server';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useSubmissionStep } from '../$event_.submission/hooks/useSubmissionStep';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    if (params.talk === 'new') {
      return json(null);
    } else {
      const alreadySubmitted = await isTalkAlreadySubmitted(params.event, params.talk, userId);
      if (alreadySubmitted) throw new Response('Talk already submitted.', { status: 400 });

      const talk = await getTalk(userId, params.talk);
      return json(talk);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const result = await withZod(ProposalCreateSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  try {
    const proposal = await saveDraftProposal(params.talk, params.event, userId, result.data);
    return redirect(`/${params.event}/submission/${proposal.talkId}/speakers`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SubmissionProposalRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2 size="base">Your proposal</H2>
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
