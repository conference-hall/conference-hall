import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { Button, ButtonLink } from '../../../design-system/Buttons';
import { CategoriesForm } from '../../../components/CategoriesForm';
import type { ActionArgs, ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { sessionRequired } from '../../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../../libs/errors';
import { TalkAbstractForm } from '../../../components/TalkAbstractForm';
import { FormatsForm } from '../../../components/FormatsForm';
import { useEvent } from '../../$eventSlug';
import { H2 } from '../../../design-system/Typography';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { withZod } from '@remix-validated-form/with-zod';
import { getSpeakerProposal } from '~/services/event-proposals/get.server';
import { deleteSpeakerProposalProposal } from '~/services/event-proposals/delete.server';
import { updateSpeakerProposal } from '~/services/event-proposals/update.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const proposalId = params.id!;
  try {
    const proposal = await getSpeakerProposal(proposalId, uid);
    return json(proposal);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const proposalId = params.id!;
  const form = await request.formData();
  try {
    const method = form.get('_method');
    if (method === 'DELETE') {
      await deleteSpeakerProposalProposal(proposalId, uid);
      throw redirect(`/${eventSlug}/proposals`);
    } else {
      const result = await withZod(ProposalUpdateSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await updateSpeakerProposal(eventSlug, proposalId, uid, result.data);
      throw redirect(`/${eventSlug}/proposals/${proposalId}`);
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EditProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div>
          <H2>{proposal.title}</H2>
          <span className="test-gray-500 truncate text-sm">by {proposal.speakers.map((s) => s.name).join(', ')}</span>
        </div>
      </div>

      <Form method="post" className="sm:mt-4 sm:rounded-lg sm:border sm:border-gray-200">
        <div className="py-8 sm:px-6">
          <TalkAbstractForm initialValues={proposal} errors={errors} />

          {event.formats?.length > 0 ? (
            <div className="pt-10">
              <FormatsForm formats={event.formats} initialValues={proposal.formats.map(({ id }) => id)} />
            </div>
          ) : null}

          {event.categories?.length > 0 ? (
            <div className="pt-10">
              <CategoriesForm categories={event.categories} initialValues={proposal.categories.map(({ id }) => id)} />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 py-3 sm:flex-row sm:justify-end sm:bg-gray-50 sm:px-6">
          <ButtonLink to={`/${event.slug}/proposals/${proposal.id}`} variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit">Save proposal</Button>
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
