import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import {
  getProposalUpdateSchema,
  ProposalParticipationSchema,
} from '~/features/event-participation/speaker-proposals/services/speaker-proposal.schema.server.ts';
import { SpeakerProposal } from '~/features/event-participation/speaker-proposals/services/speaker-proposal.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';
import { TalkSection } from '../../speaker/talk-library/components/talk-section.tsx';
import { useCurrentEvent } from '../event-page-context.tsx';
import type { Route } from './+types/speaker-proposal.ts';
import { ProposalStatusSection } from './components/proposal-status-section.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const proposal = await SpeakerProposal.for(userId, params.proposal).get();
  return proposal;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const proposal = SpeakerProposal.for(userId, params.proposal);
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
