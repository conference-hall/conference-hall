import type { NotificationType } from '../../../../prisma/generated/client.ts';

export type ProposalEvent = {
  type: 'proposal.submitted' | 'proposal.accepted' | 'proposal.rejected';
  eventId: string;
  proposalId: string;
};

export type NotificationEvent = ProposalEvent;

export const EVENT_NOTIFICATION_TYPE: Record<NotificationEvent['type'], NotificationType> = {
  'proposal.submitted': 'PROPOSAL_SUBMITTED',
  'proposal.accepted': 'PROPOSAL_ACCEPTED',
  'proposal.rejected': 'PROPOSAL_REJECTED',
};
