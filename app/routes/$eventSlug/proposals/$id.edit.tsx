import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { Button, ButtonLink } from '../../../components-ui/Buttons';
import { CategoriesForm } from '../../../components-app/CategoriesForm';
import { ValidationErrors } from '../../../utils/validation-errors';
import { ActionFunction, json, LoaderArgs, redirect } from '@remix-run/node';
import { requireUserSession } from '../../../services/auth/auth.server';
import {
  deleteProposal,
  getSpeakerProposal,
  updateProposal,
  validateProposalForm,
} from '../../../services/events/proposals.server';
import { mapErrorToResponse } from '../../../services/errors';
import { TalkAbstractForm } from '../../../components-app/TalkAbstractForm';
import { FormatsForm } from '../../../components-app/FormatsForm';
import { useEvent } from '../../$eventSlug';
import { H2 } from '../../../components-ui/Typography';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await requireUserSession(request);
  const proposalId = params.id!;
  const proposal = await getSpeakerProposal(proposalId, uid).catch(
    mapErrorToResponse
  );
  return json(proposal);
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
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div>
          <H2>{proposal.title}</H2>
          <span className="test-gray-500 truncate text-sm">
            by {proposal.speakers.map((s) => s.name).join(', ')}
          </span>
        </div>
        <div className="flex-shrink-0 space-x-4">
          <ButtonLink
            to={`/${event.slug}/proposals/${proposal.id}`}
            variant="secondary"
            className="ml-4"
          >
            Cancel
          </ButtonLink>
        </div>
      </div>

      <Form
        method="post"
        className="mt-4 overflow-hidden border border-gray-200 bg-white sm:rounded-lg"
      >
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm
            initialValues={proposal}
            errors={errors?.fieldErrors}
          />

          {event.formats?.length > 0 ? (
            <div className="pt-10">
              <FormatsForm
                formats={event.formats}
                initialValues={proposal.formats.map(({ id }) => id)}
              />
            </div>
          ) : null}

          {event.categories?.length > 0 ? (
            <div className="pt-10">
              <CategoriesForm
                categories={event.categories}
                initialValues={proposal.categories.map(({ id }) => id)}
              />
            </div>
          ) : null}
        </div>

        <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
          <ButtonLink
            to={`/${event.slug}/proposals/${proposal.id}`}
            variant="secondary"
            className="ml-4"
          >
            Cancel
          </ButtonLink>
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
