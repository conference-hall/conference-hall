import { sendEmail } from '~/shared/emails/send-email.job.ts';
import ProposalAcceptedEmail from '~/shared/emails/templates/speakers/proposal-accepted.email.tsx';
import ProposalRejectedEmail from '~/shared/emails/templates/speakers/proposal-rejected.email.tsx';
import SpeakerProposalSubmittedEmail from '~/shared/emails/templates/speakers/proposal-submitted.email.tsx';
import type { ResolvedProposalEvent, ResolvedRecipient } from '../proposal-event.resolver.server.ts';

export async function dispatchEmail(resolved: ResolvedProposalEvent, recipient: ResolvedRecipient): Promise<void> {
  const speaker = [{ email: recipient.email, locale: recipient.locale }];
  const event = {
    id: resolved.data.eventId,
    slug: resolved.data.eventSlug,
    name: resolved.data.eventName,
    logo: resolved.data.eventLogo,
  };

  switch (resolved.type) {
    case 'proposal.submitted': {
      await sendEmail.trigger(
        SpeakerProposalSubmittedEmail.buildPayload(
          { event, proposal: { title: resolved.data.proposalTitle, speakers: speaker } },
          recipient.locale,
        ),
      );
      break;
    }
    case 'proposal.accepted': {
      await sendEmail.trigger(
        ProposalAcceptedEmail.buildPayload(
          {
            event,
            proposal: {
              id: resolved.data.proposalId,
              title: resolved.data.proposalTitle,
              formats: resolved.data.formats,
              speakers: speaker,
            },
          },
          recipient.locale,
        ),
      );
      break;
    }
    case 'proposal.rejected': {
      await sendEmail.trigger(
        ProposalRejectedEmail.buildPayload(
          { event, proposal: { title: resolved.data.proposalTitle, speakers: speaker } },
          recipient.locale,
        ),
      );
      break;
    }
  }
}
