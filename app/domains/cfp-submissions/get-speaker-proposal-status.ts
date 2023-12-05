import type { EventType } from '@prisma/client';
import { ConfirmationStatus, DeliberationStatus } from '@prisma/client';

import { CallForPaper } from '../shared/CallForPaper';

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
  deliberationStatus: DeliberationStatus;
  confirmationStatus: ConfirmationStatus;
  isDraft: boolean;
};

type EventArgs = {
  type: EventType;
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

export function getSpeakerProposalStatus(
  proposal: ProposalArgs,
  event: EventArgs,
  isResultPublished: boolean,
): SpeakerProposalStatus {
  const { deliberationStatus, confirmationStatus, isDraft } = proposal;
  const { type, cfpStart, cfpEnd } = event;

  const cfp = new CallForPaper({ type, cfpStart, cfpEnd });

  if (isDraft) {
    return SpeakerProposalStatus.Draft;
  } else if (confirmationStatus === ConfirmationStatus.CONFIRMED) {
    return SpeakerProposalStatus.ConfirmedBySpeaker;
  } else if (confirmationStatus === ConfirmationStatus.DECLINED) {
    return SpeakerProposalStatus.DeclinedBySpeaker;
  } else if (deliberationStatus === DeliberationStatus.ACCEPTED && isResultPublished) {
    return SpeakerProposalStatus.AcceptedByOrganizers;
  } else if (deliberationStatus === DeliberationStatus.REJECTED && isResultPublished) {
    return SpeakerProposalStatus.RejectedByOrganizers;
  } else if (!cfp.isOpen) {
    return SpeakerProposalStatus.DeliberationPending;
  }
  return SpeakerProposalStatus.Submitted;
}
