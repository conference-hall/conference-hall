import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { Button } from '../../../components-ui/Buttons';
import { CategoriesForm } from '../../../components-app/CategoriesForm';
import { H2 } from '../../../components-ui/Typography';
import { ValidationErrors } from '../../../utils/validation-errors';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { requireUserSession } from '../../../services/auth/auth.server';
import { deleteProposal, getSpeakerProposal, SpeakerProposal, updateProposal, validateProposalForm } from '../../../services/events/proposals.server';
import { EventTracks, getEvent } from '../../../services/events/event.server';
import { mapErrorToResponse } from '../../../services/errors';
import { TalkAbstractForm } from '../../../components-app/TalkAbstractForm';
import { FormatsForm } from '../../../components-app/FormatsForm';

export type SpeakerEditProposal = { 
  event: { formats: EventTracks, categories: EventTracks }
  proposal: SpeakerProposal
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const proposalId = params.id!;
  try {
    const proposal = await getSpeakerProposal(proposalId, uid);
    const { formats, categories } = await getEvent(eventSlug);
    return json<SpeakerEditProposal>({ proposal, event: { formats, categories } });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const proposalId = params.id!;
  const form = await request.formData();
  try {
    const method = form.get('_method');
    if (method === 'DELETE') {
      await deleteProposal(proposalId, uid);
      return redirect(`/${eventSlug}/proposals`);
    } else {
      const result = validateProposalForm(form);
      if (!result.success) return result.error.flatten();
      await updateProposal(eventSlug, proposalId, uid, result.data);
      return redirect(`/${eventSlug}/proposals/${proposalId}`);
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EditProposalRoute() {
  const { event, proposal } = useLoaderData<SpeakerEditProposal>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="mt-8">
      <Form method="post" className="mt-8 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 -ml-4 -mt-4 border-b border-gray-200 flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <H2>{proposal.title}</H2>
          </div>
        </div>

        <div className="px-4 py-10 sm:px-6">
          <TalkAbstractForm initialValues={proposal} errors={errors?.fieldErrors} />
        </div>

        {event.formats?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
            <FormatsForm formats={event.formats} initialValues={proposal.formats} />
          </div>
        ) : null}

        {event.categories?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
            <CategoriesForm categories={event.categories} initialValues={proposal.categories} />
          </div>
        ) : null}

        <div className="px-4 py-5 border-t border-gray-200 text-right sm:px-6">
          <Button type="submit" className="ml-4">
            Save proposal
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
