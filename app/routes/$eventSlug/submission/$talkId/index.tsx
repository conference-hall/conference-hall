import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/Buttons';
import { ValidationErrors } from '~/utils/validation-errors';
import { TalkAbstractForm } from '~/components/proposal/TalkAbstractForm';
import { H2, Text } from '../../../../components/Typography';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { getTalk, SpeakerTalk } from '../../../../services/speakers/talks.server';
import { saveDraftProposalForEvent, validateDraftProposalForm } from '../../../../services/events/submit.server';
import { getEvent } from '../../../../services/events/event.server';

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
  const result = validateDraftProposalForm(form)
  if (!result.success) return result.error.flatten();

  try {
    const event = await getEvent(slug)
    const savedProposal = await saveDraftProposalForEvent(talkId, event.id, uid, result.data);
    if (event.hasTracks) {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/tracks`);
    } else if (event.hasSurvey) {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/survey`);
    } else {
      return redirect(`/${slug}/submission/${savedProposal.talkId}/submit`);
    }
  } catch(err) {
    console.log(err)
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
