import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';

import { UserProposal } from '~/.server/cfp-submissions/user-proposal.ts';
import { ProposalParticipationSchema, getProposalUpdateSchema } from '~/.server/cfp-submissions/user-proposal.types.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { useCurrentEvent } from '../__components/contexts/event-page-context.tsx';
import { ProposalStatusSection } from '../__components/proposals/proposal-status-section.tsx';
import { TalkSection } from '../__components/talks/talk-section.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await UserProposal.for(userId, params.proposal).get();
  return proposal;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = UserProposal.for(userId, params.proposal);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'proposal-delete': {
      await proposal.delete();
      throw redirectWithToast(`/${params.event}/proposals`, 'success', 'Proposal submission removed.');
    }
    case 'proposal-confirmation': {
      const result = parseWithZod(form, { schema: ProposalParticipationSchema });
      if (result.status !== 'success') return null;
      await proposal.confirm(result.value.participation);
      return toast('success', 'Your response has been sent to organizers.');
    }
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await proposal.removeCoSpeaker(speakerId);
      return toast('success', 'Co-speaker removed from proposal.');
    }
    case 'edit-talk': {
      const { formatsRequired, categoriesRequired } = await EventPage.of(params.event).get();
      const result = parseWithZod(form, { schema: getProposalUpdateSchema(formatsRequired, categoriesRequired) });
      if (result.status !== 'success') return result.error;

      await proposal.update(result.value);
      return toast('success', 'Proposal saved.');
    }
    default:
      return null;
  }
};

export default function ProposalRoute() {
  const currentEvent = useCurrentEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const canEdit = proposal.status === SpeakerProposalStatus.Submitted;

  return (
    <Page>
      <h1 className="sr-only">Proposal page</h1>
      <div className="space-y-4 lg:space-y-6">
        <ProposalStatusSection proposal={proposal} event={currentEvent} />

        <TalkSection
          talk={proposal}
          event={currentEvent}
          errors={errors}
          canEditSpeakers={canEdit}
          canEditTalk={canEdit}
          canArchive={false}
          showFormats
          showCategories
          showBackButton
        />
      </div>
    </Page>
  );
}
