import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import type { ValidationErrors } from '~/utils/validation-errors';
import { H2, Text } from '../../../../design-system/Typography';
import { requireUserSession } from '../../../../services/auth/auth.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import type { SpeakerTalk } from '../../../../services/speakers/talks.server';
import { getTalk } from '../../../../services/speakers/talks.server';
import { saveDraftProposalForEvent, validateDraftProposalForm } from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { TalkAbstractForm } from '../../../../components/TalkAbstractForm';

export const handle = { step: 'proposal' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.talkId!;
  if (talkId !== 'new') {
    try {
      const talk = await getTalk(uid, talkId);
      return json<SpeakerTalk>(talk);
    } catch (err) {
      mapErrorToResponse(err);
    }
  }
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;

  const form = await request.formData();
  const result = validateDraftProposalForm(form);
  if (!result.success) return result.error.flatten();

  try {
    const savedProposal = await saveDraftProposalForEvent(talkId, eventSlug, uid, result.data);
    return redirect(`/${eventSlug}/submission/${savedProposal.talkId}/speakers`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionProposalRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <div className="mb-6">
          <H2>Your proposal</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
        </div>
        <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
      </div>

      <div className="px-4 py-5 text-right sm:px-6">
        <Button type="submit">Save as draft and continue</Button>
      </div>
    </Form>
  );
}
