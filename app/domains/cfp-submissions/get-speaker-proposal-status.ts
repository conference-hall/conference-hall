import { ConfirmationStatus, DeliberationStatus } from '@prisma/client';

export enum SpeakerProposalStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  DeliberationPending = 'DeliberationPending',
  AcceptedByOrganizers = 'AcceptedByOrganizers',
  RejectedByOrganizers = 'RejectedByOrganizers',
  ConfirmedBySpeaker = 'ConfirmedBySpeaker',
  DeclinedBySpeaker = 'DeclinedBySpeaker',
}

export function getSpeakerProposalStatus(
  deliberationStatus: DeliberationStatus,
  confirmationStatus: ConfirmationStatus,
  isDraft: boolean,
  isResultPublished: boolean,
): SpeakerProposalStatus {
  if (isDraft) return SpeakerProposalStatus.Draft;

  if (!isResultPublished) return SpeakerProposalStatus.DeliberationPending;

  if (confirmationStatus === ConfirmationStatus.CONFIRMED) return SpeakerProposalStatus.ConfirmedBySpeaker;

  if (confirmationStatus === ConfirmationStatus.DECLINED) return SpeakerProposalStatus.DeclinedBySpeaker;

  if (deliberationStatus === DeliberationStatus.ACCEPTED) return SpeakerProposalStatus.AcceptedByOrganizers;

  if (deliberationStatus === DeliberationStatus.REJECTED) return SpeakerProposalStatus.RejectedByOrganizers;

  return SpeakerProposalStatus.DeliberationPending;
}
