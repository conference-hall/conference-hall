import invariant from 'tiny-invariant';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { mapErrorToResponse } from '../../libs/errors';
import { TalkAbstractForm } from '../../components/TalkAbstractForm';
import { ProposalCreateSchema } from '~/schemas/proposal';
import { withZod } from '@remix-validated-form/with-zod';
import { saveDraftProposal } from '~/services/event-submission/save-draft-proposal.server';
import { getTalk } from '~/services/speaker-talks/get-talk.server';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  try {
    if (params.talk === 'new') {
      return json(null);
    } else {
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
    <Form method="post">
      <div className="py-6 sm:px-8 sm:py-10">
        <div className="mb-6">
          <H2>Your proposal</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
        </div>
        <TalkAbstractForm initialValues={talk} errors={errors} />
      </div>

      <div className="py-5 text-right sm:px-6">
        <Button type="submit">Save as draft and continue</Button>
      </div>
    </Form>
  );
}
