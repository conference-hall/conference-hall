import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserProposal } from '~/.server/cfp-submissions/user-proposal.ts';
import { getProposalUpdateSchema, ProposalParticipationSchema } from '~/.server/cfp-submissions/user-proposal.types.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { ProposalStatusSection } from '../__components/proposals/proposal-status-section.tsx';
import { TalkSection } from '../__components/talks/talk-section.tsx';
import { useEvent } from './__components/use-event.tsx';

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
  const intent = form.get('intent');

  switch (intent) {
    case 'proposal-delete': {
      await proposal.delete();
      return redirectWithToast(`/${params.event}/proposals`, 'success', 'Proposal submission removed.');
    }
    case 'proposal-confirmation': {
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

  const canEdit = proposal.status === SpeakerProposalStatus.Submitted;

  return (
    <Page>
      <h1 className="sr-only">Proposal page</h1>
      <div className="space-y-4 lg:space-y-6">
        <ProposalStatusSection proposal={proposal} event={event} />

        <TalkSection
          talk={proposal}
          event={event}
          errors={errors}
          canEditSpeakers={canEdit}
          canEditTalk={canEdit}
          canArchive={false}
          showFormats
          showCategories
        />
      </div>
    </Page>
  );
}
