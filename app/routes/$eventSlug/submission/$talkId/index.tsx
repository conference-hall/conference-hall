import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Text } from '../../../../design-system/Typography';
import { sessionRequired } from '../../../../services/auth/auth.server';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getTalk } from '../../../../services/speakers/talks.server';
import { saveDraftProposalForEvent } from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { TalkAbstractForm } from '../../../../components/TalkAbstractForm';
import { ProposalCreateSchema } from '~/schemas/proposal';
import { withZod } from '@remix-validated-form/with-zod';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const talkId = params.talkId!;
  try {
    if (talkId === 'new') {
      return json(null);
    } else {
      const talk = await getTalk(uid, talkId);
      return json(talk);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;

  const form = await request.formData();
  const result = await withZod(ProposalCreateSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  try {
    const savedProposal = await saveDraftProposalForEvent(talkId, eventSlug, uid, result.data);
    return redirect(`/${eventSlug}/submission/${savedProposal.talkId}/speakers`);
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
