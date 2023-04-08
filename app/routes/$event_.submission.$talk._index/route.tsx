import invariant from 'tiny-invariant';
import { withZod } from '@remix-validated-form/with-zod';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { ProposalCreateSchema } from '~/schemas/proposal';
import { getTalk } from '~/shared-server/talks/get-talk.server';
import { saveDraftProposal } from './server/save-draft-proposal.server';
import { Card } from '~/design-system/Card';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { H2 } from '~/design-system/Typography';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { isTalkAlreadySubmitted } from './server/is-talk-already-submitted.server';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    if (params.talk === 'new') {
      return json(null);
    } else {
      const alreadySubmitted = await isTalkAlreadySubmitted(params.event, params.talk, uid);
      if (alreadySubmitted) throw new Response('Talk already submitted.', { status: 400 });

      const talk = await getTalk(uid, params.talk);
      return json(talk);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const result = await withZod(ProposalCreateSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  try {
    const proposal = await saveDraftProposal(params.talk, params.event, uid, result.data);
    return redirect(`/${params.event}/submission/${proposal.talkId}/speakers`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SubmissionProposalRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <>
      <H2 mb={0}>Your proposal</H2>

      <Card p={8} rounded="xl">
        <Form id="proposal-form" method="POST">
          <DetailsForm initialValues={talk} errors={errors} />
        </Form>
      </Card>
    </>
  );
}
