import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { Button } from '../../../components/Buttons';
import { CategoriesForm } from '../../../components/proposal/CategoriesForm';
import { TalkAbstractForm } from '../../../components/proposal/TalkAbstractForm';
import { FormatsForm } from '../../../components/proposal/FormatsForm';
import { H2 } from '../../../components/Typography';
import { ValidationErrors } from '../../../utils/validation-errors';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { requireUserSession } from '../../../features/auth.server';
import {
  deleteProposal,
  EventFormatsAndCategories,
  getEventFormatsAndCategories,
  getSpeakerProposal,
  SpeakerProposal,
  updateProposal,
  validateProposalForm,
} from '../../../features/events-proposals.server';

export type SpeakerEditProposal = { proposal: SpeakerProposal } & EventFormatsAndCategories;

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  const proposalId = params.id!;
  try {
    const proposal = await getSpeakerProposal(proposalId, uid);
    const { formats, categories } = await getEventFormatsAndCategories(slug);
    return json<SpeakerEditProposal>({ proposal, formats, categories });
  } catch (err) {
    throw new Response('Proposal not found.', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  const proposalId = params.id!;
  const form = await request.formData();
  const method = form.get('_method');
  if (method === 'DELETE') {
    await deleteProposal(proposalId, uid);
    return redirect(`/${slug}/proposals`);
  } else {
    const result = validateProposalForm(form);
    if (!result.success) return result.error.flatten();
    await updateProposal(slug, proposalId, uid, result.data);
    return redirect(`/${slug}/proposals/${proposalId}`);
  }
};

export default function EditProposalRoute() {
  const data = useLoaderData<SpeakerEditProposal>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="mt-8">
      <Form method="post" className="mt-8 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 -ml-4 -mt-4 border-b border-gray-200 flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <H2>{data.proposal.title}</H2>
          </div>
        </div>

        <div className="px-4 py-10 sm:px-6">
          <TalkAbstractForm initialValues={data.proposal} errors={errors?.fieldErrors} />
        </div>

        {data.formats?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
            <FormatsForm formats={data.formats} initialValues={data.proposal.formats} />
          </div>
        ) : null}

        {data.categories?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
            <CategoriesForm categories={data.categories} initialValues={data.proposal.categories} />
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
