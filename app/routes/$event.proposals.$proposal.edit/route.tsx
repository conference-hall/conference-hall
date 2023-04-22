import invariant from 'tiny-invariant';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, ActionFunction, LoaderArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { createToast } from '~/libs/toasts/toasts';
import { H3, Subtitle } from '~/design-system/Typography';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/libs/errors';
import { requireSession } from '~/libs/auth/cookies';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { getSpeakerProposal } from '~/shared-server/proposals/get-speaker-proposal.server';
import { deleteProposal } from './server/delete-proposal.server';
import { updateProposal } from './server/update-proposal.server';
import { useEvent } from '../$event/route';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/shared-components/proposals/forms/CoSpeaker';
import { removeCoSpeakerFromProposal } from '~/shared-server/proposals/remove-co-speaker.server';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const proposal = await getSpeakerProposal(params.proposal, uid);
    return json(proposal);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const action = form.get('_action');
    if (action === 'delete') {
      await deleteProposal(params.proposal, uid);
      const toast = await createToast(request, 'Proposal successfully deleted.');
      throw redirect(`/${params.event}/proposals`, toast);
    } else if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(uid, params.proposal, speakerId);
      return null;
    } else {
      const result = await withZod(ProposalUpdateSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await updateProposal(params.event, params.proposal, uid, result.data);
      const toast = await createToast(request, 'Proposal successfully updated.');
      throw redirect(`/${params.event}/proposals/${params.proposal}`, toast);
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EditProposalRoute() {
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeaderTitle title={proposal.title} backOnClick={() => navigate(-1)} />

      <Container className="my-4 space-y-8 sm:my-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="lg:col-span-2 lg:col-start-1">
            <Card p={8} className="space-y-8">
              <Form method="POST">
                <DetailsForm
                  initialValues={proposal}
                  errors={errors}
                  formats={event.formats}
                  categories={event.categories}
                />

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end sm:px-6">
                  <ButtonLink to={`/${event.slug}/proposals/${proposal.id}`} variant="secondary">
                    Cancel
                  </ButtonLink>
                  <Button type="submit">Save proposal</Button>
                </div>
              </Form>
            </Card>
          </div>

          <div className="lg:col-span-1 lg:col-start-3">
            <Card p={8} className="space-y-6">
              <div>
                <H3>Speakers</H3>
                <Subtitle>
                  When co-speaker accepts the invite, he/she will be automatically added to the proposal.
                </Subtitle>
              </div>
              <CoSpeakersList speakers={proposal.speakers} showRemoveAction />
              <InviteCoSpeakerButton to="PROPOSAL" id={proposal.id} invitationLink={proposal.invitationLink} block />
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
