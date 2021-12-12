import { Form, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { Button } from '../../../components/Buttons';
import {
  editProposal,
  loadSpeakerEditProposal,
  SpeakerEditProposal,
} from '../../../features/event-proposals/edit-proposal.server';
import { CategoriesForm } from '../../../components/proposal/CategoriesForm';
import { ProposalForm } from '../../../components/proposal/ProposalForm';
import { FormatsForm } from '../../../components/proposal/FormatsForm';

export const loader = loadSpeakerEditProposal;

export const action = editProposal;

export default function EditProposalRoute() {
  const data = useLoaderData<SpeakerEditProposal>();
  return (
    <Container className="mt-8">
      <Form method="post" className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 -ml-4 -mt-4 border-b border-gray-200 flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{data.proposal.title}</h3>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <ProposalForm initialValues={data.proposal} />
        </div>

        {data.formats?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <FormatsForm formats={data.formats} initialValues={data.proposal.formats} />
          </div>
        ) : null}

        {data.categories?.length > 0 ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <CategoriesForm categories={data.categories} initialValues={data.proposal.categories} />
          </div>
        ) : null}

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Button type="submit" className="ml-4">
            Save proposal
          </Button>
        </div>
      </Form>
    </Container>
  );
}
