import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { UserProposal } from '~/.server/cfp-submissions/user-proposal.ts';
import { getProposalUpdateSchema, ProposalParticipationSchema } from '~/.server/cfp-submissions/user-proposal.types.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';
import { useCurrentEvent } from '../components/contexts/event-page-context.tsx';
import { ProposalStatusSection } from '../components/proposals/proposal-status-section.tsx';
import { TalkSection } from '../components/talks/talk-section.tsx';
import type { Route } from './+types/proposal.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const proposal = await UserProposal.for(userId, params.proposal).get();
  return proposal;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const proposal = UserProposal.for(userId, params.proposal);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'proposal-delete': {
      await proposal.delete();
      const headers = await toastHeaders('success', t('event.proposal.feedbacks.submissions-removed'));
      return redirect(href('/:event/proposals', { event: params.event }), { headers });
    }
    case 'proposal-confirmation': {
      const result = parseWithZod(form, { schema: ProposalParticipationSchema });
      if (result.status !== 'success') return null;
      await proposal.confirm(result.value.participation);
      return toast('success', t('event.proposal.feedbacks.confirmed'));
    }
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await proposal.removeCoSpeaker(speakerId);
      return toast('success', t('event.proposal.feedbacks.cospeaker-removed'));
    }
    case 'edit-talk': {
      const { formatsRequired, categoriesRequired } = await EventPage.of(params.event).get();
      const result = parseWithZod(form, { schema: getProposalUpdateSchema(formatsRequired, categoriesRequired) });
      if (result.status !== 'success') return result.error;

      await proposal.update(result.value);
      return toast('success', t('event.proposal.feedbacks.saved'));
    }
    default:
      return null;
  }
};

export default function ProposalRoute({ loaderData: proposal, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();
  const canEdit = proposal.status === SpeakerProposalStatus.Submitted;

  return (
    <Page>
      <h1 className="sr-only">{t('event.proposal.heading')}</h1>
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
