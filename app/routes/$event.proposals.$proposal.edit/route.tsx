import invariant from 'tiny-invariant';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, ActionFunction, LoaderArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { Container } from '~/design-system/Container';
import { H2, H3, Subtitle } from '~/design-system/Typography';
import { TalkForm } from '~/shared-components/proposal-forms/TalkForm';
import { FormatsForm } from '~/shared-components/proposal-forms/FormatsForm';
import { CategoriesForm } from '~/shared-components/proposal-forms/CategoriesForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/libs/errors';
import { sessionRequired } from '~/libs/auth/auth.server';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { getSpeakerProposal } from '~/shared-server/proposals/get-speaker-proposal.server';
import { deleteProposal } from './server/delete-proposal.server';
import { updateProposal } from './server/update-proposal.server';
import { useEvent } from '../$event/route';
import { IconButtonLink } from '~/design-system/IconButtons';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card } from '~/design-system/Card';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/shared-components/proposal-forms/CoSpeaker';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const proposal = await getSpeakerProposal(params.proposal, uid);
    return json(proposal);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const method = form.get('_method');
    if (method === 'DELETE') {
      await deleteProposal(params.proposal, uid);
      throw redirect(`/${params.event}/proposals`);
    } else {
      const result = await withZod(ProposalUpdateSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await updateProposal(params.event, params.proposal, uid, result.data);
      throw redirect(`/${params.event}/proposals/${params.proposal}`);
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
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex items-start gap-4">
        <IconButtonLink icon={ArrowLeftIcon} variant="secondary" to=".." relative="path" />
        <H2 mb={0}>{proposal.title}</H2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
        <div className="lg:col-span-2 lg:col-start-1">
          <Card rounded="xl" p={8} className="space-y-8">
            <Form method="POST">
              <TalkForm initialValues={proposal} errors={errors} />

              {event.formats?.length > 0 ? (
                <div className="pt-10">
                  <FormatsForm formats={event.formats} initialValues={proposal.formats.map(({ id }) => id)} />
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
          <Card rounded="xl" p={8} className="space-y-6">
            <div>
              <H3>Speakers</H3>
              <Subtitle>
                When co-speaker accepts the invite, he/she will be automatically added to the proposal.
              </Subtitle>
            </div>
            <CoSpeakersList speakers={proposal.speakers} showRemoveAction />
            <InviteCoSpeakerButton to="PROPOSAL" id={proposal.id} invitationLink={proposal.invitationLink} />
          </Card>
        </div>
      </div>
    </Container>
  );
}
