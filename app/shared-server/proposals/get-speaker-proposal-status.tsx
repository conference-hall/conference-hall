import type { EmailStatus, EventType } from '@prisma/client';
import { ProposalStatus } from '@prisma/client';
import { getCfpState } from '~/utils/event';

export enum SpeakerProposalStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  DeliberationPending = 'DeliberationPending',
  AcceptedByOrganizers = 'AcceptedByOrganizers',
  RejectedByOrganizers = 'RejectedByOrganizers',
  ConfirmedBySpeaker = 'ConfirmedBySpeaker',
  DeclinedBySpeaker = 'DeclinedBySpeaker',
  Unknown = 'Unknown',
}

type ProposalArgs = {
  status: ProposalStatus;
  emailAcceptedStatus: EmailStatus | null;
  emailRejectedStatus: EmailStatus | null;
};

type EventArgs = {
  type: EventType;
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

export function getSpeakerProposalStatus(proposal: ProposalArgs, event: EventArgs): SpeakerProposalStatus {
  const { status, emailAcceptedStatus, emailRejectedStatus } = proposal;
  const { type, cfpStart, cfpEnd } = event;

  const cfpStatus = getCfpState(type, cfpStart, cfpEnd);
  const isCfpOpen = cfpStatus === 'OPENED';
  const isCfpClose = cfpStatus !== 'OPENED';

  const isPendingDeliberation =
    (status === ProposalStatus.SUBMITTED && isCfpClose) ||
    (status === ProposalStatus.ACCEPTED && emailAcceptedStatus === null) ||
    (status === ProposalStatus.REJECTED && emailRejectedStatus === null);

  if (status === ProposalStatus.DRAFT) {
    return SpeakerProposalStatus.Draft;
  } else if (status === ProposalStatus.SUBMITTED && isCfpOpen) {
    return SpeakerProposalStatus.Submitted;
  } else if (isPendingDeliberation) {
    return SpeakerProposalStatus.DeliberationPending;
  } else if (status === ProposalStatus.ACCEPTED && !isPendingDeliberation) {
    return SpeakerProposalStatus.AcceptedByOrganizers;
  } else if (status === ProposalStatus.REJECTED && !isPendingDeliberation) {
    return SpeakerProposalStatus.RejectedByOrganizers;
  } else if (status === ProposalStatus.CONFIRMED) {
    return SpeakerProposalStatus.ConfirmedBySpeaker;
  } else if (status === ProposalStatus.DECLINED) {
    return SpeakerProposalStatus.DeclinedBySpeaker;
  }
  return SpeakerProposalStatus.Unknown;
}
