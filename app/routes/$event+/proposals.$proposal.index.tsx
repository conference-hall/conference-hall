import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserProposal } from '~/.server/cfp-submissions/UserProposal.ts';
import { getProposalUpdateSchema, ProposalParticipationSchema } from '~/.server/cfp-submissions/UserProposal.types.ts';
import { EventPage } from '~/.server/event-page/EventPage.ts';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { ProposalStatusSection } from '~/routes/__components/proposals/ProposalStatusSection.tsx';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { TalkSection } from '../__components/talks/talk-section.tsx';
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

  const proposal = UserProposal.for(userId, params.proposal);

  const form = await request.formData();
  const action = form.get('_action');
  switch (action) {
    case 'delete': {
      await proposal.delete();
      return redirectWithToast(`/${params.event}/proposals`, 'success', 'Proposal submission removed.');
    }
    case 'confirm': {
      const result = parseWithZod(form, ProposalParticipationSchema);
      if (!result.success) return null;
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
      const result = parseWithZod(form, getProposalUpdateSchema(formatsRequired, categoriesRequired));
      if (!result.success) return json(result.error);

      await proposal.update(result.value);
      return toast('success', 'Proposal saved.');
    }
    default:
      return null;
  }
};

export default function ProposalRoute() {
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <div className="space-y-4 lg:space-y-6">
        <ProposalStatusSection proposal={proposal} event={event} />

        <TalkSection
          talk={proposal}
          event={event}
          errors={errors}
          canEditSpeakers={proposal.status === SpeakerProposalStatus.Submitted}
          canEditTalk={proposal.status === SpeakerProposalStatus.Submitted}
          canArchive={false}
        />
      </div>
    </Page>
  );
}
