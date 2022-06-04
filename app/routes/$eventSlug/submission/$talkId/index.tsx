import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/Buttons';
import { saveDraftProposalForEvent, validateProposalForm } from '~/features/events-submission/step-proposal.server';
import { ValidationErrors } from '~/utils/validation-errors';
import { TalkAbstractForm } from '~/components/proposal/TalkAbstractForm';
import { H2, Text } from '../../../../components/Typography';
import { requireUserSession } from '../../../../features/auth.server';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { getTalk, SpeakerTalk } from '../../../../features/speaker-talks.server';
import { getEventSubmissionInfo } from '../../../../features/events-submission/steps.server';

export const handle = { step: 'proposal' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.talkId!;
  if (talkId !== 'new') {
    const talk = await getTalk(uid, talkId);
    return json<SpeakerTalk>(talk)
  }
  return null;
}

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  const talkId = params.talkId!;

  const form = await request.formData();
  const result = validateProposalForm(form)
  if (!result.success) return result.error.flatten();

  try {
    const eventInfo = await getEventSubmissionInfo(slug)
    const savedProposal = await saveDraftProposalForEvent(talkId, eventInfo.id, uid, result.data);
    if (eventInfo.hasTracks) {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/tracks`);
    } else if (eventInfo.hasSurvey) {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/survey`);
    } else {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/submit`);
    }
  } catch(err) {
    throw new Response('Event not found.', { status: 404 });
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
          <Text variant="secondary" className="mt-1">This information will be displayed publicly so be careful what you share.</Text>
        </div>
        <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
      </div>

      <div className="px-4 py-5 text-right sm:px-6">
        <Button type="submit">
          Save as draft and continue
        </Button>
      </div>
    </Form>
  );
}
