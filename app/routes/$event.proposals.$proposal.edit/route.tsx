import invariant from 'tiny-invariant';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { addToast } from '~/libs/toasts/toasts';
import { H3, Subtitle } from '~/design-system/Typography';
import { DetailsForm } from '~/components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { requireSession } from '~/libs/auth/session';
import { getProposalUpdateSchema } from '~/schemas/proposal';
import { getSpeakerProposal } from '~/server/proposals/get-speaker-proposal.server';
import { updateProposal } from './server/update-proposal.server';
import { useEvent } from '../$event/route';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/components/proposals/forms/CoSpeaker';
import { removeCoSpeakerFromProposal } from '~/server/proposals/remove-co-speaker.server';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { Card } from '~/design-system/layouts/Card';
import { getEvent } from '~/server/events/get-event.server';
import { parse } from '@conform-to/zod';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await getSpeakerProposal(params.proposal, userId);
  return json(proposal);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(userId, params.proposal, speakerId);
      return json(null, await addToast(request, 'Co-speaker removed from proposal.'));
    }
    case 'edit-proposal': {
      const { formatsRequired, categoriesRequired } = await getEvent(params.event);
      const result = parse(form, { schema: getProposalUpdateSchema(formatsRequired, categoriesRequired) });
      if (!result.value) return json(result.error);

      await updateProposal(params.event, params.proposal, userId, result.value);
      return redirect(`/${params.event}/proposals/${params.proposal}`, await addToast(request, 'Proposal saved.'));
    }
  }
  return json(null);
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
          <Card className="lg:col-span-2 lg:col-start-1">
            <Card.Content>
              <Form method="POST" id="edit-proposal-form">
                <DetailsForm
                  initialValues={proposal}
                  errors={errors}
                  formats={event.formats}
                  formatsRequired={event.formatsRequired}
                  categories={event.categories}
                  categoriesRequired={event.categoriesRequired}
                />
              </Form>
            </Card.Content>
            <Card.Actions>
              <ButtonLink to={`/${event.slug}/proposals/${proposal.id}`} variant="secondary">
                Cancel
              </ButtonLink>
              <Button type="submit" name="intent" value="edit-proposal" form="edit-proposal-form">
                Save proposal
              </Button>
            </Card.Actions>
          </Card>

          <div className="lg:col-span-1 lg:col-start-3">
            <Card p={8} className="space-y-6">
              <div>
                <H3>Speakers</H3>
                <Subtitle>
                  When co-speaker accepts the invite, he/she will be automatically added to the proposal.
                </Subtitle>
              </div>
              <CoSpeakersList speakers={proposal.speakers} showRemoveAction />
              <InviteCoSpeakerButton invitationLink={proposal.invitationLink} block />
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
