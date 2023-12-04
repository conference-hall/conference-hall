import type { EventType } from '@prisma/client';
import { ProposalStatus } from '@prisma/client';

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

type EventArgs = {
  type: EventType;
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

export function getSpeakerProposalStatus(
  status: ProposalStatus,
  isResultPublished: boolean,
  event: EventArgs,
): SpeakerProposalStatus {
  const { type, cfpStart, cfpEnd } = event;

  const cfp = new CallForPaper({ type, cfpStart, cfpEnd });

  if (status === ProposalStatus.DRAFT) {
    return SpeakerProposalStatus.Draft;
  } else if (status === ProposalStatus.SUBMITTED && cfp.isOpen) {
    return SpeakerProposalStatus.Submitted;
  } else if (status === ProposalStatus.CONFIRMED) {
    return SpeakerProposalStatus.ConfirmedBySpeaker;
  } else if (status === ProposalStatus.DECLINED) {
    return SpeakerProposalStatus.DeclinedBySpeaker;
  } else if (!isResultPublished) {
    return SpeakerProposalStatus.DeliberationPending;
  } else if (status === ProposalStatus.ACCEPTED && isResultPublished) {
    return SpeakerProposalStatus.AcceptedByOrganizers;
  } else if (status === ProposalStatus.REJECTED && isResultPublished) {
    return SpeakerProposalStatus.RejectedByOrganizers;
  }
  return SpeakerProposalStatus.Unknown;
}
