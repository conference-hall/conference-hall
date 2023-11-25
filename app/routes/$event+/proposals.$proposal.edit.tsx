import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { H3, Subtitle } from '~/design-system/Typography.tsx';
import { EventSubmissionSettings } from '~/domains/submission-funnel/EventSubmissionSettings.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/routes/__components/proposals/forms/CoSpeaker.tsx';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';
import { getSpeakerProposal } from '~/routes/__server/proposals/get-speaker-proposal.server.ts';
import { removeCoSpeakerFromProposal } from '~/routes/__server/proposals/remove-co-speaker.server.ts';
import { getProposalUpdateSchema } from '~/routes/__types/proposal.ts';

import { updateProposal } from './__server/update-proposal.server.ts';
import { useEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await getSpeakerProposal(params.proposal, userId);
  return json(proposal);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(userId, params.proposal, speakerId);
      return toast('success', 'Co-speaker removed from proposal.');
    }
    case 'edit-proposal': {
      const tracks = await EventSubmissionSettings.for(params.event).tracksRequired();
      const result = parse(form, {
        schema: getProposalUpdateSchema(tracks.formatsRequired, tracks.categoriesRequired),
      });
      if (!result.value) return json(result.error);

      await updateProposal(params.event, params.proposal, userId, result.value);
      return redirectWithToast(`/${params.event}/proposals/${params.proposal}`, 'success', 'Proposal saved.');
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

      <PageContent>
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
      </PageContent>
    </>
  );
}
