import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserProposal } from '~/.server/cfp-submissions/UserProposal.ts';
import { getProposalUpdateSchema } from '~/.server/cfp-submissions/UserProposal.types.ts';
import { EventPage } from '~/.server/event-page/EventPage.ts';
import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { H3, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';

import { CoSpeakers } from '../__components/talks/co-speaker.tsx';
import { useEvent } from './__components/useEvent.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await UserProposal.for(userId, params.proposal).get();
  return json(proposal);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent');

  const proposal = UserProposal.for(userId, params.proposal);
  switch (intent) {
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await proposal.removeCoSpeaker(speakerId);
      return toast('success', 'Co-speaker removed from proposal.');
    }
    case 'edit-proposal': {
      const { formatsRequired, categoriesRequired } = await EventPage.of(params.event).get();
      const result = parseWithZod(form, getProposalUpdateSchema(formatsRequired, categoriesRequired));
      if (!result.success) return json(result.error);

      await proposal.update(result.value);
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

      <Page>
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
              <CoSpeakers
                speakers={proposal.speakers}
                invitationLink={proposal.invitationLink}
                canEdit={proposal.isOwner}
              />
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
